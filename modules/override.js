define(['exports', 'apc/auxiliary', 'apc/configuration', 'apc/layout', 'apc/ui'], function (exports, auxiliary, configuration, layout, UI) {
  const { store, traceError } = auxiliary;
  const { config } = configuration;

  exports.registerPart = function (original, [part]) {
    original();
    try {
      switch (part.getId()) {
        case store.Parts?.STATUSBAR_PART:
          if (!store.statusbarPartView) { store.statusbarPartView = part; }
          break;
        case store.Parts?.EDITOR_PART:
          if (!store.editorPartView) { store.editorPartView = part; }
          break;
        case store.Parts?.PANEL_PART:
          if (!store.panelPartView) { store.panelPartView = part; }
          break;
        case store.Parts?.SIDEBAR_PART:
          if (!store.sidebarPartView) { store.sidebarPartView = part; }
          break;
        case store.Parts?.AUXILIARYBAR_PART:
          if (!store.auxiliarybarPartView) { store.auxiliarybarPartView = part; }
          break;
        case store.Parts?.ACTIVITYBAR_PART:
          if (!store.activitybarPartView) { store.activitybarPartView = part; }
          break;
        // case store.Parts?.TITLEBAR_PART:
        //   if (!store.titlebarPartView) { store.titlebarPartView = part; }
        //   break;
        // case store.Parts?.BANNER_PART:
        //   if (!store.bannerPartView) { store.bannerPartView = part; } 
        //   break;
        default:
          // console.log(part);
          break;
      }
    } catch (error) { traceError(error); }

  };

  exports.toggleZenMode = function (original) {
    const { isHorizontal } = config.activityBar;
    store.zenMode = !store.zenMode;
    isHorizontal && store.zenMode && layout.restoreActivityBar();
    original();
    isHorizontal && !store.zenMode && layout.moveActivityBar();
  };

  exports.setPartHidden = function (original, [hidden, part]) {
    if (part !== store.Parts.SIDEBAR_PART) { return original(); }
    const { isHorizontal } = config.activityBar;
    isHorizontal && hidden && layout.restoreActivityBar({ hidden });
    const res = original();
    isHorizontal && !hidden && layout.moveActivityBar();
    return res;
  };

  exports.setPanelAlignment = function (original) {
    const { isHorizontal } = config.activityBar;
    isHorizontal && layout.restoreActivityBar();
    original();
    isHorizontal && layout.moveActivityBar();
  };

  exports.setPanelPosition = function (original, [position]) {
    if (position !== store.Position.BOTTOM) { return original(); };
    const { isHorizontal } = config.activityBar;
    isHorizontal && layout.restoreActivityBar();
    original();
    isHorizontal && layout.moveActivityBar();
  };

  exports.setPartHidden = function (original, [hidden, part]) {
    if (part !== store.Parts.SIDEBAR_PART) { return original(); }
    const { isHorizontal } = config.activityBar;
    isHorizontal && hidden && layout.restoreActivityBar({ hidden });
    const res = original();
    isHorizontal && !hidden && layout.moveActivityBar();
    return res;
  };

  exports.menubarControlCreate = function (original) {
    store.menubarControlContainer = original();
    return store.menubarControlContainer;
  };

  exports.editorPartCreate = function (original) {
    original();
    if (!store.editorPartView) { store.editorPartView = this; }
  };

  exports.setVisibleActivityBar = function (original) {
    original();
    if (!config.isInline) { return; }
    try { store.layoutService.container.classList.toggle('no-activity-bar'); }
    catch (error) { traceError(error); }
  };

  exports.statusbarPartCreate = function (original, [parent]) {
    original();
    if (!store.statusbarPartView) { store.statusbarPartView = this; }
    config.handleDblclick(parent, () => config.statusBar.position.includes('top') && config.handleTitleDoubleClick());
  };

  exports.auxiliarybarPartCreate = function (original, [parent]) {
    if (!store.auxiliarybarPartView) { store.auxiliarybarPartView = this; };
    original();
    if (!config.isInline) { return; }
    config.handleDblclick(parent.querySelector('.title'), () => config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
  };

  exports.sidebarPartCreate = function (original, [parent]) {
    original();
    if (!config.isInline) { return; }
    try {
      const inlineTitle = parent.querySelector('.title');
      config.handleDblclick(inlineTitle, () => config.activityBar.position !== 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      UI.prependDiv(inlineTitle, 'inline-titlebar-placeholder');
    }
    catch (error) { traceError(error); }
  };

  exports.activitybarUpdateStyles = function (original) {
    original();
    try {
      const color = config.getColor('editorGroupHeader.border');
      store.layoutService.container.style.setProperty('--title-border-bottom-color', color);
      const { isHorizontal } = config.activityBar;
      const action = isHorizontal ? 'remove' : 'add';
      this.getContainer().querySelectorAll('div.monaco-action-bar')?.forEach(el => el.classList[action]('vertical'));
    }
    catch (error) { traceError(error); }
  };

  exports.activitybarLayout = function (original, [width, height]) {
    original();
    try {
      const { orientation, size, position } = config.activityBar;

      if (orientation === 1 || height === undefined || !(layout.isVisible(store.Parts.ACTIVITYBAR_PART))) { return; }
      const sideBarPosition = store.layoutService.getSideBarPosition();

      const padding = sideBarPosition !== store.Position.RIGHT && position === 'top' && config.electron.titleBarStyle && config.statusBar.position !== 'top' ? 55 : 0;
      const menubar = store.menubarControlContainer.isConnected ? size : 0;
      const viewItems = store.globalActivityActionBar?.domNode?.isConnected ? (store.globalActivityActionBar.viewItems.length) * size : 0;
      const availableSize = width - viewItems - menubar - padding;

      store.activityBarCompositeBar.layout(new store.Dimension(height, availableSize));
    }
    catch (error) { traceError(error); }
  };

  exports.activitybarCreate = function (original, [parent]) {
    original();
    if (!config.isInline) { return; }
    try {
      if (!layout.isVisible(store.Parts.ACTIVITYBAR_PART)) { store.layoutService.container.classList.add('no-activity-bar'); }
      UI.prependDiv(parent, 'activity-bar-placeholder');
      config.handleDblclick(parent.querySelector('.content'), () => config.activityBar.position === 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
    }
    catch (error) { traceError(error); }
  };

});
