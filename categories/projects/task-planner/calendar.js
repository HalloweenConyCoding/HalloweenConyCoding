/* ============================================
   WorkspaceV3 - Calendar JS
   ============================================ */
/* global gsap, CustomEase, workspacePersistence */

gsap.registerPlugin(CustomEase);
CustomEase.create('snappy', 'M0,0 C0.165,0.84 0.44,1 1,1');
try {
  if (typeof CustomEase !== 'undefined' && typeof CustomEase.create === 'function') {
    CustomEase.create('pop', 'M0,0 C0.34,1.56 0.64,1 1,1');
  }
} catch (err) { /* headless guard */ }

/* ── Motion helpers (all gsap calls guarded for the verify fake DOM) ── */
function gsapHas(method) {
  return typeof gsap !== 'undefined' && gsap && typeof gsap[method] === 'function';
}
function gsapSet(target, vars) { if (gsapHas('set')) { try { gsap.set(target, vars); } catch (err) { /* noop */ } } }
function gsapFromTo(target, from, to) {
  if (gsapHas('fromTo')) { try { return gsap.fromTo(target, from, to); } catch (err) { /* noop */ } }
  return null;
}
function gsapTo(target, vars) {
  if (gsapHas('to')) { try { return gsap.to(target, vars); } catch (err) { /* noop */ } }
  return null;
}
function gsapKill(target) { if (gsapHas('killTweensOf')) { try { gsap.killTweensOf(target); } catch (err) { /* noop */ } } }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Fixed tag set (keys preserved for backward-compat with existing events; only
// labels changed). Sorted alphabetically by visible label.
const TAGS = [
  { key: 'exercise', label: 'Exercise' },
  { key: 'note', label: 'Holiday' },
  { key: 'personal', label: 'Personal' },
  { key: 'site', label: 'Study' },
  { key: 'deadline', label: 'Training' },
  { key: 'work', label: 'Work' }
].sort((a, b) => a.label.localeCompare(b.label));
const TAG_KEYS = TAGS.map((tag) => tag.key);

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let notes = {};
let tasks = [];
let viewMode = 'month';
let gridHasAnimated = false;
let prefersReducedMotion = false;
try {
  prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
} catch (err) { prefersReducedMotion = false; }

/* Popover state */
let popover = null;
let popoverOverlay = null;
let popoverCtx = null; // { dateKey, editingId }
let popoverClosing = null; // { popover, overlay } currently animating out
const {
  describeSaveResult,
  reflectSaveIndicator,
  setSaveIndicator,
  showToast
} = window.WorkspaceUI;

function queryAll(selector) {
  if (typeof document.querySelectorAll === 'function') {
    return document.querySelectorAll(selector);
  }
  return [];
}

function setStyleVar(el, name, value) {
  if (el && el.style && typeof el.style.setProperty === 'function') {
    el.style.setProperty(name, value);
  }
}

window.showToast = showToast;

/* ── Delegated button press feedback ───────────────
   One document-level listener scales any pressed calendar button.
   CSS :active already covers most cases; this adds it for body-level
   popover buttons and keeps the feel consistent. */
const PRESS_SELECTOR = '.cal-nav-btn, .cal-view-btn, .cal-quick-add, .cal-more-chip, .cal-week-col-add, .cal-popover .btn';
function wirePressFeedback() {
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
  const press = (e) => {
    if (prefersReducedMotion || !e.target || typeof e.target.closest !== 'function') return;
    const btn = e.target.closest(PRESS_SELECTOR);
    if (!btn) return;
    gsapTo(btn, { scale: 0.94, duration: 0.08, ease: 'power2.out' });
  };
  const release = (e) => {
    if (prefersReducedMotion || !e.target || typeof e.target.closest !== 'function') return;
    const btn = e.target.closest(PRESS_SELECTOR);
    if (!btn) return;
    gsapTo(btn, { scale: 1, duration: 0.28, ease: 'pop' });
  };
  try {
    document.addEventListener('pointerdown', press, true);
    document.addEventListener('pointerup', release, true);
    document.addEventListener('pointercancel', release, true);
  } catch (err) { /* headless guard */ }
}
wirePressFeedback();

function makeEventId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function keyToDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`);
}

function getSelectedKey() {
  return selectedDate ? toKey(selectedDate.y, selectedDate.m, selectedDate.d) : '';
}

function selectedDateFromKey(dateKey) {
  const d = keyToDate(dateKey);
  return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
}

function normalizeTag(tag) {
  if (typeof tag !== 'string' || !tag) return 'note';
  if (TAG_KEYS.includes(tag)) return tag;
  return 'note';
}

function normalizeTime(time) {
  return typeof time === 'string' && /^\d{2}:\d{2}$/.test(time) ? time : '';
}

function normalizeNote(note) {
  return typeof note === 'string' ? note.trim() : '';
}

function normalizeEvent(value, fallbackTitle) {
  const raw = value && typeof value === 'object' ? value : {};
  const title = typeof raw.title === 'string' && raw.title.trim()
    ? raw.title.trim()
    : String(fallbackTitle || '').trim();
  if (!title) return null;
  const event = {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeEventId(),
    title,
    time: normalizeTime(raw.time),
    tag: normalizeTag(raw.tag)
  };
  const note = normalizeNote(raw.note);
  if (note) event.note = note;
  return event;
}

function migrateCalendarNotes(rawNotes) {
  const input = rawNotes && typeof rawNotes === 'object' ? rawNotes : {};
  const migrated = {};

  Object.entries(input).forEach(([dateKey, value]) => {
    if (Array.isArray(value)) {
      migrated[dateKey] = value.map((item) => normalizeEvent(item)).filter(Boolean);
      return;
    }

    if (typeof value === 'string') {
      const title = value.trim();
      migrated[dateKey] = title ? [{ id: makeEventId(), title, time: '', tag: 'note' }] : [];
      return;
    }

    const event = normalizeEvent(value);
    migrated[dateKey] = event ? [event] : [];
  });

  return migrated;
}

function getEventsForDate(dateKey) {
  return Array.isArray(notes[dateKey]) ? notes[dateKey] : [];
}

function getTasksForDate(dateKey) {
  return tasks.filter((task) => task && task.due === dateKey);
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const timeA = a.time || '99:99';
    const timeB = b.time || '99:99';
    return timeA.localeCompare(timeB) || a.title.localeCompare(b.title);
  });
}

function findEvent(eventId) {
  for (const dateKey of Object.keys(notes)) {
    const list = getEventsForDate(dateKey);
    const event = list.find((item) => item.id === eventId);
    if (event) return { dateKey, event };
  }
  return null;
}

function tagByKey(key) {
  return TAGS.find((tag) => tag.key === key) || null;
}

function tagLabel(tagKey) {
  return tagByKey(tagKey)?.label || 'Holiday';
}

// Resolve a tag's color from its CSS variable (usable inline; var() resolves).
function tagColor(tagKey) {
  return TAGS.some((t) => t.key === tagKey) ? `var(--cal-tag-${tagKey})` : 'var(--cal-tag-note)';
}

function createTagDot(tagKey) {
  const dot = document.createElement('span');
  dot.className = `cal-tag-dot tag-${normalizeTag(tagKey)}`;
  return dot;
}

async function persistCalendar(action) {
  setSaveIndicator('saving', 'Saving…');
  let result = await workspacePersistence.autoSaveSection('calendarNotes', notes);
  if (
    result &&
    result.source !== 'file' &&
    result.hasHandle &&
    result.reason === 'permission-not-granted'
  ) {
    result = await workspacePersistence.saveSection('calendarNotes', notes, { disk: true });
  }
  showToast(describeSaveResult(action, result, { canceled: `${action} buffered. Save again when ready.` }));
  reflectSaveIndicator(result, { bufferedLabel: 'Buffered - Save to write' });
  return result;
}

/* ── Chips ─────────────────────────────────────── */
function createEventChip(event, dateKey) {
  const chip = document.createElement('div');
  chip.className = 'cal-chip';
  chip.dataset.tag = normalizeTag(event.tag);
  setStyleVar(chip, '--chip-color', tagColor(normalizeTag(event.tag)));
  chip.dataset.id = event.id;
  chip.setAttribute('draggable', 'true');
  chip.setAttribute('tabindex', '0');
  chip.title = `${event.time ? event.time + ' · ' : ''}${event.title}`;

  if (event.time) {
    const t = document.createElement('span');
    t.className = 'cal-chip-time';
    t.textContent = event.time;
    chip.appendChild(t);
  }
  const label = document.createElement('span');
  label.textContent = event.title;
  chip.appendChild(label);

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    openPopover({ dateKey, editingId: event.id, anchor: chip });
  });

  chip.addEventListener('dragstart', (e) => {
    chip.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', event.id);
    }
    window._calDragId = event.id;
  });
  chip.addEventListener('dragend', () => {
    chip.classList.remove('dragging');
    window._calDragId = null;
    clearDropTargets();
  });

  return chip;
}

// Map a task's kanban column to its calendar status glyph + label.
function taskStatusMeta(col) {
  if (col === 'done') return { key: 'done', glyph: '✓', label: 'Done' };
  if (col === 'progress') return { key: 'progress', glyph: '◐', label: 'In progress' };
  return { key: 'todo', glyph: '○', label: 'Waiting' };
}

function createTaskPill(task) {
  const pill = document.createElement('div');
  pill.className = 'cal-task-pill';
  const status = taskStatusMeta(task && task.col);
  pill.dataset.status = status.key; // CSS ::before paints the matching glyph
  pill.textContent = task.title || 'Task';
  pill.title = `${status.label} task: ${task.title || ''}`;
  return pill;
}

function clearDropTargets() {
  queryAll('.drop-target').forEach((el) => el.classList.remove('drop-target'));
}

/* Wire a day-cell element as a drop target for event drag-move */
function wireDropTarget(el, dateKey) {
  el.addEventListener('dragover', (e) => {
    if (!window._calDragId) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    el.classList.add('drop-target');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drop-target');
    const eventId = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._calDragId;
    if (eventId) void moveEvent(eventId, dateKey);
  });
}

async function moveEvent(eventId, targetKey) {
  const found = findEvent(eventId);
  if (!found || found.dateKey === targetKey) return;
  const { dateKey, event } = found;
  notes[dateKey] = getEventsForDate(dateKey).filter((item) => item.id !== eventId);
  notes[targetKey] = [...getEventsForDate(targetKey), event];
  renderAll({ renderGrid: true, animateGrid: false });
  animateChipIntoPlace(eventId);
  await persistCalendar('Event moved');
}

/* After a re-render, find the moved event's chip by id and pop it into place. */
function animateChipIntoPlace(eventId) {
  if (prefersReducedMotion) return;
  const host = document.getElementById('cal-view-host');
  if (!host || typeof host.querySelector !== 'function') return;
  const chip = host.querySelector(`.cal-chip[data-id="${eventId}"]`);
  if (!chip) return;
  gsapFromTo(
    chip,
    { opacity: 0, scale: 0.7, y: -4 },
    { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'pop', clearProps: 'scale,y' }
  );
}

/* ── Selected-cell helper (month view) ─────────── */
function setSelectedCellState(previousKey, nextKey) {
  const host = document.getElementById('cal-view-host');
  if (!host || typeof host.querySelector !== 'function') return;
  if (previousKey) {
    const prev = host.querySelector(`[data-date-key="${previousKey}"]`);
    if (prev) prev.classList.remove('selected');
  }
  if (nextKey) {
    const next = host.querySelector(`[data-date-key="${nextKey}"]`);
    if (next) next.classList.add('selected');
  }
}

/* Quick feedback pop on a day cell — transform-only ring, no layout shift */
function playCellPop(dateKey) {
  if (prefersReducedMotion) return;
  const host = document.getElementById('cal-view-host');
  if (!host || typeof host.querySelector !== 'function') return;
  const cell = host.querySelector(`[data-date-key="${dateKey}"]`);
  if (!cell || typeof cell.appendChild !== 'function') return;

  // Subtle scale pop on the cell itself.
  gsapKill(cell);
  gsapFromTo(cell, { scale: 1 }, { scale: 1.04, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1, clearProps: 'scale' });

  // Animated accent ring child that scales + fades.
  if (typeof document.createElement === 'function') {
    const ring = document.createElement('div');
    ring.className = 'cal-cell-ring';
    cell.appendChild(ring);
    const done = () => { if (ring.parentNode) ring.parentNode.removeChild(ring); };
    const tween = gsapFromTo(
      ring,
      { opacity: 0.9, scale: 0.85 },
      { opacity: 0, scale: 1.06, duration: 0.45, ease: 'power2.out', onComplete: done }
    );
    if (!tween) done();
  }
}

function selectDate(dateKey) {
  const previousKey = getSelectedKey();
  selectedDate = selectedDateFromKey(dateKey);
  if (viewMode === 'month' && previousKey !== dateKey) {
    setSelectedCellState(previousKey, dateKey);
  } else if (viewMode !== 'month') {
    renderView();
  }
  playCellPop(dateKey);
  renderSelectedDate();
}

/* ── Month grid ────────────────────────────────── */
function renderCalendar(options = {}) {
  const { animate = false } = options;
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
  const today = new Date();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const day = daysInPrev - i;
    cells.push({ day, month: 'prev', year: currentMonth === 0 ? currentYear - 1 : currentYear, m: currentMonth === 0 ? 11 : currentMonth - 1 });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, month: 'cur', year: currentYear, m: currentMonth });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day += 1) {
    cells.push({ day, month: 'next', year: currentMonth === 11 ? currentYear + 1 : currentYear, m: currentMonth === 11 ? 0 : currentMonth + 1 });
  }

  /* Fit the viewport: row count drives template rows so the month never scrolls. */
  const rowCount = Math.ceil(cells.length / 7);
  // minmax(0, 1fr) (not 1fr === minmax(auto, 1fr)) so a day with lots of events
  // can't stretch its row — the cell holds its share and scrolls internally.
  grid.style.gridTemplateRows = `repeat(${rowCount}, minmax(0, 1fr))`;
  grid.innerHTML = '';

  const selectedKey = getSelectedKey();

  cells.forEach(({ day, month, year, m }) => {
    const cell = document.createElement('div');
    cell.className = 'cal-cell spotlight-card';
    if (month !== 'cur') cell.classList.add('other-month');

    const isToday = month === 'cur' && day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    if (isToday) cell.classList.add('today');

    const key = toKey(year, m, day);
    cell.dataset.dateKey = key;
    if (selectedKey === key) cell.classList.add('selected');

    const head = document.createElement('div');
    head.className = 'cal-day-head';
    const dayNum = document.createElement('span');
    dayNum.className = 'cal-day-num';
    dayNum.textContent = day;
    head.appendChild(dayNum);

    const quickAdd = document.createElement('button');
    quickAdd.type = 'button';
    quickAdd.className = 'cal-quick-add';
    quickAdd.textContent = '+';
    quickAdd.setAttribute('aria-label', 'Add event');
    quickAdd.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDate(key);
      openPopover({ dateKey: key, editingId: null, anchor: quickAdd });
    });
    head.appendChild(quickAdd);
    cell.appendChild(head);

    const dayEvents = sortEvents(getEventsForDate(key));
    const dueTasks = getTasksForDate(key);
    if (dayEvents.length > 0 || dueTasks.length > 0) {
      const eventsEl = document.createElement('div');
      eventsEl.className = 'cal-cell-events';

      // Render every event/task for the day; the cell's .cal-cell-events scrolls
      // internally when there are more than fit, so nothing is truncated.
      dayEvents.forEach((event) => eventsEl.appendChild(createEventChip(event, key)));
      dueTasks.forEach((task) => eventsEl.appendChild(createTaskPill(task)));
      cell.appendChild(eventsEl);
    }

    cell.addEventListener('click', () => selectDate(key));
    wireDropTarget(cell, key);

    grid.appendChild(cell);
  });

  if (animate && !prefersReducedMotion && typeof gsap.fromTo === 'function') {
    const nodes = grid.querySelectorAll ? grid.querySelectorAll('.cal-cell') : [];
    if (nodes.length) {
      gsap.fromTo(
        nodes,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, stagger: { amount: 0.22 }, ease: 'snappy', clearProps: 'y' }
      );
    }
    gridHasAnimated = true;
  }
}

/* ── Week view ─────────────────────────────────── */
function getWeekDays() {
  const base = selectedDate ? new Date(selectedDate.y, selectedDate.m, selectedDate.d) : new Date();
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function renderWeek(host, animate) {
  const wrap = document.createElement('div');
  wrap.className = 'cal-week';
  const today = new Date();
  const selectedKey = getSelectedKey();

  getWeekDays().forEach((d) => {
    const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
    const col = document.createElement('div');
    col.className = 'cal-week-col spotlight-card';
    col.dataset.dateKey = key;
    if (d.toDateString() === today.toDateString()) col.classList.add('today');
    if (selectedKey === key) col.classList.add('selected');

    const head = document.createElement('div');
    head.className = 'cal-week-col-head';
    const dow = document.createElement('span');
    dow.className = 'cal-week-col-dow';
    dow.textContent = DAYS_SHORT[d.getDay()];
    const num = document.createElement('span');
    num.className = 'cal-week-col-num';
    num.textContent = d.getDate();
    head.appendChild(dow);
    head.appendChild(num);
    col.appendChild(head);

    const body = document.createElement('div');
    body.className = 'cal-week-col-body';
    sortEvents(getEventsForDate(key)).forEach((event) => body.appendChild(createEventChip(event, key)));
    getTasksForDate(key).forEach((task) => body.appendChild(createTaskPill(task)));

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'cal-week-col-add';
    add.textContent = '+ Add';
    add.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDate(key);
      openPopover({ dateKey: key, editingId: null, anchor: add });
    });
    body.appendChild(add);
    col.appendChild(body);

    col.addEventListener('click', () => selectDate(key));
    wireDropTarget(col, key);
    wrap.appendChild(col);
  });

  host.appendChild(wrap);

  if (animate && !prefersReducedMotion && typeof gsap.fromTo === 'function') {
    const cols = wrap.querySelectorAll ? wrap.querySelectorAll('.cal-week-col') : [];
    if (cols.length) {
      gsap.fromTo(cols, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, stagger: { amount: 0.18 }, ease: 'snappy', clearProps: 'y' });
    }
  }
}

/* ── Agenda view ───────────────────────────────── */
function renderAgenda(host, animate) {
  const wrap = document.createElement('div');
  wrap.className = 'cal-agenda';

  const todayKey = toKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const byDay = {};

  Object.keys(notes).forEach((dateKey) => {
    if (dateKey < todayKey) return;
    getEventsForDate(dateKey).forEach((event) => {
      (byDay[dateKey] = byDay[dateKey] || []).push({ type: 'event', dateKey, event });
    });
  });
  tasks.forEach((task) => {
    if (task && task.due && task.due >= todayKey) {
      (byDay[task.due] = byDay[task.due] || []).push({ type: 'task', dateKey: task.due, task });
    }
  });

  const dayKeys = Object.keys(byDay).sort((a, b) => a.localeCompare(b));
  let agendaRank = 0;

  if (dayKeys.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cal-agenda-empty';
    empty.textContent = 'No upcoming events or due tasks';
    wrap.appendChild(empty);
    host.appendChild(wrap);
    return;
  }

  dayKeys.forEach((dateKey) => {
    const group = document.createElement('div');
    group.className = 'cal-agenda-group';

    const date = keyToDate(dateKey);
    const heading = document.createElement('div');
    heading.className = 'cal-agenda-date';
    if (dateKey === todayKey) heading.classList.add('is-today');
    heading.textContent = `${DAYS_SHORT[date.getDay()]} · ${String(date.getDate()).padStart(2, '0')} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    group.appendChild(heading);

    const rows = byDay[dateKey].slice().sort((a, b) => {
      const ta = a.type === 'event' ? (a.event.time || '99:99') : '99:99';
      const tb = b.type === 'event' ? (b.event.time || '99:99') : '99:99';
      return ta.localeCompare(tb);
    });

    rows.forEach((row) => {
      const el = document.createElement('div');
      el.className = 'cal-agenda-row';
      applyUrgency(el, agendaRank++);

      const accent = document.createElement('div');
      accent.className = 'cal-agenda-accent';

      const time = document.createElement('div');
      time.className = 'cal-agenda-time';

      const title = document.createElement('div');
      title.className = 'cal-agenda-title';

      if (row.type === 'event') {
        el.dataset.tag = normalizeTag(row.event.tag);
        setStyleVar(el, '--chip-color', tagColor(normalizeTag(row.event.tag)));
        time.textContent = row.event.time || '—';
        title.textContent = row.event.title;
        const tag = document.createElement('div');
        tag.className = 'cal-agenda-tag';
        tag.textContent = tagLabel(row.event.tag);
        el.appendChild(accent);
        el.appendChild(time);
        el.appendChild(title);
        el.appendChild(tag);
        el.addEventListener('click', () => {
          selectDate(dateKey);
          openPopover({ dateKey, editingId: row.event.id, anchor: el });
        });
      } else {
        el.classList.add('is-task');
        el.dataset.tag = 'deadline';
        time.textContent = 'Due';
        title.textContent = row.task.title || 'Task';
        const status = taskStatusMeta(row.task.col);
        const check = document.createElement('div');
        check.className = 'cal-agenda-check';
        check.dataset.status = status.key;
        check.textContent = status.glyph;
        check.title = status.label;
        el.appendChild(accent);
        el.appendChild(time);
        el.appendChild(title);
        el.appendChild(check);
      }

      group.appendChild(el);
    });

    wrap.appendChild(group);
  });

  host.appendChild(wrap);

  if (animate && !prefersReducedMotion && typeof gsap.fromTo === 'function') {
    const groups = wrap.querySelectorAll ? wrap.querySelectorAll('.cal-agenda-group') : [];
    if (groups.length) {
      gsap.fromTo(groups, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, stagger: { amount: 0.18 }, ease: 'snappy', clearProps: 'y' });
    }
  }
}

/* ── View dispatcher ───────────────────────────── */
function renderView(options = {}) {
  const { animate = false } = options;
  const host = document.getElementById('cal-view-host');
  const label = document.getElementById('cal-month-label');
  const sub = document.getElementById('cal-header-sub');
  const weekdays = document.getElementById('cal-weekdays');
  if (!host) return;

  if (label) label.textContent = `${MONTHS[currentMonth]} ${currentYear}`;
  if (sub) sub.textContent = `${currentYear} · ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view`;
  if (weekdays && weekdays.style) weekdays.style.display = viewMode === 'agenda' ? 'none' : '';

  host.innerHTML = '';

  if (viewMode === 'month') {
    const grid = document.createElement('div');
    grid.className = 'cal-grid';
    grid.id = 'cal-grid';
    host.appendChild(grid);
    renderCalendar({ animate });
  } else if (viewMode === 'week') {
    renderWeek(host, animate);
  } else {
    renderAgenda(host, animate);
  }
}

/* ── Sidebar (selected + upcoming) ─────────────── */
function renderSelectedDate() {
  const labelEl = document.getElementById('cal-selected-label');
  if (!labelEl) return;
  if (!selectedDate) { labelEl.textContent = '—'; return; }
  labelEl.textContent =
    `${String(selectedDate.d).padStart(2, '0')} ${SHORT_MONTHS[selectedDate.m]} ${selectedDate.y}`;
}

/* Urgency heat scale for chronologically-ordered lists: the 3 soonest items run
   red → orange → yellow, everything further out is green — so what's coming near
   reads at a glance. Drives both a visible cue (date badge / accent) and the
   cursor-glow tint (--spot-color). */
const URGENCY_SCALE = [
  { solid: '#d2706c', soft: 'rgba(210, 112, 108, 0.26)' }, // red — soonest
  { solid: '#d0934e', soft: 'rgba(208, 147, 78, 0.24)' },  // orange
  { solid: '#c9b052', soft: 'rgba(201, 176, 82, 0.24)' },  // yellow
  { solid: '#6faf78', soft: 'rgba(111, 175, 120, 0.20)' }  // green — the rest
];
function applyUrgency(el, rank) {
  const u = URGENCY_SCALE[Math.min(rank, URGENCY_SCALE.length - 1)];
  el.classList.add('spotlight-card');
  setStyleVar(el, '--u-color', u.solid);
  setStyleVar(el, '--spot-color', u.soft);
}

function renderUpcoming() {
  const list = document.getElementById('cal-upcoming-list');
  if (!list) return;
  list.innerHTML = '';

  const todayKey = toKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const upcoming = Object.entries(notes)
    .flatMap(([dateKey]) => getEventsForDate(dateKey).map((event) => ({ dateKey, event })))
    .filter(({ dateKey }) => dateKey >= todayKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || (a.event.time || '99:99').localeCompare(b.event.time || '99:99'))
    .slice(0, 10);

  if (upcoming.length === 0) {
    list.innerHTML = '<div class="cal-empty-state">No upcoming events</div>';
    return;
  }

  upcoming.forEach(({ dateKey, event }, index) => {
    const date = keyToDate(dateKey);
    const item = document.createElement('div');
    item.className = 'cal-upcoming-item';
    applyUrgency(item, index);

    const day = document.createElement('div');
    day.className = 'cal-upcoming-day';
    day.innerHTML = `${String(date.getDate()).padStart(2, '0')}<span>${DAYS_SHORT[date.getDay()]}</span>`;

    const text = document.createElement('div');
    text.className = 'cal-upcoming-text';
    text.appendChild(createTagDot(event.tag));

    const title = document.createElement('span');
    title.textContent = `${event.time ? `${event.time} · ` : ''}${event.title}`;
    text.appendChild(title);

    item.appendChild(day);
    item.appendChild(text);
    item.addEventListener('click', () => {
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
      selectedDate = selectedDateFromKey(dateKey);
      renderAll({ renderGrid: true, animateGrid: false });
      openPopover({ dateKey, editingId: event.id, anchor: item });
    });
    list.appendChild(item);
  });
}

function renderAll(options = {}) {
  const { renderGrid = true, animateGrid = false } = options;
  if (renderGrid) renderView({ animate: animateGrid });
  renderSelectedDate();
  renderUpcoming();
}

/* ── Day popover (quick-add / edit) ────────────── */
/* Immediately tear down any popover/overlay nodes (active or mid-close). */
function destroyPopoverNodes() {
  if (popoverClosing) {
    const { popover: p, overlay: o } = popoverClosing;
    gsapKill(p);
    gsapKill(o);
    if (p && p.parentNode) p.parentNode.removeChild(p);
    if (o && o.parentNode) o.parentNode.removeChild(o);
    popoverClosing = null;
  }
  if (popover) { gsapKill(popover); if (popover.parentNode) popover.parentNode.removeChild(popover); }
  if (popoverOverlay) { gsapKill(popoverOverlay); if (popoverOverlay.parentNode) popoverOverlay.parentNode.removeChild(popoverOverlay); }
  popover = null;
  popoverOverlay = null;
  popoverCtx = null;
}

function closePopover() {
  const p = popover;
  const o = popoverOverlay;
  // Detach state immediately so save/delete/open never race the exit animation.
  popover = null;
  popoverOverlay = null;
  popoverCtx = null;
  if (!p && !o) return;

  const removeNow = () => {
    gsapKill(p);
    gsapKill(o);
    if (p && p.parentNode) p.parentNode.removeChild(p);
    if (o && o.parentNode) o.parentNode.removeChild(o);
    if (popoverClosing && popoverClosing.popover === p) popoverClosing = null;
  };

  if (prefersReducedMotion || !gsapHas('to')) {
    removeNow();
    return;
  }

  popoverClosing = { popover: p, overlay: o };
  if (o) gsapTo(o, { opacity: 0, duration: 0.15, ease: 'power2.in' });
  const tween = gsapTo(p, {
    opacity: 0, scale: 0.95, duration: 0.15, ease: 'power2.in',
    onComplete: removeNow
  });
  if (!tween) removeNow();
}

function positionPopover(anchor) {
  if (!popover) return;
  const pw = popover.offsetWidth || 280;
  const ph = popover.offsetHeight || 320;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 12;
  const navW = 52; // keep clear of the left nav rail

  const rect = (anchor && typeof anchor.getBoundingClientRect === 'function')
    ? anchor.getBoundingClientRect()
    : null;
  // A re-render (agenda / week / upcoming) can detach the clicked element before
  // we open — its rect collapses to 0×0. Treat that (and any off-screen anchor)
  // as "no anchor" and center the popover instead of pinning it to x≈0.
  const anchored = !!rect && rect.width > 0 && rect.height > 0
    && rect.right > 0 && rect.bottom > 0 && rect.left < vw && rect.top < vh;

  let left;
  let top;
  if (anchored) {
    left = rect.left;
    top = rect.bottom + 6;
    if (top + ph > vh - margin) top = rect.top - ph - 6;        // flip up
    if (top < margin) top = (vh - ph) / 2;                       // else center vertically
  } else {
    left = (vw - pw) / 2;                                        // center
    top = (vh - ph) / 2;
  }

  // Clamp fully on-screen (and clear of the nav rail on the left).
  const maxLeft = vw - pw - margin;
  const minLeft = Math.min(navW + margin, Math.max(margin, maxLeft));
  left = Math.max(minLeft, Math.min(left, maxLeft));
  top = Math.max(margin, Math.min(top, vh - ph - margin));

  popover.style.left = `${Math.round(left)}px`;
  popover.style.top = `${Math.round(top)}px`;

  // Transform-origin toward the anchor so the spring-in reads as growing out of
  // the clicked element; centered when there is no usable anchor.
  if (popover.style) {
    if (anchored) {
      const ox = Math.max(0, Math.min(pw, (rect.left + rect.width / 2) - left));
      const oy = Math.max(0, Math.min(ph, (rect.top + rect.height / 2) - top));
      popover.style.transformOrigin = `${Math.round(ox)}px ${Math.round(oy)}px`;
    } else {
      popover.style.transformOrigin = '50% 50%';
    }
  }
}

/* Custom themed 24h time picker: two bounded scroll columns (00-23 / 00-59).
   Reads/writes the hidden #cal-pop-time input as "HH:MM" (or "" when cleared). */
function setupTimePicker(root) {
  const hidden = root.querySelector('#cal-pop-time');
  const trigger = root.querySelector('#cal-time-trigger');
  const panel = root.querySelector('#cal-time-panel');
  const display = root.querySelector('.cal-time-display');
  const clearBtn = root.querySelector('#cal-time-clear');
  const hoursCol = root.querySelector('#cal-time-hours');
  const minsCol = root.querySelector('#cal-time-minutes');
  if (!hidden || !trigger || !panel || !hoursCol || !minsCol) return;

  const pad = (n) => String(n).padStart(2, '0');
  let h = null;
  let m = null;
  const init = /^(\d{2}):(\d{2})$/.exec(hidden.value || '');
  if (init) { h = init[1]; m = init[2]; }

  function buildCol(col, max) {
    col.innerHTML = '';
    for (let i = 0; i <= max; i++) {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'cal-time-opt';
      opt.dataset.val = pad(i);
      opt.textContent = pad(i);
      col.appendChild(opt);
    }
  }
  buildCol(hoursCol, 23);
  buildCol(minsCol, 59);

  function paint() {
    hoursCol.querySelectorAll('.cal-time-opt').forEach((o) => o.classList.toggle('is-selected', o.dataset.val === h));
    minsCol.querySelectorAll('.cal-time-opt').forEach((o) => o.classList.toggle('is-selected', o.dataset.val === m));
    const has = h !== null && m !== null;
    if (display) display.textContent = has ? `${h}:${m}` : 'Set time';
    trigger.classList.toggle('is-empty', !has);
    if (clearBtn) clearBtn.hidden = !has;
    hidden.value = has ? `${h}:${m}` : '';
  }

  function scrollToSelected() {
    [[hoursCol, h], [minsCol, m]].forEach(([col, val]) => {
      const sel = val !== null ? col.querySelector(`.cal-time-opt[data-val="${val}"]`) : null;
      if (sel && typeof sel.scrollIntoView === 'function') {
        try { sel.scrollIntoView({ block: 'center' }); } catch (e) { col.scrollTop = sel.offsetTop - col.clientHeight / 2; }
      }
    });
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    scrollToSelected();
  }
  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (panel.hidden) openPanel(); else closePanel();
  });
  if (clearBtn) clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    h = null; m = null; paint();
  });
  hoursCol.addEventListener('click', (e) => {
    const opt = e.target.closest('.cal-time-opt'); if (!opt) return;
    h = opt.dataset.val; if (m === null) m = '00'; paint();
  });
  minsCol.addEventListener('click', (e) => {
    const opt = e.target.closest('.cal-time-opt'); if (!opt) return;
    m = opt.dataset.val; if (h === null) h = '00'; paint();
  });
  // Close the panel when clicking elsewhere inside the popover.
  root.addEventListener('click', (e) => {
    if (panel.hidden) return;
    if (e.target.closest && e.target.closest('#cal-timepicker')) return;
    closePanel();
  });

  paint();
}

/* Custom themed date picker: a month-grid popover (no native white control).
   Reads/writes the hidden #cal-pop-date input as "YYYY-MM-DD". */
function setupDatePicker(root) {
  const hidden = root.querySelector('#cal-pop-date');
  const trigger = root.querySelector('#cal-date-trigger');
  const panel = root.querySelector('#cal-date-panel');
  const display = root.querySelector('.cal-date-display');
  const titleEl = root.querySelector('#cal-dp-title');
  const grid = root.querySelector('#cal-dp-grid');
  const prevBtn = root.querySelector('#cal-dp-prev');
  const nextBtn = root.querySelector('#cal-dp-next');
  if (!hidden || !trigger || !panel || !grid) return;

  let selectedKey = /^\d{4}-\d{2}-\d{2}$/.test(hidden.value) ? hidden.value : '';
  const base = selectedKey ? keyToDate(selectedKey) : new Date();
  let viewY = base.getFullYear();
  let viewM = base.getMonth();
  const now = new Date();
  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());

  function fmt(key) {
    const d = keyToDate(key);
    return `${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function paintTrigger() {
    if (selectedKey) { display.textContent = fmt(selectedKey); trigger.classList.remove('is-empty'); }
    else { display.textContent = 'Pick date'; trigger.classList.add('is-empty'); }
  }
  function renderGrid() {
    if (titleEl) titleEl.textContent = `${MONTHS[viewM]} ${viewY}`;
    grid.innerHTML = '';
    const first = new Date(viewY, viewM, 1);
    const start = new Date(viewY, viewM, 1 - first.getDay());
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-dp-day';
      if (d.getMonth() !== viewM) btn.classList.add('is-other');
      if (key === todayKey) btn.classList.add('is-today');
      if (key === selectedKey) btn.classList.add('is-selected');
      btn.textContent = String(d.getDate());
      btn.dataset.key = key;
      grid.appendChild(btn);
    }
  }
  function openPanel() { panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); renderGrid(); }
  function closePanel() { panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }

  trigger.addEventListener('click', (e) => { e.stopPropagation(); if (panel.hidden) openPanel(); else closePanel(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); viewM -= 1; if (viewM < 0) { viewM = 11; viewY -= 1; } renderGrid(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); viewM += 1; if (viewM > 11) { viewM = 0; viewY += 1; } renderGrid(); });
  grid.addEventListener('click', (e) => {
    const day = e.target.closest('.cal-dp-day'); if (!day) return;
    selectedKey = day.dataset.key;
    hidden.value = selectedKey;
    const d = keyToDate(selectedKey); viewY = d.getFullYear(); viewM = d.getMonth();
    paintTrigger();
    closePanel();
  });
  root.addEventListener('click', (e) => {
    if (panel.hidden) return;
    if (e.target.closest && e.target.closest('#cal-datepicker')) return;
    closePanel();
  });

  paintTrigger();
}

/* Themed tag chooser. Renders a clickable color chip per (fixed) tag and writes
   the selected key to the hidden #cal-pop-tag input. */
function setupTagChooser(root, selectedKey) {
  const wrap = root.querySelector('#cal-tag-chooser');
  const hidden = root.querySelector('#cal-pop-tag');
  if (!wrap || !hidden) return;
  let selected = normalizeTag(selectedKey);
  hidden.value = selected;

  function render() {
    wrap.innerHTML = '';
    TAGS.forEach((tag) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `cal-tag-chip${tag.key === selected ? ' is-selected' : ''}`;
      setStyleVar(chip, '--chip-color', tagColor(tag.key));
      chip.dataset.key = tag.key;

      const dot = document.createElement('span');
      dot.className = 'cal-tag-chip-dot';
      chip.appendChild(dot);

      const label = document.createElement('span');
      label.textContent = tag.label;
      chip.appendChild(label);

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = tag.key;
        hidden.value = selected;
        render();
      });

      wrap.appendChild(chip);
    });
  }

  render();
}

function openPopover({ dateKey, editingId = null, anchor = null }) {
  // Cancel any in-flight close tween and remove leftover nodes immediately so
  // rapid quick-add/edit can never leave two popovers or a half-faded overlay.
  destroyPopoverNodes();
  if (!document.body) return;

  popoverCtx = { dateKey, editingId };
  const existing = editingId ? getEventsForDate(dateKey).find((e) => e.id === editingId) : null;

  popoverOverlay = document.createElement('div');
  popoverOverlay.className = 'cal-popover-overlay';
  popoverOverlay.addEventListener('mousedown', (e) => {
    if (e.target === popoverOverlay) closePopover();
  });

  popover = document.createElement('div');
  popover.className = 'cal-popover';
  popover.setAttribute('role', 'dialog');

  const dateLabel = (() => {
    const d = keyToDate(dateKey);
    return `${DAYS_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  })();

  popover.innerHTML = `
    <div class="cal-popover-head">
      <span class="cal-popover-title">${editingId ? 'Edit event' : 'Add event'}</span>
      <span class="cal-popover-date">${dateLabel}</span>
    </div>
    <div>
      <label for="cal-pop-title">Title</label>
      <input class="input" id="cal-pop-title" type="text" placeholder="Event title">
    </div>
    <div class="cal-popover-row">
      <div class="cal-timepicker" id="cal-timepicker">
        <label>Time</label>
        <input type="hidden" id="cal-pop-time">
        <div class="cal-picker-control">
          <button type="button" class="input cal-timepicker-trigger is-empty" id="cal-time-trigger" aria-haspopup="listbox" aria-expanded="false">
            <span class="cal-time-display">Set time</span>
            <span class="cal-time-clear" id="cal-time-clear" title="Clear time" hidden>&times;</span>
          </button>
          <div class="cal-timepicker-panel" id="cal-time-panel" hidden>
            <div class="cal-timecol" id="cal-time-hours" role="listbox" aria-label="Hour"></div>
            <div class="cal-timecol-sep">:</div>
            <div class="cal-timecol" id="cal-time-minutes" role="listbox" aria-label="Minute"></div>
          </div>
        </div>
      </div>
      <div class="cal-datepicker" id="cal-datepicker">
        <label>Date</label>
        <input type="hidden" id="cal-pop-date">
        <div class="cal-picker-control">
          <button type="button" class="input cal-datepicker-trigger" id="cal-date-trigger" aria-haspopup="dialog" aria-expanded="false">
            <span class="cal-date-display">Pick date</span>
          </button>
          <div class="cal-datepicker-panel" id="cal-date-panel" hidden>
            <div class="cal-dp-head">
              <button type="button" class="cal-dp-nav" id="cal-dp-prev" aria-label="Previous month">&lsaquo;</button>
              <span class="cal-dp-title" id="cal-dp-title"></span>
              <button type="button" class="cal-dp-nav" id="cal-dp-next" aria-label="Next month">&rsaquo;</button>
            </div>
            <div class="cal-dp-weekdays"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
            <div class="cal-dp-grid" id="cal-dp-grid"></div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <label>Tag</label>
      <input type="hidden" id="cal-pop-tag">
      <div class="cal-tag-chooser" id="cal-tag-chooser"></div>
    </div>
    <div>
      <label for="cal-pop-note">Note</label>
      <textarea class="input" id="cal-pop-note" placeholder="Optional note"></textarea>
    </div>
    <div class="cal-popover-actions">
      <button class="btn btn-primary" id="cal-pop-save" type="button">Save</button>
      <button class="btn btn-ghost" id="cal-pop-cancel" type="button">Cancel</button>
      ${editingId ? '<button class="btn btn-ghost cal-delete-btn" id="cal-pop-delete" type="button">Delete</button>' : ''}
    </div>
  `;

  document.body.appendChild(popoverOverlay);
  document.body.appendChild(popover);

  const titleInput = popover.querySelector('#cal-pop-title');
  const timeInput = popover.querySelector('#cal-pop-time');
  const tagInput = popover.querySelector('#cal-pop-tag');
  const dateInput = popover.querySelector('#cal-pop-date');
  const noteInput = popover.querySelector('#cal-pop-note');

  if (existing) {
    if (titleInput) titleInput.value = existing.title || '';
    if (timeInput) timeInput.value = existing.time || '';
    if (tagInput) tagInput.value = normalizeTag(existing.tag);
    if (noteInput) noteInput.value = existing.note || '';
  } else if (tagInput) {
    tagInput.value = 'note';
  }
  if (dateInput) dateInput.value = dateKey;

  setupTimePicker(popover);
  setupDatePicker(popover);
  setupTagChooser(popover, tagInput ? (tagInput.value || 'note') : 'note');

  positionPopover(anchor);

  // Spring the popover in from its anchor; fade + dim the overlay.
  if (!prefersReducedMotion) {
    gsapFromTo(popoverOverlay, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' });
    gsapFromTo(
      popover,
      { opacity: 0, scale: 0.9, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)', clearProps: 'scale,y' }
    );
  } else {
    gsapSet(popoverOverlay, { opacity: 1 });
    gsapSet(popover, { opacity: 1, scale: 1, y: 0 });
  }

  if (titleInput && typeof titleInput.focus === 'function') {
    try { titleInput.focus(); } catch (err) { /* headless guard */ }
    if (typeof titleInput.select === 'function') { try { titleInput.select(); } catch (err) { /* noop */ } }
  }

  const saveBtn = popover.querySelector('#cal-pop-save');
  const cancelBtn = popover.querySelector('#cal-pop-cancel');
  const deleteBtn = popover.querySelector('#cal-pop-delete');

  if (saveBtn) saveBtn.addEventListener('click', () => savePopover());
  if (cancelBtn) cancelBtn.addEventListener('click', () => closePopover());
  if (deleteBtn) deleteBtn.addEventListener('click', () => deleteFromPopover());

  popover.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      savePopover();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePopover();
    }
  });
}

async function savePopover() {
  if (!popover || !popoverCtx) return;
  const titleInput = popover.querySelector('#cal-pop-title');
  const title = titleInput ? (titleInput.value || '').trim() : '';
  if (!title) {
    if (titleInput && titleInput.focus) titleInput.focus();
    showToast('Event title is required');
    return;
  }

  const time = normalizeTime((popover.querySelector('#cal-pop-time') || {}).value || '');
  const tag = normalizeTag((popover.querySelector('#cal-pop-tag') || {}).value || 'note');
  const note = normalizeNote((popover.querySelector('#cal-pop-note') || {}).value || '');
  const dateField = (popover.querySelector('#cal-pop-date') || {}).value || popoverCtx.dateKey;
  const targetKey = /^\d{4}-\d{2}-\d{2}$/.test(dateField) ? dateField : popoverCtx.dateKey;

  const { dateKey, editingId } = popoverCtx;

  const nextEvent = { id: editingId || makeEventId(), title, time, tag };
  if (note) nextEvent.note = note;

  if (editingId) {
    // Remove from original day, then place on the (possibly changed) target day.
    notes[dateKey] = getEventsForDate(dateKey).filter((item) => item.id !== editingId);
    notes[targetKey] = [...getEventsForDate(targetKey), nextEvent];
  } else {
    notes[targetKey] = [...getEventsForDate(targetKey), nextEvent];
  }

  selectedDate = selectedDateFromKey(targetKey);
  closePopover();
  renderAll({ renderGrid: true, animateGrid: false });
  await persistCalendar(editingId ? 'Event updated' : 'Event added');
}

async function deleteFromPopover() {
  if (!popoverCtx || !popoverCtx.editingId) return;
  const { dateKey, editingId } = popoverCtx;
  notes[dateKey] = getEventsForDate(dateKey).filter((item) => item.id !== editingId);
  closePopover();
  renderAll({ renderGrid: true, animateGrid: false });
  await persistCalendar('Event deleted');
}

/* ── View toggle / nav wiring ──────────────────── */
const VIEW_ORDER = ['month', 'week', 'agenda'];

/* Slide the active indicator pill under the active button. */
function moveViewIndicator(mode, animate) {
  const indicator = document.getElementById('cal-view-indicator');
  if (!indicator || typeof indicator.style === 'undefined') return;
  const buttons = queryAll('.cal-view-btn');
  let target = null;
  if (buttons && buttons.forEach) {
    buttons.forEach((btn) => { if (btn.dataset && btn.dataset.view === mode) target = btn; });
  }
  if (!target || typeof target.offsetLeft !== 'number') return;
  const left = target.offsetLeft;
  const width = target.offsetWidth;
  if (animate && !prefersReducedMotion && gsapHas('to')) {
    gsapTo(indicator, { x: left, width, duration: 0.34, ease: 'back.out(1.7)' });
  } else if (gsapHas('set')) {
    gsapSet(indicator, { x: left, width });
  } else {
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }
}

/* Direction-aware view-switch transition: fade/slide the old content out,
   then render the new view (each renderer staggers its own children in). */
function setView(mode) {
  if (mode === viewMode) return;
  const dir = VIEW_ORDER.indexOf(mode) > VIEW_ORDER.indexOf(viewMode) ? 1 : -1;
  viewMode = mode;
  const buttons = queryAll('.cal-view-btn');
  buttons.forEach((btn) => {
    const isActive = btn.dataset.view === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  moveViewIndicator(mode, true);

  const host = document.getElementById('cal-view-host');
  const outgoing = host && typeof host.querySelector === 'function'
    ? host.querySelector('.cal-grid, .cal-week, .cal-agenda')
    : null;

  if (outgoing && !prefersReducedMotion && gsapHas('to')) {
    gsapTo(outgoing, {
      opacity: 0, x: -18 * dir, duration: 0.16, ease: 'power2.in',
      onComplete: () => renderAll({ renderGrid: true, animateGrid: true })
    });
  } else {
    renderAll({ renderGrid: true, animateGrid: true });
  }
}

(function wireViewToggle() {
  const buttons = queryAll('.cal-view-btn');
  if (buttons && buttons.forEach) {
    buttons.forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));
  }
})();

const prevBtn = document.getElementById('cal-prev');
if (prevBtn) prevBtn.addEventListener('click', () => {
  if (viewMode === 'week') {
    const base = selectedDate ? new Date(selectedDate.y, selectedDate.m, selectedDate.d) : new Date();
    base.setDate(base.getDate() - 7);
    selectedDate = { y: base.getFullYear(), m: base.getMonth(), d: base.getDate() };
    currentYear = base.getFullYear();
    currentMonth = base.getMonth();
  } else {
    currentMonth -= 1;
    if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; }
  }
  renderAll({ renderGrid: true, animateGrid: true });
});

const nextBtn = document.getElementById('cal-next');
if (nextBtn) nextBtn.addEventListener('click', () => {
  if (viewMode === 'week') {
    const base = selectedDate ? new Date(selectedDate.y, selectedDate.m, selectedDate.d) : new Date();
    base.setDate(base.getDate() + 7);
    selectedDate = { y: base.getFullYear(), m: base.getMonth(), d: base.getDate() };
    currentYear = base.getFullYear();
    currentMonth = base.getMonth();
  } else {
    currentMonth += 1;
    if (currentMonth > 11) { currentMonth = 0; currentYear += 1; }
  }
  renderAll({ renderGrid: true, animateGrid: true });
});

const todayBtn = document.getElementById('cal-today-btn');
if (todayBtn) todayBtn.addEventListener('click', () => {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  selectedDate = { y: currentYear, m: currentMonth, d: now.getDate() };
  renderAll({ renderGrid: true, animateGrid: true });
});

async function init() {
  const result = await workspacePersistence.loadWorkspaceData();
  notes = migrateCalendarNotes(result.data.calendarNotes);
  tasks = Array.isArray(result.data.tasks) ? result.data.tasks : [];

  const now = new Date();
  selectedDate = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  renderAll({ renderGrid: true, animateGrid: !gridHasAnimated });
  moveViewIndicator(viewMode, false);

  if (!prefersReducedMotion && typeof gsap.from === 'function') {
    gsap.from('.cal-main', { opacity: 0, x: -10, duration: 0.5, ease: 'snappy' });
    gsap.from('.cal-sidebar', { opacity: 0, x: 10, duration: 0.5, ease: 'snappy', delay: 0.1 });
  }
}

window.CalendarPlanner = {
  migrateCalendarNotes,
  normalizeEvent,
  toKey,
  getState: () => ({ notes, tasks, selectedDate, viewMode })
};

void init();
