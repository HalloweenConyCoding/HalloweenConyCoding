(function (global) {
  'use strict';

  var TEMPLATE = {
    meta: { version: 1, savedAt: '', savedBy: 'PUBLIC WORKSPACE' },
    sections: { tasks: [], calendarNotes: {} }
  };

  function createWorkspaceTemplateSource() {
    return 'window.WORKSPACE_DATA = ' + JSON.stringify(TEMPLATE, null, 2) + ';\n';
  }

  function downloadWorkspaceTemplate() {
    var blob = new Blob([createWorkspaceTemplateSource()], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'workspace-data.js';
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  global.PublicWorkspaceLanding = {
    createWorkspaceTemplateSource: createWorkspaceTemplateSource,
    downloadWorkspaceTemplate: downloadWorkspaceTemplate
  };

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('download-workspace-template');
    if (button) button.addEventListener('click', downloadWorkspaceTemplate);
  });
}(window));
