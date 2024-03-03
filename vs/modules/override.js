define(
  ['exports', 'vs/modules/auxiliary', 'vs/modules/configuration', 'vs/modules/layout', 'vs/modules/ui', 'vs/modules/layout.statusbar', 'vs/modules/layout.activitybar'],
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
          case store.Parts?.STATUSBAR_PART:
            store.statusBarPartView = part;
            break;
          case store.Parts?.PANEL_PART:
            store.panelPartView = part;
            break;
          case store.Parts?.SIDEBAR_PART:
            store.sidebarPartView = part;
            if (store.isMacintosh && config.isInline) {
              queueMicrotask(() => {
                const inlineTitle = part.getContainer().querySelector('.title-label');
                // config.handleDblclick(inlineTitle, () => config.activityBar.position !== 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
                UI.prependDiv(inlineTitle, 'inline-titlebar-placeholder');
              });
            }
            break;
          case store.Parts?.AUXILIARYBAR_PART:
            store.auxiliarybarPartView = part;
            if (config.isInline) {
              queueMicrotask(() => {
                const titleActions = part.element.querySelector('.title-actions');
                config.inlineAuxiliarybarPlaceholder = UI.createDiv('inline-auxiliarybar-placeholder');
                titleActions.parentNode.insertBefore(config.inlineAuxiliarybarPlaceholder, titleActions);
                config.handleDblclick(config.inlineAuxiliarybarPlaceholder, () => config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
              });
            }
            break;
          case store.Parts?.ACTIVITYBAR_PART:
            store.activitybarPartView = part;
            break;
          case store.Parts?.EDITOR_PART:
            store.editorPartView = part;
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

    function addTabsPlaceHolder(element, inlineTabsPlaceholder) {
      try { element.querySelector('.tabs-and-actions-container').prepend(inlineTabsPlaceholder); }
      catch (error) { traceError(error); }
    }

    function decorateTabsPlaceHolders(group) {
      try {
        group.disposableTabsDblclick = config.handleDblclick(group.element.querySelector('.tabs-container'), () => group.element.classList.contains('editor-group-top') && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      }
      catch (error) { traceError(error); }
    }

    exports.editorPartCreate = function (original) {
      original();
      try {
        if (!config.isInline) { return; }
        config.disposables.add(this.onDidAddGroup((group) => {
          layout.updateTabsClasses();
          decorateTabsPlaceHolders(group);
        }));

        const inlineTabsPlaceholder = UI.createDiv('inline-tabs-placeholder');

        config.disposables.add(this.onDidRemoveGroup((group) => {
          group.disposableTabsDblclick?.dispose?.();
          group.disposableNoTabsDblclick?.dispose?.();
          store.isMacintosh && addTabsPlaceHolder(this.element, inlineTabsPlaceholder);
        }));

        queueMicrotask(() => {
          store.isMacintosh && addTabsPlaceHolder(this.element, inlineTabsPlaceholder);
          layout.updateTabsClasses();
          this.groups.forEach(decorateTabsPlaceHolders);
        });

      }
      catch (error) { traceError(error); }
    };

    exports.editorApplyLayout = function (original) {
      original();
      if (config.isInline) { layout.updateTabsClasses(); }
    };

    exports.setVisibleActivityBar = function (original) {
      original();
      if (!config.isInline) { return; }
      try { services.layoutService.mainContainer.classList.toggle('no-activity-bar'); }
      catch (error) { traceError(error); }
    };

    exports.activitybarUpdateStyles = function (original) {
      original();
      try { services.layoutService.mainContainer.style.setProperty('--title-border-bottom-color', config.getColor('editorGroupHeader.border')); }
      catch (error) { traceError(error); }
    };

    exports.activitybarLayout = function (original, [width, height]) {
      original();
      try {
        const { orientation, itemSize, position } = config.activityBar;
        if (orientation === store.ActionsOrientation.VERTICAL || height === undefined || !(config.isVisible(store.Parts.ACTIVITYBAR_PART))) { return; }
        const sideBarPosition = services.layoutService.getSideBarPosition();

        // const padding = sideBarPosition !== store.Position.RIGHT && position === 'top' && config.electron.titleBarStyle && config.statusBar.position !== 'top' ? 55 : 0;
        const menubar = store.menubarControlContainer?.isConnected ? itemSize : 0;
        const viewItems = store.globalActivityActionBar?.domNode?.isConnected ? (store.globalActivityActionBar?.viewItems?.length ?? 0) * itemSize : 0;
        // const availableSize = width - viewItems - menubar - padding;
        const availableSize = width - viewItems - menubar;

        store.activityBarCompositeBar.layout(new store.Dimension(height, availableSize));
      }
      catch (error) { traceError(error); }
    };

    exports.activitybarCreate = function (original, [parent]) {
      original();
      try {
        if (!config.isInline) { return; }
        if (!config.isVisible(store.Parts.ACTIVITYBAR_PART)) { services.layoutService.mainContainer.classList.add('no-activity-bar'); }
        config.isMacintosh && UI.prependDiv(parent, 'activity-bar-placeholder');
        const content = parent.querySelector('.content');
        !config.isMacintosh && content.insertBefore(UI.createDiv('activity-bar-placeholder-win'), content.children[1]);

        // config.handleDblclick(content, () => config.activityBar.position === 'top' && config.statusBar.position !== 'top' && config.handleTitleDoubleClick());
      }
      catch (error) { traceError(error); }
    };

  });
