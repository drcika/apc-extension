define(
  ['exports', 'apc/utils', 'apc/auxiliary', 'apc/configuration', 'apc/override', 'apc/ui', 'apc/layout.activitybar'],
  function (exports, utils, auxiliary, { config }, override, UI, activitybar) {
    try {
      const { traceError, findInPrototype, findOwnProperty, store, getProperty, storeReference, Part } = auxiliary;

      exports.fileService = function (fileService) {
        const [fileServiceKey, FileServiceClass] = findInPrototype(fileService, 'FileService', 'readFile'); // the only one
        try {
          fileService[fileServiceKey] = class FileService extends FileServiceClass {
            constructor() {
              super(...arguments);
              if (!store.fileService) { store.fileService = this; }
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.layoutService = layoutService => {
        try {
          store.Parts = layoutService.Parts;
          store.Position = layoutService.Position;
        } catch (error) { traceError(error); }
      };

      exports.grid = function (grid) {
        try {
          const [serializableGridKey, SerializableGridClass] = findOwnProperty(grid, 'SerializableGrid', 'deserialize');
          store.Direction = grid.Direction;
          store.Orientation = grid.Orientation;
          const orgDeserialize = grid[serializableGridKey].deserialize;
          grid[serializableGridKey] = class SerializableGrid extends SerializableGridClass {
            static deserialize(json, deserializer, options) {
              try {
                const grid = orgDeserialize(json, deserializer, options);
                if (grid.element.querySelector('.monaco-grid-view .monaco-grid-view')) { store.workbenchGrid = grid; }
                // else { self.editorGrid = grid; } 
                return grid;
              } catch (error) {
                traceError(error);
                return orgDeserialize(...arguments);
              }
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.actionbar = function (actionbar) {
        store.ActionsOrientation = actionbar.ActionsOrientation;
        const [actionBarKey, ActionBarClass] = findInPrototype(actionbar, 'ActionBar', 'getAction'); // the only one type class
        try {
          actionbar[actionBarKey] = class ActionBar extends ActionBarClass {
            constructor(container, options) {
              super(...arguments);
              try {
                // the only actionbar that has no class
                if (!container?.className && options?.ariaLabel === 'Manage') {
                  store.globalActivityActionBar = this;
                  container.classList.add('global-activity-actionbar');
                }
              } catch (error) { traceError(error); }
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.menu = function (menu) {
        try {
          if (store.isMacintosh) {
            const [menuKey, MenuClass] = findInPrototype(menu, 'Menu', 'trigger'); // the only one type class
            menu[menuKey] = class Menu extends MenuClass {
              constructor(menuHolder) {
                super(...arguments);
                try {
                  if (!config.getConfiguration('apc.menubar.compact')) { return; }
                  const { position, isHorizontal } = config.activityBar;
                  if (isHorizontal) {
                    const sideBarPosition = store.layoutService.getSideBarPosition();
                    const isTop = position === 'top';
                    const isLeft = sideBarPosition === store.Position.LEFT;
                    if (!isTop) {
                      const menuElement = store.menubarControlContainer.querySelector('.monaco-menu');
                      const maxHeight = `${menuElement.querySelector('.monaco-action-bar').clientHeight}px`;
                      menuElement.style.maxHeight = maxHeight;
                      const slider = store.menubarControlContainer.querySelector('.scrollbar.vertical > .slider');
                      slider.style.height = 0;
                    }

                    const titleBoundingRect = store.menubarControlContainer.querySelector('.menubar-menu-title').getBoundingClientRect();
                    const menuHolderBoundingRect = menuHolder.getBoundingClientRect();

                    menuHolder.style.top = isTop ? `${titleBoundingRect.top}px` : `${titleBoundingRect.bottom - menuHolderBoundingRect.height}px`;
                    menuHolder.style.left = isLeft ? `${titleBoundingRect.left + titleBoundingRect.width}px` : `${titleBoundingRect.left - menuHolderBoundingRect.width}px`;
                    menuHolder.style.right = 'auto';
                    menuHolder.style.bottom = 'auto';
                  }
                } catch (error) { traceError(error); }
              }
            };
          }
        } catch (error) { traceError(error); }
      };

      exports.menubar = function (menubar) {
        try {
          const [menuBarKey, MenuBarClass] = findInPrototype(menubar, 'MenuBar', 'createOverflowMenu'); // the only one
          menubar[menuBarKey] = class MenuBar extends MenuBarClass {
            constructor() {
              super(...arguments);
              store.menubar = this;
              // setTimeout(() => { this.menubar.ab(20, false); }, 1000);
            }
          };

        } catch (error) { traceError(error); }
      };

      exports.panelPart = function (panelPart) {
        const [panelPartKey, PanelPartClass] = findInPrototype(panelPart, 'PanelPart', 'toJSON');
        try {
          panelPart[panelPartKey] = class PanelPart extends PanelPartClass {
            constructor(a, storageService, b, c, layoutService, d, e, themeService, f, g, extensionService, j, k) {
              super(...arguments);
              storeReference({ storageService, layoutService, themeService, extensionService, panelPartView: this });
            }
          };

        } catch (error) { traceError(error); }
      };

      exports.openEditorsView = function (openEditorsView) {
        try {
          const [openEditorsViewKey, OpenEditorsViewClass] = findInPrototype(openEditorsView, 'OpenEditorsView', 'titleDescription'); // the only one
          openEditorsView[openEditorsViewKey] = class OpenEditorsView extends OpenEditorsViewClass {
            constructor(a, b, c, d, editorGroupService) {
              super(...arguments);
              if (!store.editorGroupService) { store.editorGroupService = editorGroupService; }
              try {
                const getMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize').get;
                const setMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize').set;
                Object.defineProperty(this, 'minimumBodySize', {
                  get() { return getMinimumBodySize.call(this); },
                  set(num) {
                    const { isEnabled, height } = config.listRow;
                    if (!isEnabled) { return setMinimumBodySize.call(this, num); }
                    const visibleOpenEditors = config.getConfiguration('explorer.openEditors.visible') ?? 1;
                    const size = this.orientation === store.Orientation.VERTICAL ? Math.min(Math.max(visibleOpenEditors, 1), this._elementCount) * height ?? 170 : 170;
                    setMinimumBodySize?.call(this, size);
                  },
                  configurable: true,
                });
              } catch (error) { traceError(error); }
            }

            get _elementCount() {
              return store.editorGroupService.groups.map(g => g.count)
                .reduce((first, second) => first + second, this.showGroups ? store.editorGroupService.groups.length : 0);
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.listView = function (listView) {
        try {
          const [listViewKey, ListViewClass] = findInPrototype(listView, 'ListView', 'domElement'); // the only one
          listView[listViewKey] = class ListView extends ListViewClass {
            constructor(_, virtualDelegate, renderers) {
              if (!renderers.find(renderer => renderer.templateId?.match(/(notification|replGroup|rm|extension|settings)/))) {
                const originalDelegate = getProperty(virtualDelegate, 'getHeight');
                virtualDelegate.getHeight = function (...args) {
                  try {
                    const { isEnabled, height } = config.listRow;
                    return isEnabled ?
                      args[0].element?.placeholder || args[0].element?.type === 'actionButton' ? height * 1.5 : height :
                      originalDelegate.value.call(this, ...args);
                  }
                  catch (error) { traceError(error); originalDelegate.value.call(this, ...args); }
                };

                config.disposables.add(config.onDidChangeConfiguration(e => {
                  if (e.affectsConfiguration('apc.listRow')) {
                    try {
                      const height = config.listRow.height;
                      new Array(this.length).fill(undefined).forEach((e, i) => this.updateElementHeight(i, height));
                    } catch (error) { traceError(erorr); }
                  }
                }));
              }
              super(...arguments);
            }
          };
        } catch (error) { traceError(erorr); }
      };

      exports.layout = function (layout) {
        try {
          const [, Layout] = findInPrototype(layout, 'Layout', 'registerPart'); // the only one
          utils.override(Layout, 'registerPart', override.registerPart);
          utils.override(Layout, 'toggleZenMode', override.toggleZenMode);
          utils.override(Layout, 'setPartHidden', override.setPartHidden);
          utils.override(Layout, 'setPanelAlignment', override.setPanelAlignment);
          utils.override(Layout, 'setPanelPosition', override.setPanelPosition);
        } catch (error) { traceError(error); }
      };

      exports.menubarControl = function (menubarControl) {
        try {
          // ** only in certain cases and it is related to menubar and titleBarStyle
          const [, CustomMenubarControlClass] = findInPrototype(menubarControl, 'CustomMenubarControl', 'create');
          utils.override(CustomMenubarControlClass, 'create', override.menubarControlCreate);
        } catch (error) { traceError(error); }
      };

      exports.statusbarPart = function (statusbarPart) {
        try {
          const [, StatusbarPartClass] = findInPrototype(statusbarPart, 'StatusbarPart', 'addEntry'); // the only one
          utils.override(StatusbarPartClass, 'create', override.statusbarPartCreate); // ?? service 
        } catch (error) { traceError(error); }
      };

      exports.editorPart = function (editorPart) {
        try {
          const [, EditorPartClass] = findInPrototype(editorPart, 'EditorPart', 'addGroup'); // the only one
          utils.override(EditorPartClass, 'removeGroup', override.editorPartRemoveGroup);
          utils.override(EditorPartClass, 'create', override.editorPartCreate);
          utils.override(EditorPartClass, 'applyLayout', override.editorApplyLayout);
        } catch (error) { traceError(error); }
      };
      // razdvojiti css i primeniti samo ako je inline
      exports.sidebarPart = function (sidebarPart) {
        const [sidebarPartKey, SidebarPartClass] = findInPrototype(sidebarPart, 'SidebarPart', 'getPaneComposite'); // the only one
        try {
          sidebarPart[sidebarPartKey] = class SidebarPart extends sidebarPart[sidebarPartKey] {
            constructor(notificationService, storageService, a, layoutService, b, c, themeService, d, e, extensionService) {
              super(...arguments);
              storeReference({ layoutService, storageService, themeService, notificationService, sidebarPartView: this, extensionService });
            }
          };
        } catch (error) { traceError(error); }

        utils.override(SidebarPartClass, 'create', override.sidebarPartCreate);
      };

      exports.auxiliaryBarPart = function (auxiliaryBarPart) {
        const [auxiliaryBarPartKey, AuxiliaryBarPartClass] = findInPrototype(auxiliaryBarPart, 'AuxiliaryBarPart', 'onDidPaneCompositeOpen'); // the only one

        auxiliaryBarPart[auxiliaryBarPartKey] = class AuxiliaryBarPart extends AuxiliaryBarPartClass {
          constructor(notificationService, storageService, a, layoutService, b, c, themeService, d, e, extensionService, f) {
            super(...arguments);
            storeReference({ auxiliarybarPartView: this, notificationService, storageService, layoutService, themeService, extensionService });
          }
        };

        utils.override(AuxiliaryBarPartClass, 'create', override.auxiliarybarPartCreate, traceError);
      };

      exports.compositeBar = function (compositeBar) {
        try {
          const [compositeBarKey, CompositeBarClass] = findInPrototype(compositeBar, 'CompositeBar', 'activateComposite');
          compositeBar[compositeBarKey] = class CompositeBar extends CompositeBarClass {
            constructor(items, options) {
              if (options.getDefaultCompositeId() === 'workbench.view.explorer') {
                // activitybar.updateActivityBarItemSize(options);
                super(...arguments);
                this.activityBarOptions = options;
                store.activityBarCompositeBar = this;
              }
              else {
                super(...arguments);
              }
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.activitybarPart = function (activitybarPart) {
        try {
          const [activitybarPartKey, ActivitybarPartClass] = findInPrototype(activitybarPart, 'ActivitybarPart', 'getVisiblePaneCompositeIds'); // the only one
          activitybarPart[activitybarPartKey] = class ActivitybarPart extends ActivitybarPartClass {
            constructor(paneCompositePart, a, layoutService, themeService, storageService, extensionService, b, c, configurationService, environmentService) {
              try {
                store.dummActivitybarPartView = new Part(store.DUMMY_ACTIVITYBAR_PART, { hasTitle: false }, themeService, storageService, layoutService);
                store.dummStatusbarPartView = new Part(store.DUMMY_STATUSBAR_PART, { hasTitle: false }, themeService, storageService, layoutService);
              } catch (error) { traceError(error); }

              super(...arguments);
              storeReference({ activitybarPartView: this, layoutService, themeService, storageService, configurationService, sidebarPartView: paneCompositePart, extensionService, environmentService });
            }
          };

          utils.override(ActivitybarPartClass, 'create', override.activitybarCreate);
          utils.override(ActivitybarPartClass, 'setVisible', override.setVisibleActivityBar);
          utils.override(ActivitybarPartClass, 'layout', override.activitybarLayout);
          utils.override(ActivitybarPartClass, 'updateStyles', override.activitybarUpdateStyles);
        } catch (error) { traceError(error); }
      };

      exports.workbench = function (workbench) {
        try {
          const [, Workbench] = findInPrototype(workbench, 'Workbench', 'startup');
          utils.override(Workbench, 'startup', override.startup);
        } catch (error) { traceError(error); }
      };

      exports.window = function (win) {
        for (const key in win) {
          if (win[key] instanceof Function) {
            const original = win[key];
            win[key] = (...args) => {
              const res = original(...args);
              return ['classic', 'visible', 'toggle', 'hidden', 'compact'].includes(res) ? 'compact' : res;
            };
          }
        }
      };

    } catch (error) { traceError(error); }
  });
