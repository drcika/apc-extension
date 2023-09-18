define(
  ['exports', 'apc/utils', 'apc/auxiliary', 'apc/configuration', 'apc/classes', 'apc/ui', 'apc/layout', 'apc/layout.statusbar', 'apc/layout.activitybar'],
  (exports, utils, auxiliary, { config }, classes, ui, layout, statusbar, activitybar) => {
    const { traceError, store } = auxiliary;

    try {
      require(['vs/base/browser/ui/grid/grid'], classes.grid, traceError);
      require(['vs/base/browser/ui/actionbar/actionbar'], classes.actionbar, traceError);
      require(['vs/base/browser/ui/menu/menu'], classes.menu, traceError);
      require(['vs/base/browser/ui/list/listView'], classes.listView, traceError);
      require(['vs/base/browser/ui/menu/menubar'], classes.menubar, traceError);

      require(['vs/workbench/browser/workbench'], classes.workbench, traceError);
      require(['vs/workbench/browser/layout'], classes.layout, traceError);
      require(['vs/workbench/browser/style'], classes.style, traceError);

      require(['vs/workbench/browser/parts/titlebar/menubarControl'], classes.menubarControl, traceError);
      require(['vs/workbench/browser/parts/editor/editorPart'], classes.editorPart, traceError);
      require(['vs/workbench/browser/parts/compositeBar'], classes.compositeBar, traceError);
      require(['vs/workbench/browser/parts/activitybar/activitybarPart'], classes.activitybarPart, traceError);
      require(['vs/workbench/services/layout/browser/layoutService'], classes.layoutService, traceError);

      require(['vs/workbench/contrib/files/browser/views/openEditorsView'], classes.openEditorsView, traceError);

      // const skipService = ['credentialsMainService', 'encryptionMainService', 'editorProgressService', 'ptyService', 'sharedTunnelsService',
      //   'IUserDataSyncStoreService', 'IUserDataSyncBackupStoreService', 'IUserDataSyncResourceProviderService', 'IExtHostRpcService',
      //   'IExtHostTunnelService', 'IWebExtensionsScannerService', 'extensionUrlHandler', 'extensionUrlHandler',
      //   'privateBreakpointWidgetService'];
      // const services = [];
      const services = ['nativeHostService', 'configurationService', 'themeService', 'fileService', 'layoutService', 'statusbarService', 'editorGroupsService', 'storageService', 'environmentService'];

      // themeService.onDidColorThemeChange(colorTheme => {
      // colorTheme.setCustomColors({
      //   "sideBar.border": "#000000",
      //   "activityBar.border": "#0000ff",
      //   "statusBar.border": "#00ff00",
      //   "editorGroupHeader.tabsBackground": "#00000000",
      //   "sideBar.background": "#00000000",
      //   "sideBarSectionHeader.background": "#00000000",
      //   "editor.background": "#00000000",
      //   "peekViewEditor.background": "#00000000",
      //   "peekViewEditorGutter.background": "#00000000",
      //   "peekViewTitle.background": "#00000000",
      //   "peekViewResult.background": "#00000000",
      //   "tab.activeBackground": "#00000000",
      //   "tab.inactiveBackground": "#00000000",
      //   "statusBar.background": "#00000000",
      //   "statusBar.debuggingBackground": "#00000000",
      //   "statusBar.noFolderBackground": "#00000000",
      //   "statusBarItem.activeBackground": "#00000000",
      //   "panel.background": "#00000000",
      //   "activityBar.background": "#00000000"
      // });
      // });

      class Patch {
        constructor(...args) {
          try {
            args.forEach((service, index) => auxiliary.services[services[index]] = service);
            require(['vs/workbench/browser/parts/editor/editorTabsControl'], classes.editorTabsControl, traceError);

            store.dummActivitybarPartView = new auxiliary.Part(store.DUMMY_ACTIVITYBAR_PART, { hasTitle: false }, auxiliary.services.themeService, auxiliary.services.storageService, auxiliary.services.layoutService);
            store.dummStatusbarPartView = new auxiliary.Part(store.DUMMY_STATUSBAR_PART, { hasTitle: false }, auxiliary.services.themeService, auxiliary.services.storageService, auxiliary.services.layoutService);
          } catch (error) {
            console.log(error);
          }

          if (config.getConfiguration('apc.menubar.compact')) {
            try { require(['vs/platform/window/common/window'], classes.window, traceError); }
            catch (error) { traceError(error); }
          }
        }
      }


      exports.run = (instantiationService) => {
        try {
          const instantiation = require('vs/platform/instantiation/common/instantiation');
          
          // instantiation._util.serviceIds.forEach((a, key) => !skipService.includes(key) && services.push(key));
          instantiationService.createInstance(utils.decorate([...services.map((name, i) => utils.param(i, instantiation._util.serviceIds.get(name)))], Patch));

          ui.run();

          config.addDisposable(config.onDidChangeConfiguration(e => {
            if (Array.from(e.affectedKeys.values()).find(key => key.startsWith('apc.'))) {
              if (!store.initialised) { return (store.initialised = true); }
              ui.updateClasses();
            };

            e.affectsConfiguration('workbench.activityBar.visible') && activitybar.onChangeVisibility();
            e.affectsConfiguration('workbench.sideBar.location') && layout.onChangeSidebarPosition();
            e.affectsConfiguration('workbench.statusBar.visible') && statusbar.onChangeVisibility();
            e.affectsConfiguration('apc.statusBar') && (statusbar.update(), layout.updateTabsClasses());
            e.affectsConfiguration('apc.activityBar') && activitybar.update();
            e.affectsConfiguration('apc.imports') && ui.appendFiles();
            e.affectsConfiguration('apc.stylesheet') && ui.appendStyles();
            // e.affectsConfiguration('apc.header') && queueMicrotask(() => {
            //   store.editorPartView?.layout?.(store.editorPartView?.element?.clientWidth, store.editorPartView?.element?.clientHeight);
            // });

          }));

        } catch (error) { traceError(error); }
      };
    } catch (error) { traceError(error); }

  });
