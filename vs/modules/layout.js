define(
  ['exports', 'vs/modules/auxiliary', 'vs/modules/configuration', 'vs/modules/layout.statusbar', 'vs/modules/layout.activitybar'],
  (exports, auxiliary, configuration, statusbar, activitybar) => {
    try {
      const { traceError, store, services } = auxiliary;
      const { config } = configuration;

      exports.init = function () {
        store.zenMode = services.storageService.getBoolean('workbench.zenMode.active', 1);
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
          const sideBarPosition = services.layoutService.getSideBarPosition();
          const isRight = sideBarPosition === store.Position.RIGHT;
          services.layoutService.mainContainer.classList[isRight ? 'add' : 'remove']('sidebar-right');
        } catch (error) { traceError(error); }
      };

      function updateTabsClasses() {
        try { 
          services.editorGroupsService.groups.forEach(group => {
            const key = group.groupsView?.getId()?.includes('auxiliaryEditor') ? 'add' : group.element.getBoundingClientRect().top < 30 ? 'add' : 'remove';
            group.element.classList[key]('editor-group-top');
          }); 
        }
        catch (error) { traceError(error); }
      }

      exports.updateTabsClasses = updateTabsClasses;
      exports.updateSideBarClass = updateSideBarClass;
    } catch (error) { traceError(error); }

  });
