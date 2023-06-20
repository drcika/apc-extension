define(
  ['exports', 'apc/auxiliary', 'apc/configuration', 'apc/layout.statusbar', 'apc/layout.activitybar'],
  (exports, auxiliary, configuration, statusbar, activitybar) => {
    try {
      const { traceError, store } = auxiliary;
      const { config } = configuration;

      exports.init = function () {
        store.zenMode = store.storageService.getBoolean('workbench.zenMode.active', 1);
        activitybar.init();
        statusbar.update();
        updateSideBarClass();
      };

      exports.onChangeSidebarPosition = function () {
        try {
          const isHorizontal = config.activityBar.isHorizontal;
          const isTopStatusBarPosition = config.statusBar.position === 'top';

          isHorizontal && activitybar.restore();
          isTopStatusBarPosition && statusbar.restore();

          queueMicrotask(() => {
            isHorizontal && activitybar.move();
            isTopStatusBarPosition && statusbar.move();
            updateSideBarClass();
          });
        } catch (error) { traceError(error); }
      };

      function updateSideBarClass() {
        try {
          const sideBarPosition = store.layoutService.getSideBarPosition();
          const isRight = sideBarPosition === store.Position.RIGHT;
          store.layoutService.container.classList[isRight ? 'add' : 'remove']('sidebar-right');
        } catch (error) { traceError(error); }
      };

      exports.updateSideBarClass = updateSideBarClass;
    } catch (error) { traceError(error); }

  });
