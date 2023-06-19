define(['exports', 'apc/auxiliary', 'apc/configuration'], (exports, auxiliary, configuration) => {
  const { traceError, store } = auxiliary;
  const { config } = configuration;

  try {
    store.previousActivityBarConfig = { size: config.ACTIVITY_BAR_SIZE, hideSettings: false };
    store.previousStatusBarConfig = { height: config.STATUSBAR_HEIGHT, position: 'bottom' };

    // ?? start | reload with zen mode
    // from storage ?? 'zenMode.active'
    store.zenMode = false;

    exports.init = function () {
      updateActivityBar();
      updateSideBarClass();
      updateStatusBar();

    };

    function isVisible(part) {
      try { return store.layoutService.isVisible(part); }
      catch (error) { traceError(error); }
      return false;
    };
    exports.isVisible = isVisible;

    function toggleActivityBarSettings(hideSettings) {
      try {
        const content = store.activitybarPartView.getContainer().querySelector('.content');
        if (!store.globalActivitiesContainer) { store.globalActivitiesContainer = content.childNodes[1]; };
        const isConnected = store.globalActivitiesContainer.isConnected;

        if (hideSettings && isConnected) { content.removeChild(store.globalActivitiesContainer); }
        if (!hideSettings && !isConnected) { content.appendChild(store.globalActivitiesContainer); }

        store.previousActivityBarConfig.hideSettings = hideSettings;
      } catch (error) { traceError(error); }
    };
    exports.toggleActivityBarSettings = toggleActivityBarSettings;

    function updateActivityBarClassList(isHorizontal) {
      try { store.activitybarPartView.getContainer().querySelectorAll('div.monaco-action-bar').forEach(el => el.classList[isHorizontal ? 'remove' : 'add']('vertical')); }
      catch (error) { traceError(error); }
    };
    exports.updateActivityBarClassList = updateActivityBarClassList;

    function updateActivityBarItemSize(options) {
      try {
        // relies on reference
        const size = config.activityBar.size;
        options.overflowActionSize = size;
        options.compositeSize = size + 3; // 3 margine
      } catch (error) { traceError(error); }
    };
    exports.updateActivityBarItemSize = updateActivityBarItemSize;

    function moveActivityBar() {
      try {
        const { size, position, isHorizontal } = config.activityBar;

        const activitybarPartViewSize = store.workbenchGrid.getViewSize(store.activitybarPartView);

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

        updateActivityBarClassList(isHorizontal);

        store.previousActivityBarConfig.position = position;
        store.previousActivityBarConfig.size = size;
      } catch (error) { traceError(error); }
    };
    exports.moveActivityBar = moveActivityBar;

    function restoreActivityBar({ hidden } = {}) {
      try {
        const { size, isHorizontal } = config.activityBar;

        store.workbenchGrid.removeView(store.activitybarPartView);

        const width = hidden ? 0 : size;
        store.activitybarPartView.minimumHeight = store.dummActivitybarPartView.minimumHeight;
        store.activitybarPartView.maximumHeight = store.dummActivitybarPartView.maximumHeight;
        store.activitybarPartView.minimumWidth = width;
        store.activitybarPartView.maximumWidth = width;

        store.workbenchGrid.addView(store.activitybarPartView, width, store.dummActivitybarPartView, store.Direction?.Left);
        store.workbenchGrid.removeView(store.dummActivitybarPartView);

        updateActivityBarClassList(isHorizontal);

        store.previousActivityBarConfig.position = undefined;
        store.previousActivityBarConfig.size = width;
      } catch (error) { traceError(error); }
    };
    exports.restoreActivityBar = restoreActivityBar;

    function updateActivityBarSize() {
      try {
        const { size, isHorizontal } = config.activityBar;
        store.activitybarPartView.minimumWidth = isHorizontal ? 0 : size;
        store.activitybarPartView.maximumWidth = isHorizontal ? Infinity : size;
        store.activitybarPartView.minimumHeight = isHorizontal ? size : 0;
        store.activitybarPartView.maximumHeight = isHorizontal ? size : Infinity;

        store.layoutService.layout();
        store.previousActivityBarConfig.size = size;
      } catch (error) { traceError(error); }
    };
    exports.updateActivityBarSize = updateActivityBarSize;

    function updateActivityBar() {
      try {
        const { size, position, hideSettings } = config.activityBar;

        if (hideSettings !== store.previousActivityBarConfig.hideSettings) {
          toggleActivityBarSettings(hideSettings);
        }

        // regular --> top/bottom
        if (!store.previousActivityBarConfig.position && position) {
          moveActivityBar();
        }
        // top/bottom --> regular
        else if (store.previousActivityBarConfig.position && !position) {
          restoreActivityBar();
        }
        // top <--> bottom
        else if (store.previousActivityBarConfig.position && position && store.previousActivityBarConfig.position !== position) {
          // !! direction ?? TOP BOTTOM
          // !! same as status bar
          store.workbenchGrid.moveView(store.activitybarPartView, size, store.sidebarPartView, position === 'top' ? 0 : 1);
          store.previousActivityBarConfig.position = position;
        }
        else if (store.previousActivityBarConfig.size !== size) {
          updateActivityBarSize();
        }

        if (store.activityBarCompositeBar?.activityBarOptions && size !== store.previousActivityBarConfig.size) {
          updateActivityBarItemSize(store.activityBarCompositeBar.activityBarOptions);
          store.activityBarCompositeBar.recomputeSizes();
        }
      } catch (error) { traceError(error); }
    };
    exports.updateActivityBar = updateActivityBar;

    function moveStatusBar() {
      try {
        // add placeholder in place of the original, for later easier restore
        // and avoiding complex logic where which panel is located
        store.dummStatusbarPartView.minimumWidth = store.statusbarPartView.minimumWidth;
        store.dummStatusbarPartView.maximumWidth = store.statusbarPartView.maximumWidth;
        store.workbenchGrid.addView(store.dummStatusbarPartView, 0, store.statusbarPartView, store.Direction?.Down ?? 1);

        switchStatusbarPosition();
      } catch (error) { traceError(error); }
    };
    exports.moveStatusBar = moveStatusBar;

    function switchStatusbarPosition() {
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
    exports.switchStatusbarPosition = switchStatusbarPosition;

    function restoreStatusbar() {
      try {
        const { position, height } = config.statusBar;
        store.workbenchGrid.removeView(store.statusbarPartView);

        store.statusbarPartView.minimumWidth = store.dummStatusbarPartView.minimumWidth;
        store.statusbarPartView.maximumWidth = store.dummStatusbarPartView.maximumWidth;
        store.statusbarPartView.minimumHeight = height;
        store.statusbarPartView.maximumHeight = height;

        store.workbenchGrid.addView(store.statusbarPartView, 0, store.dummStatusbarPartView, store.Direction.Down);
        store.workbenchGrid.removeView(store.dummStatusbarPartView);

        store.previousStatusBarConfig.position = position;
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };
    exports.restoreStatusbar = restoreStatusbar;

    function updateStatusBarSize() {
      try {
        const { height } = config.statusBar;

        store.statusbarPartView.minimumHeight = height;
        store.statusbarPartView.maximumHeight = height;

        store.layoutService.layout();
        store.previousStatusBarConfig.height = height;
      } catch (error) { traceError(error); }
    };
    exports.updateStatusBarSize = updateStatusBarSize;

    function updateStatusBar() {
      try {
        const { position, height } = config.statusBar;
        const prevPosition = store.previousStatusBarConfig.position;
        if (position === 'bottom' && prevPosition !== 'bottom') {
          restoreStatusbar();
        }
        else if (position !== 'bottom' && prevPosition === 'bottom') {
          moveStatusBar();
        }
        else if (prevPosition !== position) {
          switchStatusbarPosition();
        }
        else if (store.previousStatusBarConfig.height !== height) {
          updateStatusBarSize();
        }
      } catch (error) { traceError(error); }
    };
    exports.updateStatusBar = updateStatusBar;

    function onChangeSideBarPosition() {
      try {
        const isHorizontal = config.activityBar.isHorizontal;
        const isTopStatusBarPosition = config.statusBar.position === 'top';

        isHorizontal && restoreActivityBar();
        isTopStatusBarPosition && restoreStatusbar();

        queueMicrotask(() => {
          isHorizontal && moveActivityBar();
          isTopStatusBarPosition && moveStatusBar();
          updateSideBarClass();
        });
      } catch (error) { traceError(error); }
    };
    exports.onChangeSideBarPosition = onChangeSideBarPosition;

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
