/* ============================================
   WorkspaceV3 - Tasks JS
   Kanban + Drag & Drop + shared persistence
   ============================================ */
/* global gsap, CustomEase, Draggable, workspacePersistence, ConyMiniCalendar, ConyDropdownList */

gsap.registerPlugin(CustomEase, Draggable);
CustomEase.create("snappy", "M0,0 C0.165,0.84 0.44,1 1,1");

const {
  describeSaveResult,
  setSaveIndicator,
  reflectSaveIndicator,
  syncSaveIndicatorFromWorkspace,
  showToast,
  escapeHtml
} = window.WorkspaceUI;

let tasks = [];
const priorities = { todo: 'med', progress: 'med', done: 'low' };
const priorityRank = { high: 0, med: 1, low: 2 };
let editingTaskId = null;
let lastEditInvoker = null;
const taskDateControllers = new Map();
let taskStatusController = null;

const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

function validTaskDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
}

function mountTaskDatePicker(hostId, date = '') {
  const host = document.getElementById(hostId);
  if (!host || typeof ConyMiniCalendar === 'undefined' || typeof ConyMiniCalendar.mount !== 'function') return;
  const previous = taskDateControllers.get(hostId);
  if (previous && typeof previous.destroy === 'function') previous.destroy();
  const controller = ConyMiniCalendar.mount(host, {
    date: validTaskDate(date),
    time: '',
    onChange() {}
  });
  taskDateControllers.set(hostId, controller);
}

function getTaskDate(hostId) {
  const controller = taskDateControllers.get(hostId);
  return controller && typeof controller.getValue === 'function'
    ? validTaskDate(controller.getValue().date)
    : '';
}

function setTaskDate(hostId, date) {
  const controller = taskDateControllers.get(hostId);
  if (controller && typeof controller.setValue === 'function') {
    controller.setValue({ date: validTaskDate(date), time: '' });
  }
}

function mountTaskDatePickers() {
  ['todo', 'progress', 'done'].forEach((col) => mountTaskDatePicker(`due-picker-${col}`));
  mountTaskDatePicker('task-edit-due-picker');
}

function mountTaskStatusPicker() {
  const host = document.getElementById('task-edit-col');
  if (!host || typeof ConyDropdownList === 'undefined' || typeof ConyDropdownList.mount !== 'function') return;
  taskStatusController = ConyDropdownList.mount(host, {
    value: 'todo',
    ariaLabel: 'Status',
    options: TASK_STATUS_OPTIONS,
    onChange() {}
  });
}

function getTaskStatus() {
  return taskStatusController && typeof taskStatusController.getValue === 'function'
    ? taskStatusController.getValue()
    : 'todo';
}

function setTaskStatus(value) {
  if (taskStatusController && typeof taskStatusController.setValue === 'function') {
    taskStatusController.setValue(value || 'todo');
  }
}

async function saveTasks(options) {
  if (!workspacePersistence.guardMutation()) {
    return { source: 'empty', status: 'blocked', reason: 'not-connected' };
  }
  setSaveIndicator('saving', 'Saving…');
  const result = await workspacePersistence.saveSection('tasks', tasks, options);
  reflectSaveIndicator(result);
  return result;
}

window.showToast = showToast;

function getBadgeClass(p) {
  return p === 'high' ? 'badge-high' : p === 'med' ? 'badge-med' : 'badge-low';
}

function getPriorityLabel(p) {
  return p === 'high' ? 'High' : p === 'med' ? 'Medium' : 'Low';
}

function formatDate(d) {
  if (!d) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
  if (!match) return '';
  const dt = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeTask(task) {
  return {
    id: task.id || Date.now().toString(),
    title: typeof task.title === 'string' ? task.title : '',
    detail: typeof task.detail === 'string' ? task.detail : '',
    col: task.col || 'todo',
    priority: priorityRank[task.priority] !== undefined ? task.priority : 'med',
    due: task.due || '',
    createdAt: task.createdAt || new Date().toISOString()
  };
}

function compareTasks(a, b) {
  const aHasDue = Boolean(a.due);
  const bHasDue = Boolean(b.due);

  if (aHasDue && bHasDue) {
    const byDue = new Date(`${a.due}T00:00:00`) - new Date(`${b.due}T00:00:00`);
    if (byDue !== 0) return byDue;
  } else if (aHasDue !== bHasDue) {
    return aHasDue ? -1 : 1;
  }

  const byPriority = (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
  if (byPriority !== 0) return byPriority;

  return new Date(a.createdAt) - new Date(b.createdAt);
}

function priorityLabel(priority) {
  return priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Med';
}

function taskPreview(detail) {
  return escapeHtml(String(detail || '').trim());
}

function renderTasks() {
  const cols = { todo: [], progress: [], done: [] };
  tasks.forEach(task => {
    if (cols[task.col]) cols[task.col].push(task);
  });

  ['todo', 'progress', 'done'].forEach(col => {
    const container = document.getElementById(`cards-${col}`);
    container.innerHTML = '';

    cols[col].sort(compareTasks);

    cols[col].forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card spotlight-card${col === 'done' ? ' done-card' : ''}`;
      card.dataset.id = task.id;
      card.dataset.priority = task.priority;
      card.draggable = true;
      // Tint the cursor-follow glow by priority (high = warm red, med = amber, low = green).
      const spotByPriority = {
        high: 'rgba(192, 112, 112, 0.22)',
        med: 'rgba(184, 144, 80, 0.20)',
        low: 'rgba(112, 160, 112, 0.20)'
      };
      card.style.setProperty('--spot-color', spotByPriority[task.priority] || 'rgba(214, 226, 255, 0.14)');
      const preview = taskPreview(task.detail);
      card.innerHTML = `
        <div class="task-card-top">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-card-actions"></div>
        </div>
        ${preview ? `<div class="task-detail">${preview}</div>` : ''}
        <div class="task-meta">
          <div class="task-meta-left">
            <span class="badge ${getBadgeClass(task.priority)}">${getPriorityLabel(task.priority)}</span>
          </div>
          <span class="task-due">${formatDate(task.due)}</span>
        </div>
      `;
      const actions = card.querySelector('.task-card-actions');
      const editButton = document.createElement('button');
      editButton.className = 'task-edit';
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.dataset.taskAction = 'edit';
      editButton.dataset.taskId = task.id;
      editButton.addEventListener('click', event => {
        openEditTask(task.id, event.currentTarget);
      });
      const deleteButton = document.createElement('button');
      deleteButton.className = 'task-delete';
      deleteButton.type = 'button';
      deleteButton.textContent = 'x';
      deleteButton.dataset.taskAction = 'delete';
      deleteButton.dataset.taskId = task.id;
      deleteButton.addEventListener('click', () => {
        void deleteTask(task.id);
      });
      actions.append(editButton, deleteButton);

      card.addEventListener('dragstart', event => {
        event.dataTransfer.setData('taskId', task.id);
        card.classList.add('dragging');
        gsap.to(card, { scale: 0.97, opacity: 0.6, duration: 0.15 });
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        gsap.to(card, { scale: 1, opacity: 1, duration: 0.2 });
      });

      card.addEventListener('dblclick', event => {
        if (event.target.closest('.task-edit, .task-delete')) return;
        openEditTask(task.id);
      });

      container.appendChild(card);
      gsap.from(card, { opacity: 0, y: 8, duration: 0.25, ease: 'snappy' });
    });

    document.getElementById(`count-${col}`).textContent = cols[col].length;
  });

  document.querySelectorAll('.kanban-cards').forEach(zone => {
    if (zone.dataset.dropBound === 'true') return;
    zone.dataset.dropBound = 'true';

    zone.addEventListener('dragover', event => {
      event.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', event => {
      event.preventDefault();
      zone.classList.remove('drag-over');
      const taskId = event.dataTransfer.getData('taskId');
      const newCol = zone.dataset.col;
      const task = tasks.find(item => item.id === taskId);
      if (task && task.col !== newCol) {
        if (!workspacePersistence.guardMutation()) return;
        task.col = newCol;
        renderTasks();
        saveTasks({ disk: true }).then(result => {
          showToast(describeSaveResult(`Moved to ${newCol}`, result));
        }).catch(() => {
          setSaveIndicator('error', 'Save failed');
          showToast('Task move applied locally, but save failed');
        });
      }
    });
  });

  document.getElementById('task-count-display').textContent =
    `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

var openAddForm, closeAddForm, addTask, selectPriority, deleteTask;
var openEditTask;

openAddForm = window.openAddForm = function(col) {
  if (!workspacePersistence.guardMutation()) return;
  document.getElementById(`form-${col}`).classList.add('open');
  document.getElementById(`input-${col}`).focus();
};

closeAddForm = window.closeAddForm = function(col) {
  document.getElementById(`form-${col}`).classList.remove('open');
  document.getElementById(`input-${col}`).value = '';
  setTaskDate(`due-picker-${col}`, '');
  priorities[col] = 'med';
  document.querySelectorAll(`#priority-${col} .priority-opt`).forEach(button => {
    button.className = 'priority-opt';
  });
};

selectPriority = window.selectPriority = function(col, priority, button) {
  if (!workspacePersistence.guardMutation()) return;
  priorities[col] = priority;
  document.querySelectorAll(`#priority-${col} .priority-opt`).forEach(item => {
    item.className = 'priority-opt';
  });
  button.className = `priority-opt selected-${priority}`;
};

addTask = window.addTask = async function(col) {
  if (!workspacePersistence.guardMutation()) return;
  const titleEl = document.getElementById(`input-${col}`);
  const title = titleEl.value.trim();
  if (!title) return;

  tasks.push(normalizeTask({
    id: Date.now().toString(),
    title,
    detail: '',
    col,
    priority: priorities[col] || 'med',
    due: getTaskDate(`due-picker-${col}`),
    createdAt: new Date().toISOString()
  }));

  const result = await saveTasks({ disk: true });
  closeAddForm(col);
  renderTasks();
  showToast(describeSaveResult('Task added', result));
};

function setEditPriority(priority) {
  document.querySelectorAll('#task-edit-priority .priority-opt').forEach(button => {
    button.className = 'priority-opt';
  });
  const active = document.querySelector(`#task-edit-priority .priority-opt[data-p="${priority}"]`);
  if (active) active.className = `priority-opt selected-${priority}`;
}

function setEditModalOpen(isOpen) {
  const modal = document.getElementById('task-edit-modal');
  modal.classList.toggle('open', isOpen);
  modal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
}

function closeEditModal(options) {
  const settings = options || {};
  const restoreFocus = settings.restoreFocus !== false;
  setEditModalOpen(false);
  editingTaskId = null;
  if (restoreFocus && lastEditInvoker && typeof lastEditInvoker.focus === 'function') {
    lastEditInvoker.focus();
  }
  lastEditInvoker = null;
}

openEditTask = window.openEditTask = function(id, invoker) {
  if (!workspacePersistence.guardMutation()) return;
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  lastEditInvoker = invoker || document.activeElement || null;
  editingTaskId = id;
  const titleInput = document.getElementById('task-edit-title');
  titleInput.value = task.title || '';
  document.getElementById('task-edit-detail').value = task.detail || '';
  setTaskStatus(task.col || 'todo');
  setTaskDate('task-edit-due-picker', task.due || '');
  setEditPriority(task.priority || 'med');
  setEditModalOpen(true);
  titleInput.focus();
  if (typeof titleInput.select === 'function') titleInput.select();
};

deleteTask = window.deleteTask = async function(id) {
  if (!workspacePersistence.guardMutation()) return;
  const task = tasks.find(item => item.id === id);
  const label = task ? task.title : 'this task';
  if (typeof window.confirm === 'function' && !window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
  tasks = tasks.filter(task => task.id !== id);
  const result = await saveTasks({ disk: true });
  renderTasks();
  showToast(describeSaveResult('Task deleted', result));
};

['todo', 'progress', 'done'].forEach(col => {
  const input = document.getElementById(`input-${col}`);
  if (!input) return;
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') addTask(col);
    if (event.key === 'Escape') closeAddForm(col);
  });
});

document.querySelectorAll('#task-edit-priority .priority-opt').forEach(button => {
  button.addEventListener('click', () => {
    setEditPriority(button.dataset.p);
  });
});

document.getElementById('task-edit-close').addEventListener('click', () => closeEditModal());
document.getElementById('task-edit-cancel').addEventListener('click', () => closeEditModal());
document.getElementById('task-edit-modal').addEventListener('click', event => {
  if (event.target === document.getElementById('task-edit-modal')) closeEditModal();
});
document.getElementById('task-edit-modal').addEventListener('keydown', event => {
  if (event.key === 'Escape') closeEditModal({ restoreFocus: true });
});

document.getElementById('task-edit-save').addEventListener('click', () => {
  if (!editingTaskId) return;
  const task = tasks.find(item => item.id === editingTaskId);
  if (!task) return;

  const nextTitle = document.getElementById('task-edit-title').value.trim();
  if (!nextTitle) return;

  const activePriority = document.querySelector('#task-edit-priority .priority-opt[class*="selected-"]');
  task.title = nextTitle;
  task.detail = document.getElementById('task-edit-detail').value.trim();
  task.col = getTaskStatus();
  task.due = getTaskDate('task-edit-due-picker');
  task.priority = activePriority ? activePriority.dataset.p : 'med';

  closeEditModal();
  renderTasks();
  saveTasks({ disk: true }).then(result => {
    showToast(describeSaveResult('Task updated', result));
  }).catch(() => {
    setSaveIndicator('error', 'Save failed');
    showToast('Task updated locally, but save failed');
  });
});

async function init() {
  mountTaskDatePickers();
  mountTaskStatusPicker();
  const { data, migrated } = await workspacePersistence.loadWorkspaceData();
  tasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [];
  syncSaveIndicatorFromWorkspace();
  renderTasks();

  if (typeof workspacePersistence.subscribe === 'function') {
    workspacePersistence.subscribe((snapshot) => {
      const sections = snapshot && snapshot.data && snapshot.data.sections
        ? snapshot.data.sections
        : snapshot && snapshot.data;
      if (!sections) return;
      tasks = Array.isArray(sections.tasks) ? sections.tasks.map(normalizeTask) : [];
      syncSaveIndicatorFromWorkspace();
      renderTasks();
    });
  }

  if (migrated) showToast('Migrated local tasks into workspace-data.js');

  gsap.from('.kanban-col', {
    opacity: 0,
    y: 16,
    duration: 0.5,
    stagger: 0.1,
    ease: 'snappy'
  });
}

init();
