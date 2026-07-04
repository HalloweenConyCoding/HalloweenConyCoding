(function () {
  'use strict';

  const startedAt = new Date().toISOString();
  const demoData = {
    tasks: [
      {
        id: 'demo-task-1',
        title: 'Task 1',
        detail: 'Example task detail 1. Edit this card, move it to another column, then refresh to see the demo reset.',
        col: 'todo',
        priority: 'high',
        due: '2026-07-06',
        createdAt: '2026-07-04T08:00:00.000Z'
      },
      {
        id: 'demo-task-2',
        title: 'Task 2',
        detail: 'Example task detail 2. This item starts in To Do with a medium priority.',
        col: 'todo',
        priority: 'med',
        due: '2026-07-08',
        createdAt: '2026-07-04T08:05:00.000Z'
      },
      {
        id: 'demo-task-3',
        title: 'Task 3',
        detail: 'Example task detail 3. This item starts in progress.',
        col: 'progress',
        priority: 'med',
        due: '2026-07-09',
        createdAt: '2026-07-04T08:10:00.000Z'
      },
      {
        id: 'demo-task-4',
        title: 'Task 4',
        detail: 'Example task detail 4. Try editing the detail text from the modal.',
        col: 'progress',
        priority: 'high',
        due: '2026-07-12',
        createdAt: '2026-07-04T08:15:00.000Z'
      },
      {
        id: 'demo-task-5',
        title: 'Task 5',
        detail: 'Example task detail 5. This card is already done.',
        col: 'done',
        priority: 'low',
        due: '2026-07-14',
        createdAt: '2026-07-04T08:20:00.000Z'
      },
      {
        id: 'demo-task-6',
        title: 'Task 6',
        detail: 'Example task detail 6. Demo changes are memory-only.',
        col: 'done',
        priority: 'low',
        due: '2026-07-17',
        createdAt: '2026-07-04T08:25:00.000Z'
      }
    ],
    calendarNotes: {
      '2026-07-06': [
        { id: 'demo-event-1', title: 'Event 1', time: '09:00', tag: 'work', note: 'Category tag: Work. Edits reset after refresh.' }
      ],
      '2026-07-08': [
        { id: 'demo-event-2', title: 'Event 2', time: '10:30', tag: 'personal', note: 'Category tag: Personal.' }
      ],
      '2026-07-09': [
        { id: 'demo-event-3', title: 'Event 3', time: '13:00', tag: 'deadline', note: 'Category tag: Training.' }
      ],
      '2026-07-12': [
        { id: 'demo-event-4', title: 'Event 4', time: '15:15', tag: 'site', note: 'Category tag: Study.' }
      ],
      '2026-07-14': [
        { id: 'demo-event-5', title: 'Event 5', time: '07:30', tag: 'exercise', note: 'Category tag: Exercise.' }
      ],
      '2026-07-17': [
        { id: 'demo-event-6', title: 'Event 6', time: '11:45', tag: 'note', note: 'Category tag: Holiday.' }
      ]
    }
  };

  const sections = {
    tasks: demoData.tasks,
    notes: [],
    noteCategories: [],
    noteTagOptions: [],
    noteTemplates: [],
    sites: [],
    siteStatusPipeline: [],
    links: [],
    calendarNotes: demoData.calendarNotes,
    habitsList: [],
    habitsChecks: {},
    journal: {},
    analyzerCharts: [],
    rfAnalyzer: {},
    siteAudits: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function result(source, status, extra) {
    return Object.assign({
      data: clone(sections),
      source: source || 'memory',
      status: status || 'buffered',
      migrated: false,
      dirty: true,
      hasHandle: false,
      permission: 'demo-memory-only',
      savedAt: startedAt,
      reason: 'demo-memory-only'
    }, extra || {});
  }

  function writeSection(section, value) {
    sections[section] = clone(value);
    return Promise.resolve(result('memory', 'buffered'));
  }

  window.workspacePersistence = {
    loadWorkspaceData: function () {
      return Promise.resolve(result('memory', 'buffered'));
    },
    readLocalSnapshot: function () {
      return clone(sections);
    },
    saveWorkspaceData: function (data) {
      Object.keys(sections).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(data || {}, key)) {
          sections[key] = clone(data[key]);
        }
      });
      return Promise.resolve(result('memory', 'buffered'));
    },
    bufferWorkspaceData: function (data) {
      return this.saveWorkspaceData(data);
    },
    saveSection: writeSection,
    bufferSection: writeSection,
    autoSaveSection: writeSection,
    saveToDisk: function () {
      return Promise.resolve(result('memory', 'blocked', { reason: 'demo-no-disk-save' }));
    },
    connect: function () {
      return Promise.resolve(false);
    },
    subscribe: function (listener) {
      if (typeof listener === 'function') {
        listener({
          data: clone({ meta: { version: 1, savedAt: startedAt, savedBy: 'DEMO' }, sections }),
          dirty: true,
          hasHandle: false,
          supportsFileSystemAccess: false,
          indexedDbMode: 'disabled',
          permission: 'demo-memory-only',
          restoreBuffer: null,
          status: { kind: 'demo', message: 'Demo only - changes reset on refresh.' },
          hint: 'Demo state is in memory only.',
          lastError: '',
          machineLabel: 'DEMO'
        });
      }
      return function unsubscribe() {};
    }
  };
})();
