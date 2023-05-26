function error() { }

function customize(exports, utils, configuration, browser, platform, electron, dom) {
  const isCodium = platform.globals.location?.href.includes('VSCodium');

  class Customize {
    constructor(configurationService, nativeHostService) {
      this.configurationService = configurationService;
      this.nativeHostService = nativeHostService;
      this.init();
    }
    get headerConfig() {
      const config = this.configurationService.getValue('apc.header') || {};
      const height = config?.height ?? 37;
      const fontSize = config?.fontSize ?? 13;
      const factor = browser.getZoomFactor();
      return {
        height: height * factor,
        fontSize: fontSize * factor
      };
    }
    get listRowConfig() {
      const config = this.configurationService.getValue('apc.listRow') || {};
      const factor = browser.getZoomFactor();
      const height = config.height ?? 22;
      const fontSize = config.fontSize ?? 13;
      return {
        height: height * factor,
        fontSize: fontSize * factor
      };
    }
    get activityBarConfig() {
      const config = this.configurationService.getValue('apc.activityBar') || {};
      const factor = browser.getZoomFactor();
      const size = (config?.size ?? 35) * factor;
      const isBottom = config?.position === 'bottom';

      return {
        position: config.position,
        hideSettings: !!config.hideSettings,
        orientation: isBottom ? 0 : 1,
        size
      };
    }
    get statusBarConfig() {
      const config = this.configurationService.getValue('apc.statusBar') || {};
      const factor = browser.getZoomFactor();
      const height = config.height ?? 22;
      const fontSize = config.fontSize ?? 12;
      return {
        position: config.position || 'bottom',
        height: height * factor,
        fontSize: fontSize * factor
      };
    }

    init() {
      const self = this;

      const titleBarStyle = this.configurationService.getValue('window.titleBarStyle');
      const electronConfig = this.configurationService.getValue('apc.electron') || {};
      if (electronConfig.titleBarStyle) { document.body.classList.add(`inline-title-bar`); }

      require(['vs/workbench/browser/parts/statusbar/statusbarPart'], function (statusbarPart) {
        utils.override(statusbarPart.StatusbarPart, isCodium ? 'registerListeners' : 'ab', function (original) {
          self.updateStatusBar = () => {
            const workbenchGrid = isCodium ? self.layout.workbenchGrid : self.layout.s;
            const { position, height } = self.statusBarConfig;
            this.minimumHeight = height;
            this.maximumHeight = height;

            if (position.includes('editor')) {
              const editorPartView = isCodium ? self.layout.editorPartView : self.layout.D;
              const panelPartView = isCodium ? self.layout.panelPartView : self.layout.z;

              const order = position.includes('top') ? 0 : 1;
              workbenchGrid.moveView(this, height, editorPartView, order);

              const panelPosition = self.layout.getPanelPosition(); // enum Position { LEFT, RIGHT, BOTTOM }
              if (position === 'editor-bottom' && panelPosition === 2) {
                workbenchGrid.moveView(panelPartView, workbenchGrid.getViewSize(panelPartView), editorPartView, 1);
              }

            } else {
              workbenchGrid.moveViewTo(this, [position.includes('top') ? 0 : -1]);
            }
          };

          self.configurationService.onDidChangeConfiguration(e => e.affectsConfiguration('apc.statusBar') && self.updateStatusBar());

          original();
        });
      }, error);

      require(['vs/base/browser/ui/list/listView'], function (listView) {
        listView.ListView = class ListView extends listView.ListView {
          constructor(container, virtualDelegate, renderers, options) {
            const key = isCodium ? 'templateId' : 'c';
            if (!renderers.find(renderer => renderer[key].match(/(notification|replGroup|rm|extension|settings)/))) {
              virtualDelegate.getHeight = (element) => element?.element?.placeholder || element?.element?.type === 'actionButton' ? self.listRowConfig.height * 1.5 : self.listRowConfig.height;
              self.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('apc.listRow')) {
                  const height = self.listRowConfig.height;
                  (isCodium ? this.items : this.d)?.forEach((e, i) => this.updateElementHeight(i, height));
                }
              });
            }
            super(...arguments);
          }
        };
      }, error);

      require(['vs/workbench/browser/layout'], function (layout) {

        utils.override(layout.Layout, isCodium ? 'setSideBarPosition' : 'kb', function (original, args) {
          original();
          self.updateActivityBar();
        });

        utils.override(layout.Layout, isCodium ? 'setSideBarHidden' : 'Ib', function (original, args) {
          original();
          self.updateActivityBar();
        });

        utils.override(layout.Layout, isCodium ? 'setActivityBarHidden' : 'Fb', function (original, args) {
          original(...args);
          this.container.classList.toggle('no-activity-bar');
        });

        utils.override(layout.Layout, isCodium ? 'restoreParts' : 'yb', function (original) {
          original();
          self.updateActivityBar();
          self.updateStatusBar();
          self.hideActivityBarSettings();
        });

        utils.override(layout.Layout, isCodium ? 'getInitialEditorsState' : 'tb', function (original) {
          original();
          self.layout = this;
        });
      }, error);

      require(['vs/workbench/browser/parts/compositePart'], function (compositePart) {
        if (titleBarStyle === 'native') {
          utils.override(compositePart.CompositePart, isCodium ? 'createTitleArea' : 'G', function (original) {
            const inlineTitle = original();
            if (['workbench.parts.sidebar', 'workbench.parts.auxiliarybar'].includes(isCodium ? this.id : this.C)) {
              inlineTitle.addEventListener('dblclick', () => self.nativeHostService.handleTitleDoubleClick());
            }
            if (electronConfig.titleBarStyle && (isCodium ? this.id : this.C) === 'workbench.parts.sidebar') {
              self.titlebarPlaceholder = document.createElement('div');
              self.titlebarPlaceholder.classList.add('inline-titlebar-placeholder');
              inlineTitle.prepend(self.titlebarPlaceholder);
            }
            return inlineTitle;
          });
        }
      }, error);

      require(['vs/workbench/browser/parts/activitybar/activitybarPart'], function (activitybarPart) {

        utils.override(activitybarPart.ActivitybarPart, 'layout', function (original, args) {
          original();
          if (!self.configurationService.getValue('workbench.activityBar.visible')) { return; }
          const { orientation, size, hideSettings } = self.activityBarConfig;
          const [width, height] = args;

          const contentAreaSize = isCodium ? this.layoutContents(width, height)?.contentSize : this.L(width, height)?.contentSize;
          let availableSize = orientation ? contentAreaSize?.height : contentAreaSize?.width;

          if (this.homeBarContainer) { availableSize -= orientation ? this.homeBarContainer.clientHeight : this.homeBarContainer.clientWidth; }
          if (isCodium ? this.menuBarContainer : this.R) { availableSize -= orientation ? isCodium ? this.menuBarContainer.clientHeight : this.R.clientHeight : isCodium ? this.menuBarContainer.clientWidth : this.R.clientWidth; }
          if (!hideSettings) { availableSize -= (isCodium ? this.globalActivityActionBar.viewItems.length : this.X.viewItems.length) * size; }// adjust width for global actions showing 
          const newDimension = new dom.Dimension(availableSize, orientation ? height : width);
          isCodium ? this.compositeBar?.layout(newDimension) : this.S?.layout(newDimension);
        });

        utils.override(activitybarPart.ActivitybarPart, isCodium ? 'createContentArea' : 'I', function (original, args) {
          const res = original();

          if (!self.layout.isVisible('workbench.parts.activitybar')) { self.layout.container.classList.add('no-activity-bar'); }

          self.updateActivityBar = () => {
            const { position, size } = self.activityBarConfig;
            const workbenchGrid = isCodium ? self.layout.workbenchGrid : self.layout.s;
            const sideBarPartView = isCodium ? self.layout.sideBarPartView : self.layout.y;

            const isBottom = position === 'bottom';
            const isSideBarVisible = (isCodium ? !self.layout.stateModel.getRuntimeValue({ name: 'sideBar.hidden' }) : !self.layout.bb.getRuntimeValue({ name: 'sideBar.hidden' }));

            this.minimumWidth = isBottom ? 0 : size;
            this.maximumWidth = isBottom ? isSideBarVisible ? Infinity : 0 : size;
            this.minimumHeight = isBottom && isSideBarVisible ? size : 0;
            this.maximumHeight = isBottom && isSideBarVisible ? size : Infinity;

            this.element?.querySelectorAll('div.monaco-action-bar').forEach(el => el.classList[isBottom ? 'remove' : 'add']('vertical'));
            isBottom && isSideBarVisible ?
              workbenchGrid.moveView(this, sideBarPartView.minimumHeight, sideBarPartView, 1) :
              workbenchGrid.moveViewTo(this, [2, 0]);

            self.layout.layout();
          };

          self.configurationService.onDidChangeConfiguration(e => e.affectsConfiguration('apc.activityBar') && self.updateActivityBar());

          // 
          if (electronConfig.titleBarStyle) {
            const parent = args[0];
            const placeholder = document.createElement('div');
            placeholder.classList.add('activity-bar-placeholder');
            parent.prepend(placeholder);
          }

          // show/hidde activity bar settings
          self.hideActivityBarSettings = () => {
            const globalActivitiesContainer = isCodium ? this.globalActivitiesContainer : this.Y;
            const isConnected = globalActivitiesContainer.isConnected;
            const { hideSettings } = self.activityBarConfig || {};

            const content = isCodium ? this.content : this.P;
            if (hideSettings && isConnected) { content.removeChild(globalActivitiesContainer); }
            if (!hideSettings && !isConnected) { content.appendChild(globalActivitiesContainer); }
          };
          self.configurationService.onDidChangeConfiguration(e => e.affectsConfiguration('apc.activityBar') && self.hideActivityBarSettings());
          return res;
        });
      }, error);

      require(['vs/workbench/browser/parts/editor/tabsTitleControl'], function (titleControl) {
        utils.override(titleControl.TabsTitleControl, isCodium ? 'create' : 'P', function (original) {
          original();
          // !! border
          const tabsScrollbar = isCodium ? this.tabsScrollbar.getDomNode() : this.rb.getDomNode();
          const node = document.createElement('div');
          node.classList.add('no-tabs');
          node.addEventListener('dblclick', e => {
            e.stopPropagation();
            self.nativeHostService.handleTitleDoubleClick();
          });
          tabsScrollbar.style.display = 'flex';
          tabsScrollbar.appendChild(node);
        });
      }, error);

      require(['vs/workbench/contrib/files/browser/views/openEditorsView'], function (openEditorsView) {
        utils.override(openEditorsView.OpenEditorsView, isCodium ? 'layoutBody' : 'U', function (original) {
          original();
          const items = (isCodium ? this.list.anchor.length : this.j.c.c) + 1;
          const parentNode = isCodium ? this.list.view.domNode.parentNode.parentNode.parentNode : this.j.k.domNode.parentNode.parentNode.parentNode;
          parentNode.style.height = items * self.listRowConfig.height + 'px';
        });

        utils.override(openEditorsView.OpenEditorsView, isCodium ? 'onConfigurationChange' : 'hc', function (original, [e]) {
          original();
          if (e.affectsConfiguration('apc.listRow')) {
            isCodium ? this.updateSize() : this.ic();
            isCodium ? this.listRefreshScheduler?.schedule() : this.f?.schedule();
          }
        });

        utils.override(openEditorsView.OpenEditorsView, isCodium ? 'getMaxExpandedBodySize' : 'lc', function (original) {
          const minVisibleOpenEditors = self.configurationService.getValue('explorer.openEditors.minVisible') ?? 1;
          const containerModel = isCodium ?
            this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id)) :
            this.xb.getViewContainerModel(this.xb.getViewContainerByViewId(this.id));

          if (containerModel.visibleViewDescriptors.length <= 1) { return Number.POSITIVE_INFINITY; }
          return Math.max(isCodium ? this.elementCount : this.kc, minVisibleOpenEditors) * self.listRowConfig.height;
        });

        utils.override(openEditorsView.OpenEditorsView, isCodium ? 'computeMinExpandedBodySize' : 'nc', function (original, [visibleOpenEditors]) {
          const itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), isCodium ? this.elementCount : this.kc);
          return itemsToShow * self.listRowConfig.height;
        });
      }, function (error) { });


      if (browser.PixelRatio) { browser.PixelRatio.onDidChange(this.update.bind(this)); }
      else if (browser.onDidChangeZoomLevel) { browser.onDidChangeZoomLevel(this.update.bind(this)); }
      browser.onDidChangeFullscreen(this.update.bind(this));

      this.configurationService.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('apc.listRow') || e.affectsConfiguration('apc.header') || e.affectsConfiguration('apc.activityBar') || e.affectsConfiguration('apc.statusBar') || e.affectsConfiguration('apc.stylesheet')) {
          this.update();
        }
        if (e.affectsConfiguration('apc.stylesheet')) {
          if (!this.customStyle) {
            const style = document.createElement('style');
            style.rel = 'stylesheet';
            this.customStyle = document.createTextNode('');
            style.appendChild(this.customStyle);
            document.getElementsByTagName('head')[0].appendChild(style);
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
      });

      this.update();
    }

    update() {
      const listRowConfig = this.listRowConfig;
      const headerConfig = this.headerConfig;
      const activityBarConfig = this.activityBarConfig;
      const statusBarConfig = this.statusBarConfig;
      const electronConfig = this.configurationService.getValue('apc.electron') || {};
      const { x = 10 } = electronConfig?.trafficLightPosition || {};

      document.body.classList[activityBarConfig.position === 'bottom' ? 'add' : 'remove']('activity-bar-at-bottom');

      if (!this.styleTextNode) {
        const style = document.createElement('style');
        style.rel = 'stylesheet';
        this.styleTextNode = document.createTextNode('');
        style.appendChild(this.styleTextNode);
        document.getElementsByTagName('head')[0].appendChild(style);
      }

      this.styleTextNode.textContent = `:root {
        --row-height: ${listRowConfig.height}px; 
        --row-font-size: ${listRowConfig.fontSize}px;
        --header-height: ${headerConfig.height}px;
        --header-font-size: ${headerConfig.fontSize}px;
        --activity-bar-action-size: ${activityBarConfig.size}px;
        --status-bar-font-size: ${statusBarConfig.fontSize}px;
        --traffic-X: ${x}px;
        `;
    }
  }

  exports.run = function (instantiationService) {
    instantiationService.createInstance(utils.decorate([utils.param(0, configuration.IConfigurationService), utils.param(1, electron.INativeHostService)], Customize));
  };
}
define([
  'exports',
  'apc/utils',
  'vs/platform/configuration/common/configuration',
  'vs/base/browser/browser',
  'vs/base/common/platform',
  'vs/platform/native/common/native',
  'vs/base/browser/dom'
], customize);
