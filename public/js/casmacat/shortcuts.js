$(function(){

  require('jquery.hotkeys');
  
  UI.addKeyboardShortcut = function(combo, fn) {
    // XXX: Should events be attached to other DOM nodes?
    $("body, .editarea").bind('keydown', combo, fn);
  };
  
  UI.delKeyboardShortcut = function(combo, fn) {
    // XXX: Should events be detached from other DOM nodes?
    $("body, .editarea").unbind('keydown', combo, fn);
  };

  function getEditArea() {
    return UI.editarea || $('.editarea', UI.currentSegment)
  };
  
  // Define handlers as named functions to ease attaching/detaching
  
  function loadNextSegment(e) {
    e.preventDefault();
    UI.gotoNextSegment();  
  };
  
  function loadPrevSegment(e) {
    e.preventDefault();
    UI.gotoPreviousSegment();
  };
  
  function copySourceToTarget(e) {
    e.preventDefault();
    UI.copySource();
    getEditArea().editableItp('updateTokens');
  };
  
  function validateTranslation(e) {
    e.preventDefault();
    // This is copied from cat.js ¬¬
    $('.editor .translated').click();
  };
  
  function chooseSuggestion(e) {
    e.preventDefault();
    var num;
    switch(e.which) {
      case 49:  // key 1
      case 97:  // numpad 1
        num = 1;
        break;
      case 50:  // key 2
      case 98:  // numpad 2
        num = 2;
        break;
      case 51:  // key 3
      case 99:  // numpad 3
        num = 3;
      case 52:  // key 4
      case 100: // numpad 4
        num = 4;
        break;
      case 53:  // key 5
      case 101: // numpad 5
        num = 5;
    }
    UI.chooseSuggestion(num);
    getEditArea().editableItp('updateTokens');
  };
  
  function clearTarget(e) {
    e.preventDefault();
    getEditArea().editable('setText', "");
  };
  
  function saveDraft(e) {
    // Copied from cat.js
    $('.editor .draft').click();
  };
  
  // Expose this function to other modules
  UI.toggleItp = function(e) {
    e.preventDefault();
    var $ea = getEditArea();
    if ($ea.editableItp('getConfig').mode == "manual") {
      return false;
    }
    var currentMode = $ea.editableItp('getConfig').mode,
        newMode = currentMode == "ITP" ? "PE" : "ITP";
    $ea.editableItp('updateConfig', {
      mode: newMode
    });
    // Inform user via UI
    // FIXME: Selecting by ID doesn't work (!?) We must specify also the node type: a#id
    $('a#itp-indicator').text(newMode);
  };
  
  // Define key bindings here
  
  var keyBindings = {
        'Ctrl+up': loadPrevSegment,
      'Ctrl+down': loadNextSegment,
    'Ctrl+insert': copySourceToTarget,
    'Ctrl+return': validateTranslation,
         'Ctrl+1': chooseSuggestion,
         'Ctrl+2': chooseSuggestion,
         'Ctrl+3': chooseSuggestion,
         'Ctrl+4': chooseSuggestion,
         'Ctrl+5': chooseSuggestion,
       'Ctrl+del': clearTarget,
            'esc': UI.toggleItp,
         'return': saveDraft,
  };
  
  for (var k in keyBindings) {
    if (keyBindings.hasOwnProperty(k)) {
      UI.addKeyboardShortcut(k, keyBindings[k]);
    }
  }
  
});