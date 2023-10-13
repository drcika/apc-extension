define(
  ['exports', 'apc/auxiliary', 'apc/configuration'],
  (exports, auxiliary, configuration) => {
    try {
      const { traceError, store, services } = auxiliary;
      const { config } = configuration;

      store.previousActivityBarConfig = { size: config.ACTIVITY_BAR_SIZE, hideSettings: false };

      function toggleSettings(hideSettings) {
        try {
          const content = store.activitybarPartView.getContainer().querySelector('.content');
          if (!store.globalActivitiesContainer) { store.globalActivitiesContainer = content.querySelector('.global-activity-actionbar'); };
          const isConnected = store.globalActivitiesContainer?.isConnected;

          if (hideSettings && isConnected) { content.removeChild(store.globalActivitiesContainer); }
          if (!hideSettings && !isConnected) { content.appendChild(store.globalActivitiesContainer); }

          store.previousActivityBarConfig.hideSettings = hideSettings;
        } catch (error) { traceError(error); }
      };

      function updateActivityBarClassList(isHorizontal) {
        try { store.activitybarPartView.getContainer().querySelectorAll('div.monaco-action-bar').forEach(el => el.classList[isHorizontal ? 'remove' : 'add']('vertical')); }
        catch (error) { traceError(error); }
      };

      function updateActivityBarItemSize(options) {
        try {
          if (!store.activityBarCompositeBar?.activityBarOptions) { return; }
          // relies on reference
          const options = store.activityBarCompositeBar.activityBarOptions;
          const size = config.activityBar.itemSize;
          options.overflowActionSize = size;
          options.compositeSize = size + config.activityBar.itemMargin;
          store.activityBarCompositeBar.recomputeSizes();

          store.activitybarPartView.layout();
        } catch (error) { traceError(error); }
      };

      function switchPosition() {
        try {
          const { size, position } = config.activityBar;
          store.workbenchGrid.moveView(store.activitybarPartView, size, store.sidebarPartView, position === 'top' ? store.Direction.Up : store.Direction.Down);
          store.previousActivityBarConfig.position = position;
        } catch (error) { traceError(error); }
      };

      function move() {
        try {
          if (!config.isVisible(store.Parts.ACTIVITYBAR_PART)) { return; }
          const { size, position, isHorizontal } = config.activityBar;

          const activitybarPartViewSize = store.workbenchGrid.getViewSize(store.activitybarPartView);
          const auxiliarybarPartViewSize = store.workbenchGrid.getViewSize(store.auxiliarybarPartView);
          const sidebarPartViewSize = store.workbenchGrid.getViewSize(store.sidebarPartView);
          // redistributing size, preventing jumps
          store.activitybarPartView.minimumWidth = 0;
          store.activitybarPartView.layout(0, activitybarPartViewSize.heigth);

          // add placeholder in place of the original, for later easier restore
          // and avoiding complex logic where which panel is located
          store.dummActivitybarPartView.minimumHeight = store.activitybarPartView.minimumHeight;
          store.dummActivitybarPartView.maximumHeight = store.activitybarPartView.maximumHeight;
          store.workbenchGrid.addView(store.dummActivitybarPartView, 0, store.activitybarPartView, store.Direction.Left);

          store.activitybarPartView.minimumWidth = store.sidebarPartView.minimumWidth;
          store.activitybarPartView.maximumWidth = store.sidebarPartView.maximumWidth;
          store.activitybarPartView.minimumHeight = size;
          store.activitybarPartView.maximumHeight = size;

          store.workbenchGrid.moveView(store.activitybarPartView, size, store.sidebarPartView, position === 'top' ? store.Direction.Up : store.Direction.Down);
          store.workbenchGrid.resizeView(store.auxiliarybarPartView, auxiliarybarPartViewSize);
          store.workbenchGrid.resizeView(store.sidebarPartView, sidebarPartViewSize);

          updateActivityBarClassList(isHorizontal);

          store.previousActivityBarConfig.position = position;
          store.previousActivityBarConfig.size = size;
        } catch (error) { traceError(error); }
      };

      function restore({ hidden } = {}) {
        try {
          const { size, isHorizontal } = config.activityBar;
          const auxiliarybarPartViewSize = store.workbenchGrid.getViewSize(store.auxiliarybarPartView);
          const sidebarPartViewSize = store.workbenchGrid.getViewSize(store.sidebarPartView);

          store.workbenchGrid.removeView(store.activitybarPartView);

          const width = hidden ? 0 : size;
          store.activitybarPartView.minimumHeight = store.dummActivitybarPartView.minimumHeight;
          store.activitybarPartView.maximumHeight = store.dummActivitybarPartView.maximumHeight;
          store.activitybarPartView.minimumWidth = width;
          store.activitybarPartView.maximumWidth = width;

          store.workbenchGrid.addView(store.activitybarPartView, width, store.dummActivitybarPartView, store.Direction?.Left);
          store.workbenchGrid.removeView(store.dummActivitybarPartView);
          store.workbenchGrid.resizeView(store.auxiliarybarPartView, auxiliarybarPartViewSize);
          store.workbenchGrid.resizeView(store.sidebarPartView, sidebarPartViewSize);

          updateActivityBarClassList(isHorizontal);

          store.previousActivityBarConfig.position = undefined;
          store.previousActivityBarConfig.size = width;
        } catch (error) { traceError(error); }
      };

      function updateSize() {
        try {
          const { size, isHorizontal } = config.activityBar;
          const sidebarPartViewSize = store.workbenchGrid.getViewSize(store.sidebarPartView);
          store.activitybarPartView.minimumWidth = isHorizontal ? 0 : size;
          store.activitybarPartView.maximumWidth = isHorizontal ? Infinity : size;
          store.activitybarPartView.minimumHeight = isHorizontal ? size : 0;
          store.activitybarPartView.maximumHeight = isHorizontal ? size : Infinity;

          updateActivityBarClassList(isHorizontal);

          services.layoutService.layout();
          store.workbenchGrid.resizeView(store.sidebarPartView, sidebarPartViewSize);

          store.previousActivityBarConfig.size = size;
        } catch (error) { traceError(error); }
      };

      function update() {
        try {
          const { size, position, hideSettings } = config.activityBar;
          if (hideSettings !== store.previousActivityBarConfig.hideSettings) { toggleSettings(hideSettings); }

          if (!config.isVisible(store.Parts.SIDEBAR_PART)) {
            if (position) {
              store.activitybarPartView.minimumWidth = 0;
              store.activitybarPartView.maximumWidth = 0;
              services.layoutService.layout();
            }
            else { updateSize(); }
          }

          // regular --> top/bottom
          else if (!store.previousActivityBarConfig.position && position) { move(); }

          // top/bottom --> regular
          else if (store.previousActivityBarConfig.position && !position) { restore(); }

          // top <--> bottom
          else if (store.previousActivityBarConfig.position && position && store.previousActivityBarConfig.position !== position) { switchPosition(); }

          else if (store.previousActivityBarConfig.size !== size) { updateSize(); }

          updateActivityBarItemSize();
        } catch (error) { traceError(error); }
      };

      exports.init = function () {
        try {
          if (store.zenMode) { return; };
          const { size, position, hideSettings } = config.activityBar;
          toggleSettings(hideSettings);

          if (!store.previousActivityBarConfig.position && position) {
            if (config.isVisible(store.Parts.SIDEBAR_PART)) {
              move();
            }
            else {
              store.activitybarPartView.minimumWidth = 0;
              store.activitybarPartView.maximumWidth = 0;

              services.layoutService.layout();

              store.previousActivityBarConfig.position = position;
              store.previousActivityBarConfig.size = 0;
            }
          }
          else if (store.previousActivityBarConfig.size !== size) {
            updateSize();
          }

          updateActivityBarItemSize();

        } catch (error) { traceError(error); }
      };

      exports.onChangeVisibility = function () {
        config.isVisible(store.Parts.ACTIVITYBAR_PART) ?
          store.previousActivityBarConfig.position && restore() :
          queueMicrotask(update);
      };

      exports.update = update;
      exports.restore = restore;
      exports.move = move;
    } catch (error) { traceError(error); }

  });
