define(['exports', 'apc/auxiliary', 'apc/configuration'], (exports, auxiliary, configuration) => {
  try {
    const { traceError, store } = auxiliary;
    const { config } = configuration;

    store.previousStatusBarConfig = { height: config.STATUSBAR_HEIGHT, position: 'bottom' };

    function move() {
      try {
        // add placeholder in place of the original, for later easier restore
        // and avoiding complex logic where which panel is located
        store.dummStatusbarPartView.minimumWidth = store.statusbarPartView.minimumWidth;
        store.dummStatusbarPartView.maximumWidth = store.statusbarPartView.maximumWidth;
        store.workbenchGrid.addView(store.dummStatusbarPartView, 0, store.statusbarPartView, store.Direction.Down);

        switchPosition();
      } catch (error) { traceError(error); }
    };

    function switchPosition() {
      try {
        const { position, height } = config.statusBar;

        const isUnderPanel = position === 'editor-bottom' && store.layoutService.getPanelPosition() === store.Position.BOTTOM;
        const isEditor = position.includes('editor');

        store.statusbarPartView.minimumWidth = isUnderPanel ? store.panelPartView.minimumWidth : isEditor ? store.editorPartView.minimumWidth : store.statusbarPartView.minimumWidth;
        store.statusbarPartView.maximumWidth = isUnderPanel ? store.panelPartView.maximumWidth : isEditor ? store.editorPartView.maximumWidth : store.statusbarPartView.maximumWidth;
        store.statusbarPartView.minimumHeight = height;
        store.statusbarPartView.maximumHeight = height;

        if (isUnderPanel) {
          store.workbenchGrid.removeView(store.statusbarPartView);
          store.workbenchGrid.addView(store.statusbarPartView, height, store.panelPartView, store.Direction.Down);
        }
        else if (isEditor) {
          const placment = position === 'editor-top' ? store.Direction.Up : store.Direction.Down;
          store.workbenchGrid.moveView(store.statusbarPartView, height, store.editorPartView, placment);
        }
        else {
          store.workbenchGrid.moveViewTo(store.statusbarPartView, [store.Direction.Up]);
        }

        store.previousStatusBarConfig.position = position;
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function restore() {
      try {
        const { height } = config.statusBar;
        store.workbenchGrid.removeView(store.statusbarPartView);

        store.statusbarPartView.minimumWidth = store.dummStatusbarPartView.minimumWidth;
        store.statusbarPartView.maximumWidth = store.dummStatusbarPartView.maximumWidth;
        store.statusbarPartView.minimumHeight = height;
        store.statusbarPartView.maximumHeight = height;

        store.workbenchGrid.addView(store.statusbarPartView, height, store.dummStatusbarPartView, store.Direction.Down);
        store.workbenchGrid.removeView(store.dummStatusbarPartView);

        store.previousStatusBarConfig.position = 'bottom';
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function updateSize() {
      try {
        const { height } = config.statusBar;
        store.statusbarPartView.minimumHeight = height;
        store.statusbarPartView.maximumHeight = height;

        store.layoutService.layout();
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
