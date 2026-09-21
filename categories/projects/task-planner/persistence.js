(function () {
  'use strict';

  var DB_NAME = 'public-workspace-v1';
  var STORE_NAME = 'handles';
  var HANDLE_KEY = 'workspace-data';
  var WRITE_LOCK_MESSAGE = 'Connect workspace file with write permission to edit.';
  var listeners = new Set();
  var uiNodes = null;
  var state = {
    data: null,
    dirty: false,
    handle: null,
    permission: 'unknown',
    supportsFileSystemAccess: typeof window.showOpenFilePicker === 'function',
    indexedDbMode: 'unknown',
    status: { kind: 'loading', message: 'Loading workspace data...' },
    hint: '',
    lastError: '',
    initialized: false,
    initPromise: null,
    mutationGateInstalled: false
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function createDefaultSections() {
    return {
      tasks: [],
      calendarNotes: {}
    };
  }

  function canonicalizeSections(raw) {
    var input = isPlainObject(raw) ? clone(raw) : {};
    input.tasks = Array.isArray(input.tasks) ? input.tasks : [];
    input.calendarNotes = isPlainObject(input.calendarNotes) ? input.calendarNotes : {};
    return input;
  }

  function createDefaultData() {
    return {
      meta: {
        version: 1,
        savedAt: '',
        savedBy: 'PUBLIC WORKSPACE'
      },
      sections: createDefaultSections()
    };
  }

  function canonicalizeData(raw) {
    var safe = isPlainObject(raw) ? raw : {};
    var meta = isPlainObject(safe.meta) ? clone(safe.meta) : {};
    meta.version = Number.isFinite(meta.version) ? meta.version : 1;
    meta.savedAt = typeof meta.savedAt === 'string' ? meta.savedAt : '';
    meta.savedBy = typeof meta.savedBy === 'string' && meta.savedBy.trim()
      ? meta.savedBy.trim()
      : 'PUBLIC WORKSPACE';
    return {
      meta: meta,
      sections: canonicalizeSections(safe.sections)
    };
  }

  function serializeData(data) {
    return 'window.WORKSPACE_DATA = ' + JSON.stringify(canonicalizeData(data), null, 2) + ';\n';
  }

  function parseWorkspaceScript(text) {
    var match = String(text || '').match(/^\s*window\.WORKSPACE_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
    if (!match) {
      throw new Error('Selected file does not assign window.WORKSPACE_DATA');
    }
    return canonicalizeData(JSON.parse(match[1]));
  }

  function createLocalIsoString(date) {
    var offset = -date.getTimezoneOffset();
    var sign = offset >= 0 ? '+' : '-';
    var absolute = Math.abs(offset);
    var hours = String(Math.floor(absolute / 60)).padStart(2, '0');
    var minutes = String(absolute % 60).padStart(2, '0');
    return date.getFullYear()
      + '-' + String(date.getMonth() + 1).padStart(2, '0')
      + '-' + String(date.getDate()).padStart(2, '0')
      + 'T' + String(date.getHours()).padStart(2, '0')
      + ':' + String(date.getMinutes()).padStart(2, '0')
      + ':' + String(date.getSeconds()).padStart(2, '0')
      + sign + String(Math.floor(absolute / 60)).padStart(2, '0')
      + ':' + minutes;
  }

  function setStatus(kind, message) {
    state.status = { kind: kind, message: message };
    notify();
  }

  function isWriteReady() {
    return Boolean(state.supportsFileSystemAccess && state.handle && state.permission === 'granted');
  }

  function getSectionsSnapshot() {
    return clone((state.data || createDefaultData()).sections);
  }

  function getState() {
    return {
      data: clone(state.data || createDefaultData()),
      dirty: state.dirty,
      hasHandle: Boolean(state.handle),
      writeReady: isWriteReady(),
      supportsFileSystemAccess: state.supportsFileSystemAccess,
      indexedDbMode: state.indexedDbMode,
      permission: state.permission,
      status: Object.assign({}, state.status),
      hint: state.hint,
      lastError: state.lastError
    };
  }

  function notify() {
    var snapshot = getState();
    listeners.forEach(function (listener) {
      listener(snapshot);
    });
    renderControls(snapshot);
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return function () {};
    }
    listeners.add(listener);
    listener(getState());
    return function () {
      listeners.delete(listener);
    };
  }

  function closestElement(target, selector) {
    if (!target) return null;
    var element = target.nodeType === 1 ? target : target.parentElement;
    if (!element || typeof element.closest !== 'function') return null;
    try {
      return element.closest(selector);
    } catch (error) {
      return null;
    }
  }

  function elementIdentity(element) {
    if (!element) return '';
    return [
      element.id || '',
      typeof element.className === 'string' ? element.className : '',
      element.getAttribute && (element.getAttribute('data-action') || ''),
      element.getAttribute && (element.getAttribute('aria-label') || '')
    ].join(' ').toLowerCase();
  }

  function isReadOnlyControl(element) {
    if (!element) return true;
    if (closestElement(element, '.workspace-persist-shell, [data-workspace-readonly], a')) return true;
    var tagName = String(element.tagName || '').toLowerCase();
    var type = String(element.getAttribute && element.getAttribute('type') || '').toLowerCase();
    var identity = elementIdentity(element);
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || element.isContentEditable) {
      return type === 'search' || /(^|[-_ ])(search|query|jump|cmdk)([-_ ]|$)/.test(identity);
    }
    if (tagName !== 'button' && !(tagName === 'input' && ['button', 'submit', 'reset'].includes(type))) {
      return false;
    }
    if (element.getAttribute && (element.getAttribute('role') === 'tab' || element.getAttribute('data-view'))) {
      return true;
    }
    return /(^|[-_ ])(prev|next|today|view|sort|filter|clear|close|cancel|collapse|expand|zoom|reset|switch|toggle|nav|menu|tab|search|query|jump|cmdk|quick-open|page-exit|reload|connect|save|label|template)([-_ ]|$)/.test(identity);
  }

  function isMutationTarget(target, eventType) {
    var element = target && target.nodeType === 1 ? target : target && target.parentElement;
    if (!element || closestElement(element, '.workspace-persist-shell, [data-workspace-readonly]')) return false;
    if (eventType === 'submit') return !closestElement(element, '[data-workspace-readonly]');
    var control = closestElement(element, 'input, textarea, select, button, [contenteditable="true"]');
    if (!control || isReadOnlyControl(control)) return false;
    if (eventType === 'click') {
      return ['button', 'input', 'select'].includes(String(control.tagName || '').toLowerCase());
    }
    return true;
  }

  function announceMutationBlocked() {
    state.hint = WRITE_LOCK_MESSAGE;
    if (uiNodes && uiNodes.panel && uiNodes.toggle) {
      uiNodes.panel.classList.add('is-expanded');
      uiNodes.toggle.setAttribute('aria-expanded', 'true');
    }
    if (uiNodes && uiNodes.lockWarning) uiNodes.lockWarning.hidden = false;
    notify();
  }

  function guardMutation() {
    if (isWriteReady()) return true;
    announceMutationBlocked();
    return false;
  }

  function blockMutationEvent(event) {
    if (isWriteReady() || !isMutationTarget(event && event.target, event && event.type)) return;
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (event && typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    announceMutationBlocked();
  }

  function syncMutationControls(view) {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
    var locked = !view.writeReady;
    var controls = document.querySelectorAll('input, textarea, select, button, [contenteditable="true"]');
    Array.prototype.forEach.call(controls, function (control) {
      if (isReadOnlyControl(control)) return;
      var tagName = String(control.tagName || '').toLowerCase();
      if (!locked) {
        if (control.getAttribute('data-workspace-gate-disabled') === 'true') {
          control.disabled = false;
          control.removeAttribute('data-workspace-gate-disabled');
        }
        if (control.getAttribute('data-workspace-gate-readonly') === 'true') {
          control.readOnly = false;
          control.removeAttribute('data-workspace-gate-readonly');
        }
        return;
      }
      if (tagName === 'input' || tagName === 'textarea') {
        control.readOnly = true;
        control.setAttribute('data-workspace-gate-readonly', 'true');
      } else if (tagName === 'select' || tagName === 'button') {
        control.disabled = true;
        control.setAttribute('data-workspace-gate-disabled', 'true');
      } else if (control.isContentEditable) {
        control.setAttribute('contenteditable', 'false');
      }
    });
  }

  function installMutationGate() {
    if (state.mutationGateInstalled || typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    ['beforeinput', 'input', 'change', 'click', 'submit', 'keydown'].forEach(function (eventType) {
      document.addEventListener(eventType, blockMutationEvent, true);
    });
    state.mutationGateInstalled = true;
  }

  function getIndicator(view) {
    if (view.status.kind === 'error') return 'red';
    if (view.writeReady) return 'green';
    if (view.hasHandle) return 'amber';
    return 'red';
  }

  function ensureControls() {
    if (uiNodes || typeof document === 'undefined' || !document.body) return uiNodes;

    var lockWarning = document.createElement('div');
    lockWarning.className = 'workspace-persist-lock-warning';
    lockWarning.hidden = true;
    lockWarning.setAttribute('role', 'alert');
    lockWarning.innerHTML = '<div class="workspace-persist-lock-card">'
      + '<div class="workspace-persist-lock-strip">EDITING LOCKED</div>'
      + '<div class="workspace-persist-lock-body"><span class="workspace-persist-lock-dot"></span>'
      + '<span class="workspace-persist-lock-title">WORKSPACE NOT CONNECTED</span></div>'
      + '<p class="workspace-persist-lock-message">Editing is locked. Connect your workspace-data.js file to edit this page.</p>'
      + '<div class="workspace-persist-lock-hint">Click anywhere to dismiss</div></div>';
    document.body.appendChild(lockWarning);
    lockWarning.addEventListener('click', function () { lockWarning.hidden = true; });

    var panel = document.createElement('div');
    panel.className = 'workspace-persist-shell workspace-persist-shell-floating';
    panel.innerHTML = '<button type="button" class="workspace-persist-toggle" data-action="toggle" aria-expanded="false" aria-label="Workspace data not connected">'
      + '<span class="workspace-persist-dot" data-indicator="red" data-connected="false"></span></button>'
      + '<div class="workspace-persist-expanded"><div class="workspace-persist-status-row">'
      + '<div class="workspace-persist-copy"><div class="workspace-persist-label">Workspace Data</div>'
      + '<div class="workspace-persist-status-text">Not connected</div></div></div>'
      + '<div class="workspace-persist-meta"></div><div class="workspace-persist-actions">'
      + '<button type="button" class="workspace-persist-btn workspace-persist-btn-primary" data-action="connect">Connect</button>'
      + '<button type="button" class="workspace-persist-btn" data-action="save">Save</button></div>'
      + '<div class="workspace-persist-alert" hidden></div></div>';
    document.body.appendChild(panel);

    document.addEventListener('click', function (event) {
      if (!panel.classList.contains('is-expanded') || panel.contains(event.target)) return;
      panel.classList.remove('is-expanded');
      panel.querySelector('.workspace-persist-toggle').setAttribute('aria-expanded', 'false');
    });

    panel.addEventListener('click', function (event) {
      var actionNode = event.target.closest ? event.target.closest('[data-action]') : null;
      var action = actionNode && actionNode.getAttribute('data-action');
      if (action === 'toggle') {
        var expanded = !panel.classList.contains('is-expanded');
        panel.classList.toggle('is-expanded', expanded);
        actionNode.setAttribute('aria-expanded', String(expanded));
      } else if (action === 'connect') {
        void connectFile({ pickNew: true });
      } else if (action === 'save') {
        void saveToDisk();
      }
    });

    uiNodes = {
      panel: panel,
      lockWarning: lockWarning,
      dot: panel.querySelector('.workspace-persist-dot'),
      toggle: panel.querySelector('.workspace-persist-toggle'),
      statusText: panel.querySelector('.workspace-persist-status-text'),
      meta: panel.querySelector('.workspace-persist-meta'),
      alert: panel.querySelector('.workspace-persist-alert'),
      connectButton: panel.querySelector('[data-action="connect"]'),
      saveButton: panel.querySelector('[data-action="save"]')
    };
    return uiNodes;
  }

  function renderControls(view) {
    var nodes = ensureControls();
    if (!nodes) return;
    var indicator = getIndicator(view);
    nodes.panel.dataset.kind = view.status.kind || 'not-connected';
    nodes.panel.dataset.writeReady = view.writeReady ? 'true' : 'false';
    nodes.dot.dataset.indicator = indicator;
    nodes.dot.dataset.connected = view.writeReady ? 'true' : 'false';
    nodes.statusText.textContent = view.status.message || 'Not connected';
    nodes.meta.textContent = view.writeReady
      ? 'connected · edits save to your selected file'
      : view.hasHandle
        ? 'file selected · write permission required'
        : 'not connected · choose workspace-data.js';
    nodes.alert.hidden = !view.lastError && !view.hint;
    nodes.alert.textContent = view.lastError || view.hint || '';
    nodes.connectButton.disabled = !view.supportsFileSystemAccess;
    nodes.saveButton.disabled = !view.writeReady;
    nodes.toggle.title = view.writeReady ? 'Workspace data connected' : 'Workspace data not connected. Click to connect.';
    nodes.toggle.setAttribute('aria-label', view.writeReady ? 'Workspace data connected' : 'Workspace data not connected. Click to connect.');
    syncMutationControls(view);
  }

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      if (typeof window.indexedDB === 'undefined') {
        reject(new Error('IndexedDB is unavailable'));
        return;
      }
      var request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function (event) {
        if (!event.target.result.objectStoreNames.contains(STORE_NAME)) {
          event.target.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function (event) { resolve(event.target.result); };
      request.onerror = function () { reject(request.error || new Error('IndexedDB open failed')); };
    });
  }

  function readStoredHandle() {
    return openDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(HANDLE_KEY);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB read failed')); };
      }).finally(function () { db.close(); });
    });
  }

  function storeHandle(handle) {
    return openDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(handle, HANDLE_KEY);
        request.onsuccess = function () { resolve(); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB write failed')); };
      }).finally(function () { db.close(); });
    });
  }

  function queryPermission(handle) {
    if (!handle || typeof handle.queryPermission !== 'function') return Promise.resolve('unknown');
    return Promise.resolve(handle.queryPermission({ mode: 'readwrite' })).catch(function () { return 'unknown'; });
  }

  function requestPermission(handle) {
    if (!handle || typeof handle.requestPermission !== 'function') return Promise.resolve('denied');
    return Promise.resolve(handle.requestPermission({ mode: 'readwrite' })).catch(function () { return 'denied'; });
  }

  function readHandleData(handle) {
    return handle.getFile().then(function (file) {
      return file.text().then(parseWorkspaceScript);
    });
  }

  function applyLoadedData(data, message) {
    state.data = canonicalizeData(data);
    state.dirty = false;
    state.hint = '';
    state.lastError = '';
    setStatus('connected', message || 'Workspace data connected.');
  }

  function applyBaseStatus() {
    if (!state.supportsFileSystemAccess) {
      setStatus('unsupported', 'Read-only browser. Use Chrome or Edge to connect a file.');
    } else if (!state.handle) {
      setStatus('not-connected', 'Connect workspace-data.js to enable editing.');
    } else if (state.permission === 'granted') {
      setStatus('connected', 'Workspace data connected.');
    } else {
      setStatus('needs-permission', WRITE_LOCK_MESSAGE);
    }
  }

  function restoreStoredHandle() {
    if (typeof window.indexedDB === 'undefined') {
      state.indexedDbMode = 'memory-only';
      return Promise.resolve();
    }
    return readStoredHandle().then(function (handle) {
      state.indexedDbMode = 'persistent';
      if (!handle) return;
      state.handle = handle;
      return queryPermission(handle).then(function (permission) {
        state.permission = permission;
        if (permission !== 'granted') return;
        return readHandleData(handle).then(function (data) {
          state.data = data;
        });
      });
    }).catch(function () {
      state.indexedDbMode = 'memory-only';
      state.handle = null;
    });
  }

  function ensureReady() {
    if (state.data) return Promise.resolve();
    state.data = createDefaultData();
    return restoreStoredHandle().then(function () {
      installMutationGate();
      ensureControls();
      state.initialized = true;
      applyBaseStatus();
    });
  }

  function init() {
    if (!state.initPromise) {
      state.initPromise = ensureReady();
    }
    return state.initPromise;
  }

  function showWorkspacePicker() {
    return window.showOpenFilePicker({
      id: 'public-workspace-data',
      multiple: false,
      excludeAcceptAllOption: false,
      types: [{ description: 'Workspace data file', accept: { 'application/javascript': ['.js'] } }]
    });
  }

  function connectFile() {
    return init().then(function () {
      if (!state.supportsFileSystemAccess) {
        applyBaseStatus();
        return { ok: false, status: 'blocked', reason: 'unsupported' };
      }
      return showWorkspacePicker().then(function (handles) {
        var handle = handles && handles[0];
        if (!handle) return { ok: false, status: 'canceled', reason: 'no-handle-selected' };
        return queryPermission(handle).then(function (permission) {
          return (permission === 'granted' ? Promise.resolve(permission) : requestPermission(handle)).then(function (writePermission) {
            if (writePermission !== 'granted') {
              state.handle = handle;
              state.permission = writePermission;
              setStatus('needs-permission', WRITE_LOCK_MESSAGE);
              return { ok: false, status: 'blocked', reason: 'permission-denied' };
            }
            return readHandleData(handle).then(function (data) {
              state.handle = handle;
              state.permission = 'granted';
              return storeHandle(handle).catch(function () {}).then(function () {
                applyLoadedData(data, 'Workspace data connected.');
                return { ok: true, status: 'connected', source: 'file' };
              });
            });
          });
        });
      }).catch(function (error) {
        if (error && error.name === 'AbortError') {
          applyBaseStatus();
          return { ok: false, status: 'canceled', reason: 'picker-canceled' };
        }
        state.lastError = error && error.message ? error.message : 'Selected file was not accepted.';
        setStatus('error', 'Selected file is not a valid workspace-data.js file.');
        return { ok: false, status: 'blocked', reason: 'connect-failed' };
      });
    });
  }

  function refreshWritePermission() {
    return init().then(function () {
      if (!state.handle) return false;
      return queryPermission(state.handle).then(function (permission) {
        state.permission = permission;
        applyBaseStatus();
        return isWriteReady();
      });
    });
  }

  function buildResult(source, status, extra) {
    return Object.assign({
      data: getSectionsSnapshot(),
      source: source || (state.handle ? 'file' : 'empty'),
      status: status || (state.dirty ? 'buffered' : 'saved'),
      dirty: state.dirty,
      hasHandle: Boolean(state.handle),
      permission: state.permission,
      savedAt: state.data && state.data.meta ? state.data.meta.savedAt : ''
    }, extra || {});
  }

  function loadWorkspaceData() {
    return init().then(function () {
      return buildResult(state.handle ? 'file' : 'empty', state.handle ? 'saved' : 'locked');
    });
  }

  function readLocalSnapshot() {
    return getSectionsSnapshot();
  }

  function writeSection(section, value) {
    if (!guardMutation()) return buildResult('empty', 'blocked', { reason: 'not-connected' });
    state.data.sections[section] = clone(value);
    state.dirty = true;
    notify();
    return buildResult('buffer', 'buffered');
  }

  function saveSection(section, value) {
    if (!guardMutation()) return Promise.resolve(buildResult('empty', 'blocked', { reason: 'not-connected' }));
    writeSection(section, value);
    return flushToDisk();
  }

  function autoSaveSection(section, value) {
    return saveSection(section, value);
  }

  function saveToDisk() {
    return init().then(function () {
      if (!isWriteReady()) {
        announceMutationBlocked();
        return buildResult('empty', 'blocked', { reason: 'not-connected' });
      }
      return flushToDisk();
    });
  }

  function flushToDisk() {
    var dataToWrite = canonicalizeData(state.data);
    dataToWrite.meta.savedAt = createLocalIsoString(new Date());
    dataToWrite.meta.savedBy = dataToWrite.meta.savedBy || 'PUBLIC WORKSPACE';
    state.data = dataToWrite;
    return state.handle.createWritable().then(function (writable) {
      return Promise.resolve(writable.write(serializeData(state.data)))
        .then(function () { return writable.close(); })
        .then(function () {
          state.dirty = false;
          setStatus('connected', 'Saved to workspace-data.js.');
          return buildResult('file', 'saved');
        });
    }).catch(function (error) {
      state.lastError = error && error.message ? error.message : 'Could not save workspace-data.js.';
      setStatus('error', 'Could not save workspace-data.js.');
      return buildResult('buffer', 'blocked', { reason: 'save-failed' });
    });
  }

  var api = {
    ready: init,
    loadWorkspaceData: loadWorkspaceData,
    readLocalSnapshot: readLocalSnapshot,
    saveSection: saveSection,
    autoSaveSection: autoSaveSection,
    saveToDisk: saveToDisk,
    guardMutation: guardMutation,
    refreshWritePermission: refreshWritePermission,
    subscribe: subscribe
  };

  window.PublicWorkspacePersistenceFormat = {
    createDefaultData: createDefaultData,
    canonicalizeData: canonicalizeData,
    serializeData: serializeData,
    parseWorkspaceScript: parseWorkspaceScript
  };
  window.workspacePersistence = api;
  window.WorkspacePersistence = api;
  window.Workspace = {
    ready: init,
    getState: getState,
    canWrite: isWriteReady,
    guardMutation: guardMutation,
    connectFile: connectFile,
    connect: function () { return connectFile().then(function (result) { return result.ok; }); },
    getData: function () { return clone(state.data || createDefaultData()); },
    subscribe: subscribe,
    save: saveToDisk,
    flushToDisk: saveToDisk,
    serializeData: serializeData
  };

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { void init(); }, { once: true });
  } else {
    void init();
  }
}());
