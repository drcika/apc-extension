define(
  ['exports', 'apc/auxiliary', 'apc/configuration', 'apc/layout', 'apc/ui', 'apc/layout.statusbar', 'apc/layout.activitybar'],
  function (exports, auxiliary, configuration, layout, UI, statusbar, activitybar) {
    const { store, traceError } = auxiliary;
    const { config } = configuration;

    exports.startup = function (original) {
      const res = original();
      layout.init();
      return res;
    };

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
      // fire on init if zenMode == true
      if (!store.initialised) { return original(); }
      store.zenMode = !store.zenMode;
      if (store.zenMode) {
        config.activityBar.isHorizontal && activitybar.restore();
        config.statusBar.position !== 'bottom' && statusbar.restore();
      }
      original();
      if (!store.zenMode) {
        config.activityBar.isHorizontal && activitybar.move();
        config.statusBar.position !== 'bottom' && statusbar.update();
      }
    };

    exports.setPanelAlignment = function (original) {
      const { isHorizontal } = config.activityBar;
      isHorizontal && activitybar.restore();
      original();
      isHorizontal && activitybar.move();
    };

    exports.setPanelPosition = function (original, [position]) {
      if (position !== store.Position.BOTTOM) { return original(); };
      const { isHorizontal } = config.activityBar;
      isHorizontal && activitybar.restore();
      original();
      isHorizontal && activitybar.move();
    };

    exports.setPartHidden = function (original, [hidden, part]) {
      if (part !== store.Parts.SIDEBAR_PART) { return original(); }
      const { isHorizontal } = config.activityBar;
      isHorizontal && hidden && activitybar.restore({ hidden });
      const res = original();
      isHorizontal && !hidden && activitybar.move();
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
      try { store.layoutService.container.style.setProperty('--title-border-bottom-color', config.getColor('editorGroupHeader.border')); }
      catch (error) { traceError(error); }
    };

    exports.activitybarLayout = function (original, [width, height]) {
      original();
      try {
        const { orientation, size, position } = config.activityBar;

        if (orientation === 1 || height === undefined || !(config.isVisible(store.Parts.ACTIVITYBAR_PART))) { return; }
        const sideBarPosition = store.layoutService.getSideBarPosition();

        const padding = sideBarPosition !== store.Position.RIGHT && position === 'top' && config.electron.titleBarStyle && config.statusBar.position !== 'top' ? 55 : 0;
        const menubar = store.menubarControlContainer?.isConnected ? size : 0;
        const viewItems = store.globalActivityActionBar?.domNode?.isConnected ? (store.globalActivityActionBar?.viewItems?.length ?? 0) * size : 0;
        const availableSize = width - viewItems - menubar - padding;

        store.activityBarCompositeBar.layout(new store.Dimension(height, availableSize));
      }
      catch (error) { traceError(error); }
    };

    exports.activitybarCreate = function (original, [parent]) {
      original();
      if (!config.isInline) { return; }
      try {
        if (!config.isVisible(store.Parts.ACTIVITYBAR_PART)) { store.layoutService.container.classList.add('no-activity-bar'); }
        UI.prependDiv(parent, 'activity-bar-placeholder');
        config.handleDblclick(parent.querySelector('.content'), () => config.activityBar.position === 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      }
      catch (error) { traceError(error); }
    };

    exports.onTabsGroupClose = function (original) {
      original();
      if (!store.inlineTabsPlaceholder.isConnected) {
        const tabsContainer = document.querySelector('.tabs-and-actions-container');
        if (tabsContainer) { tabsContainer.prepend(store.inlineTabsPlaceholder); }
        else { delete store.inlineTabsPlaceholder; }
      }
    };
  });
