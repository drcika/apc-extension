define(['exports', 'apc/auxiliary', 'apc/configuration'], (exports, auxiliary, configuration) => {
  try {
    const { traceError, store, services } = auxiliary;
    const { config } = configuration;

    store.previousStatusBarConfig = { height: config.STATUSBAR_HEIGHT, position: 'bottom' };

    function move() {
      try {
        // add placeholder in place of the original, for later easier restore
        // and avoiding complex logic where which panel is located
        store.dummStatusbarPartView.minimumWidth = services.statusbarService.minimumWidth;
        store.dummStatusbarPartView.maximumWidth = services.statusbarService.maximumWidth;
        store.workbenchGrid.addView(store.dummStatusbarPartView, 0, services.statusbarService, store.Direction.Down);

        switchPosition();
      } catch (error) { traceError(error); }
    };

    function switchPosition() {
      try {
        const { position, height } = config.statusBar;

        const isUnderPanel = position === 'editor-bottom' && services.layoutService.getPanelPosition() === store.Position.BOTTOM;
        const isEditor = position.includes('editor');

        services.statusbarService.minimumWidth = isUnderPanel ? store.panelPartView.minimumWidth : isEditor ? services.editorGroupsService.minimumWidth : services.statusbarService.minimumWidth;
        services.statusbarService.maximumWidth = isUnderPanel ? store.panelPartView.maximumWidth : isEditor ? services.editorGroupsService.maximumWidth : services.statusbarService.maximumWidth;
        services.statusbarService.minimumHeight = height;
        services.statusbarService.maximumHeight = height;

        if (isUnderPanel) {
          store.workbenchGrid.removeView(services.statusbarService);
          store.workbenchGrid.addView(services.statusbarService, height, store.panelPartView, store.Direction.Down);
        }
        else if (isEditor) {
          const placment = position === 'editor-top' ? store.Direction.Up : store.Direction.Down;
          store.workbenchGrid.moveView(services.statusbarService, height, services.editorGroupsService, placment);
        }
        else {
          store.workbenchGrid.moveViewTo(services.statusbarService, [store.Direction.Up]);
        }

        store.previousStatusBarConfig.position = position;
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function restore() {
      try {
        const { height } = config.statusBar;
        store.workbenchGrid.removeView(services.statusbarService);

        services.statusbarService.minimumWidth = store.dummStatusbarPartView.minimumWidth;
        services.statusbarService.maximumWidth = store.dummStatusbarPartView.maximumWidth;
        services.statusbarService.minimumHeight = height;
        services.statusbarService.maximumHeight = height;

        store.workbenchGrid.addView(services.statusbarService, height, store.dummStatusbarPartView, store.Direction.Down);
        store.workbenchGrid.removeView(store.dummStatusbarPartView);

        store.previousStatusBarConfig.position = 'bottom';
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };

    function updateSize() {
      try {
        const { height } = config.statusBar;
        services.statusbarService.minimumHeight = height;
        services.statusbarService.maximumHeight = height;

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
