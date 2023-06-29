define(
  ['exports', 'apc/auxiliary', 'apc/configuration', 'apc/layout', 'apc/ui', 'apc/layout.statusbar', 'apc/layout.activitybar'],
  function (exports, auxiliary, configuration, layout, UI, statusbar, activitybar) {
    const { store, traceError, services } = auxiliary;
    const { config } = configuration;

    exports.startup = function (original) {
      const instantiationService = original();
      // this === layouteService
      layout.init();
      config.handleDblclick(document.querySelector('footer'), () => config.statusBar.position.includes('top') && config.handleTitleDoubleClick());
      return instantiationService;
    };

    exports.registerPart = function (original, [part]) {
      original();
      try {
        switch (part.getId()) {
          case store.Parts?.PANEL_PART:
            store.panelPartView = part;
            break;
          case store.Parts?.SIDEBAR_PART:
            store.sidebarPartView = part;
            if (store.isMacintosh && config.isInline) {
              queueMicrotask(() => {
                const inlineTitle = part.getContainer().querySelector('.title');
                config.handleDblclick(inlineTitle, () => config.activityBar.position !== 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
                UI.prependDiv(inlineTitle, 'inline-titlebar-placeholder');
              });
            }
            break;
          case store.Parts?.AUXILIARYBAR_PART:
            store.auxiliarybarPartView = part;
            if (config.isInline) { queueMicrotask(() => config.handleDblclick(part.getContainer().querySelector('.title'), () => config.statusBar.position !== 'top' && config.handleTitleDoubleClick())); }
            break;
          case store.Parts?.ACTIVITYBAR_PART:
            store.activitybarPartView = part;
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

    function addTabsPlaceHolder() {
      try { config.inlineTabsPlaceholder && services.editorGroupsService.groups[0].element.querySelector('.tabs-and-actions-container').prepend(config.inlineTabsPlaceholder); }
      catch (error) { traceError(error); }
    }

    function decorateTabsPlaceHolders(group) {
      try {
        group.element.style.position = 'relative';
        group.disposableNoTabsDblclick = config.handleDblclick(UI.appendDiv(group.element, 'inline-no-tabs-placeholder'), config.handleTitleDoubleClick);
        group.disposableTabsDblclick = config.handleDblclick(group.element.querySelector('.tabs-container'), () => group.element.classList.contains('editor-group-top') && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      }
      catch (error) { traceError(error); }
    }

    exports.editorPartCreate = function (original) {
      console.log('create');
      original();
      try {
        if (!config.isInline) { return; }
        config.disposables.add(this.onDidAddGroup((...args) => {
          layout.updateTabsClasses();
          decorateTabsPlaceHolders(...args);
        }));

        queueMicrotask(() => {
          if (store.isMacintosh) {
            config.inlineTabsPlaceholder = UI.createDiv('inline-tabs-placeholder');
            addTabsPlaceHolder();
          }
          layout.updateTabsClasses();
          this.groups.forEach(decorateTabsPlaceHolders);
        });

      }
      catch (error) { traceError(error); }
    };

    exports.editorPartRemoveGroup = function (original, [group]) {
      group.disposableTabsDblclick?.dispose();
      group.disposableNoTabsDblclick?.dispose();
      original();
      if (!store.isMacintosh || !config.isInline) { return; }
      addTabsPlaceHolder();
    };

    exports.editorApplyLayout = function (original) {
      original();
      if (config.isInline) { layout.updateTabsClasses(); }
    };

    exports.setVisibleActivityBar = function (original) {
      original();
      if (!config.isInline) { return; }
      try { services.layoutService.container.classList.toggle('no-activity-bar'); }
      catch (error) { traceError(error); }
    };

    exports.activitybarUpdateStyles = function (original) {
      original();
      try { services.layoutService.container.style.setProperty('--title-border-bottom-color', config.getColor('editorGroupHeader.border')); }
      catch (error) { traceError(error); }
    };

    exports.activitybarLayout = function (original, [width, height]) {
      original();
      try {
        const { orientation, size, position } = config.activityBar;

        if (orientation === store.ActionsOrientation.VERTICAL || height === undefined || !(config.isVisible(store.Parts.ACTIVITYBAR_PART))) { return; }
        const sideBarPosition = services.layoutService.getSideBarPosition();

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
      try {
        if (!config.isInline) { return; }
        if (!config.isVisible(store.Parts.ACTIVITYBAR_PART)) { services.layoutService.container.classList.add('no-activity-bar'); }
        UI.prependDiv(parent, 'activity-bar-placeholder');
        config.handleDblclick(parent.querySelector('.content'), () => config.activityBar.position === 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      }
      catch (error) { traceError(error); }
    };

  });
