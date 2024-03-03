define(['exports', 'vs/modules/auxiliary', 'vs/modules/configuration'], (exports, auxiliary, configuration) => {
  try {
    const { traceError, store, services } = auxiliary;
    const { config } = configuration;

    store.previousStatusBarConfig = { height: config.STATUSBAR_HEIGHT, position: 'bottom' };

    function move() {
      try {
        // add placeholder in place of the original, for later easier restore
        // and avoiding complex logic where which panel is located
        store.dummStatusbarPartView.minimumWidth = store.statusBarPartView.minimumWidth;
        store.dummStatusbarPartView.maximumWidth = store.statusBarPartView.maximumWidth;
        store.workbenchGrid.addView(store.dummStatusbarPartView, 0, store.statusBarPartView, store.Direction.Down);

        switchPosition();
      } catch (error) { traceError(error); }
    };

    function switchPosition() {
      try {
        const { position, height } = config.statusBar;

        const isUnderPanel = position === 'editor-bottom' && services.layoutService.getPanelPosition() === store.Position.BOTTOM;
        const isEditor = position.includes('editor');
        
        store.statusBarPartView.minimumWidth = isUnderPanel ? store.panelPartView.minimumWidth : isEditor ? services.editorGroupsService.mainPart.minimumWidth : store.statusBarPartView.minimumWidth;
        store.statusBarPartView.maximumWidth = isUnderPanel ? store.panelPartView.maximumWidth : isEditor ? services.editorGroupsService.mainPart.maximumWidth : store.statusBarPartView.maximumWidth;
        store.statusBarPartView.minimumHeight = height;
        store.statusBarPartView.maximumHeight = height;

        if (isUnderPanel) {
          store.workbenchGrid.removeView(store.statusBarPartView);
          store.workbenchGrid.addView(store.statusBarPartView, height, store.panelPartView, store.Direction.Down);
        }
        else if (isEditor) {
          const placment = position === 'editor-top' ? store.Direction.Up : store.Direction.Down;          
          store.workbenchGrid.moveView(store.statusBarPartView, height, services.editorGroupsService.mainPart, placment);
        }
        else {
          store.workbenchGrid.moveViewTo(store.statusBarPartView, [store.Direction.Up]);
        }

        store.previousStatusBarConfig.position = position;
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function restore() {
      try {
        const { height } = config.statusBar;
        store.workbenchGrid.removeView(store.statusBarPartView);

        store.statusBarPartView.minimumWidth = store.dummStatusbarPartView.minimumWidth;
        store.statusBarPartView.maximumWidth = store.dummStatusbarPartView.maximumWidth;
        store.statusBarPartView.minimumHeight = height;
        store.statusBarPartView.maximumHeight = height;

        store.workbenchGrid.addView(store.statusBarPartView, height, store.dummStatusbarPartView, store.Direction.Down);
        store.workbenchGrid.removeView(store.dummStatusbarPartView);

        store.previousStatusBarConfig.position = 'bottom';
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function updateSize() {
      try {
        const { height } = config.statusBar;
        store.statusBarPartView.minimumHeight = height;
        store.statusBarPartView.maximumHeight = height;

        services.layoutService.layout();
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function update() {
      try {
        if (!config.isVisible(store.Parts.STATUSBAR_PART) || store.zenMode) { return; }
        const { position, height } = config.statusBar;
        const prevPosition = store.previousStatusBarConfig.position;

        if (position === 'bottom' && prevPosition !== 'bottom') { restore(); }

        else if (position !== 'bottom' && prevPosition === 'bottom') { move(); }

        else if (prevPosition !== position) { switchPosition(); }

        else if (store.previousStatusBarConfig.height !== height) { updateSize(); }

      } catch (error) { traceError(error); }
    };

    exports.onChangeVisibility = function () {
      config.isVisible(store.Parts.STATUSBAR_PART) ?
        config.statusBar.position !== 'bottom' && restore() :
        queueMicrotask(update);
    };

    exports.update = update;
    exports.move = move;
    exports.restore = restore;

  } catch (error) { traceError(error); }

});
