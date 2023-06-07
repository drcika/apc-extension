function error(error) {
  console.trace(error);
}

function customize(exports, utils, configuration, browser, electron, dom, themeService, workbench) {

  class Customize {
    constructor(configurationService, nativeHostService, themeService) {
      // nativeHostService.relaunch();
      // nativeHostService.reload();
      // nativeHostService.showMessageBox

      this.themeService = themeService;
      this.configurationService = configurationService;
      this.nativeHostService = nativeHostService;
      this.init();
    }
    get headerConfig() {
      const { height, fontSize } = this.getConfiguration('apc.header') || {};
      const factor = this.getZoomFactor;
      return {
        height: (height || 37) * factor,
        fontSize: (fontSize || 13) * factor,
        isEnabled: !!(fontSize || height)
      };
    }

    get sidebarTitlebarConfig() {
      const { height, fontSize } = this.getConfiguration('apc.sidebar.titlebar') || {};
      const factor = this.getZoomFactor;
      return {
        height: (height || 35) * factor,
        fontSize: (fontSize || 11) * factor,
        isEnabled: !!(fontSize || height)
      };
    }
    get listRowConfig() {
      const { height, fontSize } = this.getConfiguration('apc.listRow') || {};
      const factor = this.getZoomFactor;
      return {
        height: (height || 22) * factor,
        fontSize: (fontSize || 13) * factor,
        isEnabled: !!(fontSize || height)
      };
    }

    get activityBarConfig() {
      const { size, position, hideSettings } = this.getConfiguration('apc.activityBar') || {};
      const isHorizontal = !!position;
      return {
        position,
        hideSettings,
        isHorizontal,
        orientation: isHorizontal ? 0 : 1,
        size: (size ?? 48) * this.getZoomFactor,
        isEnabled: !!size
      };
    }

    get statusBarConfig() {
      const { fontSize, height, position } = this.getConfiguration('apc.statusBar') || {};
      const factor = this.getZoomFactor;
      return {
        position: position || 'bottom',
        height: (height ?? 22) * factor,
        fontSize: (fontSize ?? 12) * factor,
        isEnabled: !!(fontSize || height || position)
      };
    }

    get getZoomFactor() {
      return (browser?.getZoomFactor && browser.getZoomFactor()) ?? 1;
    }

    getConfiguration(config) {
      return this.configurationService?.getValue ? this.configurationService.getValue(config) : undefined;
    }

    isVisible(part) {
      return this.layout?.isVisible && this.layout.isVisible(part);
    }

    updateStatusBar() {
      if (
        !this.isVisible(this.Parts?.STATUSBAR_PART) ||
        !this.workbenchGrid?.moveView ||
        !this.workbenchGrid?.moveViewTo ||
        !this.statusBarPartView ||
        !this.editorPartView ||
        !this.layout?.getPanelPosition ||
        !this.panelPartView
      ) { return; }

      const { position, height, isEnabled } = this.statusBarConfig;

      this.statusBarPartView.minimumHeight = isEnabled ? height : 22;
      this.statusBarPartView.maximumHeight = isEnabled ? height : 22;

      const isTop = position.includes('top');
      const isEditor = position.includes('editor');

      if (isEditor) {
        const order = isTop ? 0 : 1;
        this.workbenchGrid.moveView(this.statusBarPartView, this.statusBarPartView?.minimumHeight, this.editorPartView, order);

        const panelPosition = this.layout.getPanelPosition();
        if (position === 'editor-bottom' && panelPosition === 2) {
          this.workbenchGrid.moveView(this.panelPartView, this.workbenchGrid.getViewSize(this.panelPartView), this.editorPartView, 1);
        }

      } else {
        this.workbenchGrid.moveViewTo(this.statusBarPartView, [isTop ? 0 : -1]);
      }
    }

    updateActivityBar(_isHorizontal) {
      const { size, position, ...config } = this.activityBarConfig;

      const sideBarPosition = this.layout?.getSideBarPosition && this.layout.getSideBarPosition();
      this.layout?.container?.classList[sideBarPosition ? 'add' : 'remove']('sidebar-right');

      const isHorizontal = typeof _isHorizontal === 'boolean' ? _isHorizontal : config.isHorizontal;

      const container = this.activitybarPartView?.getContainer && this.activitybarPartView.getContainer();
      container?.querySelectorAll('div.monaco-action-bar').forEach(el => el.classList[isHorizontal ? 'remove' : 'add']('vertical'));

      if (
        !this.layout?.isVisible(this.Parts?.ACTIVITYBAR_PART) ||
        !this.activitybarPartView ||
        !this.sidebarPartView ||
        !this.layout.getSideBarPosition ||
        !this.workbenchGrid?.moveView ||
        !this.workbenchGrid?.moveViewTo
      ) { return; }

      const isSideBarVisible = this.isVisible(this.Parts?.SIDEBAR_PART);
      this.activitybarPartView.minimumWidth = isHorizontal ? 0 : size;
      this.activitybarPartView.maximumWidth = isHorizontal ? isSideBarVisible ? Infinity : 0 : size;
      this.activitybarPartView.minimumHeight = isHorizontal && isSideBarVisible ? size : 0;
      this.activitybarPartView.maximumHeight = isHorizontal && isSideBarVisible ? size : Infinity;

      const newPosition = position === 'top' ? 0 : 1;
      isHorizontal && isSideBarVisible ?
        this.workbenchGrid.moveView(this.activitybarPartView, this.activitybarPartView.minimumWidth, this.sidebarPartView, newPosition) :
        this.workbenchGrid.moveViewTo(this.activitybarPartView, [this.statusBarConfig.position === 'top' ? 3 : 2, sideBarPosition ? -1 : 0]);

      this.layout?.layout && this.layout.layout();
    };

    hideActivityBarSettings() {
      const content = this.activitybarPartView?.getContainer()?.querySelector('.content');

      if (!this.globalActivitiesContainer) { this.globalActivitiesContainer = content?.childNodes && content.childNodes[1]; };
      const isConnected = this.globalActivitiesContainer?.isConnected;
      const { hideSettings } = this.activityBarConfig;

      if (hideSettings && isConnected) { content?.removeChild && content.removeChild(this.globalActivitiesContainer); }
      if (!hideSettings && !isConnected) { content?.appendChild && content.appendChild(this.globalActivitiesContainer); }
    }

    getProperty(obj, key) {
      return Object.getOwnPropertyDescriptor(obj, key) || (obj.__proto__ ? this.getProperty(obj.__proto__, key) : undefined);
    }

    init() {
      const self = this;

      this.electronConfig = this.getConfiguration('apc.electron') || {};

      if (this.electronConfig.titleBarStyle) { document.body.classList.add(`inline-title-bar`); }
      if (this.electronConfig.frame === false) { document.body.classList.add(`frameless-title-bar`); }

      require(['vs/base/browser/ui/list/listView'], function (listView) {
        listView.ListView && (listView.ListView = class ListView extends listView.ListView {
          constructor(_, virtualDelegate, renderers) {
            if (!(renderers instanceof Array ? renderers : []).find(renderer => renderer.templateId?.match(/(notification|replGroup|rm|extension|settings)/))) {
              const originalDelegate = self.getProperty(virtualDelegate, 'getHeight');
              virtualDelegate.getHeight && (virtualDelegate.getHeight = function (...args) {
                return self.listRowConfig.isEnabled ?
                  args[0]?.element?.placeholder || args[0]?.element?.type === 'actionButton' ? self.listRowConfig.height * 1.5 : self.listRowConfig.height :
                  originalDelegate?.value?.call(this, ...args);
              });
              self.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('apc.listRow')) {
                  const height = self.listRowConfig.height;
                  this.updateElementHeight && new Array(this.length ?? 0).fill(undefined).forEach((e, i) => this.updateElementHeight(i, height));
                }
              });

            }
            super(...arguments);
          }
        });
      }, error);

      require(['vs/workbench/services/layout/browser/layoutService'], layoutService => (self.Parts = layoutService?.Parts), error);

      require(['vs/workbench/browser/layout'], function (layout) {
        if (!layout?.Layout) { return; }
        utils.override(layout.Layout, 'registerPart', function (original, [part]) {
          original();
          self.layout = this;
          if (!part.getId) { return; }
          switch (part.getId()) {
            case self.Parts?.STATUSBAR_PART:
              self.statusBarPartView = part;
              break;
            case self.Parts?.EDITOR_PART:
              self.editorPartView = part;
              break;
            case self.Parts?.PANEL_PART:
              self.panelPartView = part;
              break;
            case self.Parts?.SIDEBAR_PART:
              self.sidebarPartView = part;
              break;
            case self.Parts?.AUXILIARYBAR_PART:
              self.auxiliarybarPartView = part;
              break;
            case self.Parts?.ACTIVITYBAR_PART:
              self.activitybarPartView = part;
              break;
            case self.Parts?.TITLEBAR_PART:
              self.titlebarPartView = part;
              break;
            case self.Parts?.BANNER_PART:
              self.bannerPartView = part;
              break;
            default:
              // console.log(part);
              break;
          }
        });

        utils.override(layout.Layout, 'toggleZenMode', function (original) {
          const { isHorizontal } = self.activityBarConfig;
          isHorizontal && self.updateActivityBar(false);
          original();
          isHorizontal && self.updateActivityBar();
        });

        utils.override(layout.Layout, 'setPartHidden', function (original, [_, part]) {
          if (part !== self.Parts?.SIDEBAR_PART) { return original(); }
          const { isHorizontal } = self.activityBarConfig;
          isHorizontal && self.updateActivityBar(false);
          original();
          self.updateActivityBar();
        });

        utils.override(layout.Layout, 'setPanelPosition', function (original) {
          original();
          self.updateStatusBar();
        });

      }, error);

      const isInline = this.getConfiguration('window.titleBarStyle') === 'native' && (self.electronConfig.titleBarStyle || self.electronConfig.frame === false);
      if (isInline) {

        require(['vs/workbench/browser/parts/sidebar/sidebarPart'], function (sidebarPart) {
          sidebarPart.SidebarPart && (utils.override(sidebarPart.SidebarPart, "create", function (original, [parent]) {
            original();
            const inlineTitle = parent?.querySelector && parent.querySelector('.title');
            inlineTitle?.addEventListener('dblclick', () => {
              self.activityBarConfig.position !== 'top' && self.statusBarConfig.position !== 'top' && self.nativeHostService?.handleTitleDoubleClick && self.nativeHostService.handleTitleDoubleClick();
            });
            const titlebarPlaceholder = document.createElement('div');
            titlebarPlaceholder.classList.add('inline-titlebar-placeholder');
            inlineTitle?.prepend && inlineTitle.prepend(titlebarPlaceholder);
          }));
        }, error);

        require(['vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart'], function (auxiliaryBarPart) {
          auxiliaryBarPart.AuxiliaryBarPart && (utils.override(auxiliaryBarPart.AuxiliaryBarPart, "create", function (original, [parent]) {
            original();
            parent?.querySelector('.title')?.addEventListener('dblclick', () => {
              self.statusBarConfig.position !== 'top' && self.nativeHostService?.handleTitleDoubleClick && self.nativeHostService.handleTitleDoubleClick();
            });
          }));
        }, error);

        require(['vs/workbench/browser/parts/statusbar/statusbarPart'], function (statusbarPart) {
          statusbarPart.StatusbarPart && (utils.override(statusbarPart.StatusbarPart, "create", function (original, [parent]) {
            original();
            parent?.addEventListener('dblclick', () => {
              self.statusBarConfig.position.includes('top') && self.nativeHostService?.handleTitleDoubleClick && self.nativeHostService.handleTitleDoubleClick();
            });
          }));
        }, error);

        require(['vs/workbench/browser/parts/editor/tabsTitleControl'], function (tabsTitleControl) {
          tabsTitleControl.TabsTitleControl = class TabsTitleControl extends tabsTitleControl.TabsTitleControl {
            constructor(parent, accessor) {
              super(...arguments);
              if (accessor?.element) {
                const dragPlaceholder = document.createElement('div');
                dragPlaceholder.classList.add('inline-drag-placeholder');
                accessor.element.style.position = 'relative';

                accessor.element.appendChild && accessor.element.appendChild(dragPlaceholder);
                dragPlaceholder.addEventListener('dblclick', e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  self.nativeHostService.handleTitleDoubleClick && self.nativeHostService.handleTitleDoubleClick();
                });
              }
              if (parent.querySelector) {
                const tabsPlaceholder = document.createElement('div');
                tabsPlaceholder.classList.add('inline-tabs-placeholder');
                parent.querySelector('.tabs-and-actions-container')?.prepend(tabsPlaceholder);
              }
            }
          };
        }, error);
      }

      require(['vs/workbench/browser/parts/activitybar/activitybarPart'], function (activitybarPart) {
        if (!activitybarPart?.ActivitybarPart) { return; }
        if (isInline) {
          utils.override(activitybarPart.ActivitybarPart, "create", function (original, [parent]) {
            original();
            if (!self.layout?.isVisible(self.Parts.ACTIVITYBAR_PART)) { self.layout?.container?.classList.add('no-activity-bar'); }
            const placeholder = document.createElement('div');
            placeholder.classList.add('activity-bar-placeholder');
            parent?.prepend && parent.prepend(placeholder);
            const content = parent?.querySelector && parent.querySelector('.content');
            content?.addEventListener('dblclick', () => {
              self.activityBarConfig?.position === 'top' && self.statusBarConfig?.position !== 'top' && self.nativeHostService?.handleTitleDoubleClick && self.nativeHostService.handleTitleDoubleClick();
            });
          });
        }

        utils.override(activitybarPart.ActivitybarPart, "setVisible", function (original) {
          isInline && self.layout?.container?.classList.toggle('no-activity-bar');
          self.updateActivityBar();
          original();
        });

        utils.override(activitybarPart.ActivitybarPart, 'layout', function (original, [width, height]) {
          original();
          const { orientation, size, position } = self.activityBarConfig;
          if (orientation === 1 || !(self.layout?.isVisible && self.layout.isVisible(self.Parts.ACTIVITYBAR_PART))) { return; }

          const padding = position === 'top' && self.electronConfig?.titleBarStyle && self.statusBarConfig?.position !== 'top' ? 60 : 0;
          const menuBarContainer = this.getContainer && this.getContainer()?.querySelector('.menubar');
          const menubar = menuBarContainer?.clientWidth ?? 0;

          const viewItems = (self.globalActivityActionBar?.viewItems?.length ?? 0) * size;

          const availableSize = width - viewItems - menubar - padding;
          self.activityBarCompositeBar?.layout(new dom.Dimension(height, availableSize));
        });

        utils.override(activitybarPart.ActivitybarPart, "updateStyles", function (original) {
          original();
          const color = self.themeService?.getColorTheme()?.getColor('editorGroupHeader.border')?.toString();
          self.layout?.container?.style?.setProperty('--title-border-bottom-color', color);
          const { isHorizontal } = self.activityBarConfig || {};
          const container = this.getContainer();
          const action = isHorizontal ? 'remove' : 'add';
          container?.querySelectorAll('div.monaco-action-bar')?.forEach(el => el.classList[action]('vertical'));
        });

      }, error);

      require(['vs/base/browser/ui/grid/grid'], function (grid) {
        const orgDeserialize = grid?.SerializableGrid?.deserialize;
        grid.SerializableGrid && (grid.SerializableGrid = class SerializableGrid extends grid.SerializableGrid {
          static deserialize(json, deserializer, options) {
            const grid = orgDeserialize && orgDeserialize(json, deserializer, options);
            if (grid?.element?.querySelector('.monaco-grid-view .monaco-grid-view')) {
              self.workbenchGrid = grid;
            }
            else {
              self.editorGrid = grid;
            }
            return grid;
          }
        });
      }, error);

      require(['vs/base/browser/ui/actionbar/actionbar'], function (actionbar) {
        actionbar.ActionBar && (actionbar.ActionBar = class ActionBar extends actionbar.ActionBar {
          constructor(container) {
            super(...arguments);
            // the only actionbar that has no class
            if (!container?.className) { self.globalActivityActionBar = this; }
          }
        });
      }, error);

      require(['vs/workbench/browser/parts/compositeBar'], function (compositeBar) {
        compositeBar.CompositeBar && (compositeBar.CompositeBar = class CompositeBar extends compositeBar.CompositeBar {
          constructor(items, options) {
            super(...arguments);
            if (options?.getDefaultCompositeId() === 'workbench.view.explorer') {
              self.activityBarCompositeBar = this;
            }
          }
        });
      }, error);

      require(['vs/workbench/contrib/files/browser/views/openEditorsView'], function (openEditorsView) {
        openEditorsView.OpenEditorsView && (openEditorsView.OpenEditorsView = class OpenEditorsView extends openEditorsView.OpenEditorsView {
          constructor(a, b, c, d, editorGroupService) {
            super(...arguments);
            self.openEditorsView = this;
            self.editorGroupService = editorGroupService;

            const getMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize')?.get;
            const setMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize')?.set;
            Object.defineProperty(this, 'minimumBodySize', {
              get() {
                return getMinimumBodySize?.call(this);
              },
              set(num) {
                if (self.listRowConfig?.isEnabled) {
                  const visibleOpenEditors = self.configurationService?.getValue('explorer.openEditors.visible') ?? 1;
                  const size = this.orientation === 0 ? Math.min(Math.max(visibleOpenEditors, 1), this._elementCount) * self.listRowConfig?.height ?? 170 : 170;
                  setMinimumBodySize?.call(this, size);
                }
                else {
                  setMinimumBodySize?.call(this, num);
                }
              },
              configurable: true,
            });
          }

          get _elementCount() {
            return self.editorGroupService?.groups?.map(g => g.count)
              .reduce((first, second) => first + second, this.showGroups ? self.editorGroupService?.groups?.length ?? 0 : 0) ?? 0;
          }
        });
      }, error);

      this.updateCssClasses();
      this.loadStyles();
      this.loadUserFiles();

      self.subscribe();
    }

    loadUserFiles() {
      // in vscode won't work, only in vscodium
      try {
        const fs = require('fs').promises;
        const imports = this.configurationService.getValue('apc.css');
        if (!this.customStyleImports) {
          const style = document.createElement('style');
          style.rel = 'stylesheet';
          this.customStyleImports = document.createTextNode('');
          style.appendChild(this.customStyleImports);
          document.head.appendChild(style);
        }

        Promise.all((imports instanceof Array ? imports : []).filter(file => file.endsWith('.css')).map(file => fs.readFile(file, 'utf8'))).then(styles => {
          this.customStyleImports.textContent = styles.filter(Boolean).join('\n');
        });

        console.log(this.customStyleImports.textContent);
      } catch (err) {
        // error(err);
      }

    }

    loadStyles() {
      if (!this.customStyle) {
        const style = document.createElement('style');
        style.rel = 'stylesheet';
        this.customStyle = document.createTextNode('');
        style.appendChild(this.customStyle);
        document.head.appendChild(style);
      }
      const styleSheet = this.configurationService.getValue('apc.stylesheet');

      if (styleSheet instanceof Object) {
        this.customStyle.textContent = Object.entries(styleSheet)
          .map(([key, value]) => {
            if (typeof value === 'object') {
              value = Object.entries(value)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n');
            }
            return `${key} { ${value}; }`;
          })
          .join('\n');
      }
    }

    subscribe() {
      browser.PixelRatio && browser.PixelRatio.onDidChange(this.updateCssClasses.bind(this));
      browser.onDidChangeZoomLevel && browser.onDidChangeZoomLevel(this.updateCssClasses.bind(this));
      browser.onDidChangeFullscreen(this.updateCssClasses.bind(this));

      this.configurationService.onDidChangeConfiguration(e => {
        e.affectsConfiguration('apc.css') && this.loadUserFiles();
        e.affectsConfiguration('apc.statusBar') && this.updateStatusBar();
        e.affectsConfiguration('apc.stylesheet') && this.loadStyles();
        e.affectsConfiguration('apc.activityBar') && (this.updateActivityBar(), this.hideActivityBarSettings());

        if (e.affectsConfiguration('workbench.sideBar.location')) {
          const isTopStatusBarPosition = this.statusBarConfig.position === 'top';
          isTopStatusBarPosition && this.workbenchGrid.moveViewTo(this.statusBarPartView, [-1]);
          queueMicrotask(() => {
            isTopStatusBarPosition && this.workbenchGrid.moveViewTo(this.statusBarPartView, [0]);
            this.updateActivityBar();
          });
        }

        Array.from(e.affectedKeys.values()).find(key => key.startsWith('apc.')) && this.updateCssClasses();
      });

    }

    updateCssClasses() {
      const listRowConfig = this.listRowConfig;
      const headerConfig = this.headerConfig;
      const activityBarConfig = this.activityBarConfig;
      const statusBarConfig = this.statusBarConfig;
      const electronConfig = this.electronConfig?.trafficLightPosition || {};
      const isActivityBarVisible = this.layout?.isVisible(this.Parts.ACTIVITYBAR_PART) ?? true;
      const sidebarTitlebarConfig = this.sidebarTitlebarConfig;

      document.body.classList[statusBarConfig.position === 'top' ? 'add' : 'remove']('statusbar-top');
      document.body.classList[statusBarConfig.position === 'editor-top' ? 'add' : 'remove']('statusbar-editor-top');

      // document.body.classList[isActivityBarVisible && activityBarConfig.position ? 'add' : 'remove']('horizontal-activitybar');
      document.body.classList[activityBarConfig.position ? 'add' : 'remove']('horizontal-activitybar');
      document.body.classList[isActivityBarVisible && activityBarConfig.position === 'bottom' ? 'add' : 'remove']('activitybar-bottom');
      document.body.classList[isActivityBarVisible && activityBarConfig.position === 'top' ? 'add' : 'remove']('activitybar-top');
      document.body.classList[isActivityBarVisible && activityBarConfig.isEnabled ? 'add' : 'remove']('custom-activitybar');
      document.body.classList[headerConfig.isEnabled ? 'add' : 'remove']('custom-header');
      document.body.classList[sidebarTitlebarConfig.isEnabled ? 'add' : 'remove']('custom-sidebar-titlebar');
      document.body.classList[listRowConfig.isEnabled ? 'add' : 'remove']('custom-list-row');
      document.body.classList[statusBarConfig.isEnabled ? 'add' : 'remove']('custom-statusbar');

      if (!this.styleTextNode) {
        const style = document.createElement('style');
        style.rel = 'stylesheet';
        this.styleTextNode = document.createTextNode('');
        style.appendChild(this.styleTextNode);
        document.head.appendChild(style);
      }

      this.styleTextNode.textContent = `:root {
        --row-height: ${listRowConfig.height}px; 
        --row-font-size: ${listRowConfig.fontSize}px;
        --header-height: ${headerConfig.height}px;
        --header-font-size: ${headerConfig.fontSize}px;
        --titlebar-height: ${sidebarTitlebarConfig.height}px;
        --titlebar-font-size: ${sidebarTitlebarConfig.fontSize}px;
        --activity-bar-action-size: ${activityBarConfig.size}px;
        --status-bar-font-size: ${statusBarConfig.fontSize}px;
        --traffic-X: ${electronConfig.x ?? 10}px;
        `;
    }
  }

  let customizeService;

  utils.override(workbench.Workbench, "startup", function (original) {
    const res = original();
    customizeService.updateActivityBar();
    customizeService.updateStatusBar();
    customizeService.hideActivityBarSettings();
    return res;
  });

  exports.run = function (instantiationService) {
    customizeService = instantiationService.createInstance(utils.decorate([
      utils.param(0, configuration.IConfigurationService),
      utils.param(1, electron.INativeHostService),
      utils.param(2, themeService.IThemeService),
    ], Customize));
  };
}
define([
  'exports',
  'apc/utils',
  'vs/platform/configuration/common/configuration',
  'vs/base/browser/browser',
  'vs/platform/native/common/native',
  'vs/base/browser/dom',
  'vs/platform/theme/common/themeService',
  'vs/workbench/browser/workbench',
], customize);
