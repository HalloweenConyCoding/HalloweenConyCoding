/* ============================================
   CONY Workspace - shared UI helpers
   Direct-script compatible; no build step.
   ============================================ */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
  }

  function showToast(message, options = {}) {
    const toast = document.getElementById(options.id || 'toast');
    if (!toast) return;

    toast.textContent = message == null ? '' : String(message);
    toast.classList.add('show');

    if (toast._workspaceToastTimer) {
      clearTimeout(toast._workspaceToastTimer);
    }

    const duration = typeof options.duration === 'number' ? options.duration : 2000;
    toast._workspaceToastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast._workspaceToastTimer = null;
    }, duration);
  }

  function describeSaveResult(action, result, options = {}) {
    if (result && result.source === 'file') {
      return options.file || `${action} saved to disk`;
    }
    if (result && result.status === 'canceled') {
      return options.canceled || `${action} buffered. Connect/save later.`;
    }
    if (result && result.reason === 'permission-denied') {
      return options.permissionDenied || `${action} buffered. Grant save permission to write to disk.`;
    }
    return options.buffered || `${action} buffered in browser`;
  }

  function formatSaveStamp(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date();
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} ${time}`;
  }

  function setSaveIndicator(state, label, options = {}) {
    const el = document.getElementById(options.id || 'save-status');
    if (!el) return;

    if (options.unhide) el.hidden = false;
    el.classList.remove('is-saving', 'is-saved', 'is-buffered', 'is-error');
    if (state) el.classList.add(String(state).startsWith('is-') ? state : `is-${state}`);

    const labelEl = el.querySelector(options.labelSelector || '.save-status-label');
    if (labelEl && label) labelEl.textContent = label;
  }

  function reflectSaveIndicator(result, options = {}) {
    const onDisk = result && result.source === 'file';
    const savedStamp = result && result.savedAt ? result.savedAt : undefined;
    const savedLabel = options.savedLabel || `Saved ${formatSaveStamp(savedStamp)}`;
    const bufferedLabel = options.bufferedLabel || 'Buffered - Save to write';
    setSaveIndicator(onDisk ? 'saved' : 'buffered', onDisk ? savedLabel : bufferedLabel, options);
  }

  function syncSaveIndicatorFromWorkspace(options = {}) {
    if (!window.Workspace || typeof window.Workspace.getState !== 'function') return;

    const snapshot = window.Workspace.getState();
    const savedAt = snapshot && snapshot.data && snapshot.data.meta ? snapshot.data.meta.savedAt : '';
    const bufferedLabel = options.bufferedLabel || 'Buffered - Save to write';
    const fallbackLabel = options.fallbackLabel || bufferedLabel;

    if (snapshot && snapshot.dirty) {
      setSaveIndicator('buffered', bufferedLabel, options);
      return;
    }

    if (savedAt && snapshot.writeReady) {
      setSaveIndicator('saved', options.savedLabel || `Saved ${formatSaveStamp(savedAt)}`, options);
      return;
    }

    setSaveIndicator('buffered', fallbackLabel, options);
  }

  function setTextStatus(id, message, state) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message == null ? '' : String(message);
    if (state != null && typeof el.setAttribute === 'function') {
      el.setAttribute('data-state', state);
    }
  }

  window.WorkspaceUI = Object.assign(window.WorkspaceUI || {}, {
    escapeHtml,
    showToast,
    describeSaveResult,
    formatSaveStamp,
    setSaveIndicator,
    reflectSaveIndicator,
    syncSaveIndicatorFromWorkspace,
    setTextStatus
  });
}());
