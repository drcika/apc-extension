define(
  ['exports', 'apc/utils', 'apc/auxiliary', 'apc/configuration', 'apc/override'],
  function (exports, utils, auxiliary, { config }, override) {
    try {
      const { traceError, findInPrototype, findOwnProperty, store, getProperty, services, findVariable } = auxiliary;
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
        try {
          store.ActionsOrientation = actionbar.ActionsOrientation;
          const [actionBarKey, ActionBarClass] = findInPrototype(actionbar, 'ActionBar', 'getAction'); // the only one type class
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
          const [menuKey, MenuClass] = findInPrototype(menu, 'Menu', 'trigger'); // the only one type class
          menu[menuKey] = class Menu extends MenuClass {
            constructor(menuHolder) {
              super(...arguments);
              try {
                if (!config.getConfiguration('apc.menubar.compact')) { return; }
                const { position, isHorizontal } = config.activityBar;
                if (isHorizontal) {
                  const sideBarPosition = services.layoutService.getSideBarPosition();
                  const isTop = position === 'top';
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
                  menuHolder.style.left = sideBarPosition === store.Position.LEFT ? `${titleBoundingRect.left + titleBoundingRect.width}px` : `${titleBoundingRect.left - menuHolderBoundingRect.width}px`;
                  menuHolder.style.right = 'auto';
                  menuHolder.style.bottom = 'auto';
                }
              } catch (error) { traceError(error); }
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.menubar = function (menubar) {
        // try {
        //   const [menuBarKey, MenuBarClass] = findInPrototype(menubar, 'MenuBar', 'createOverflowMenu'); // the only one
        //   menubar[menuBarKey] = class MenuBar extends MenuBarClass {
        //     constructor() {
        //       super(...arguments);
        //       store.menubar = this;
        //       setTimeout(() => { this.ab(20, false); }, 1000);
        //     }
        //   };
        // } catch (error) { traceError(error); }
      };

      exports.openEditorsView = function (openEditorsView) {
        try {
          const [openEditorsViewKey, OpenEditorsViewClass] = findInPrototype(openEditorsView, 'OpenEditorsView', 'titleDescription'); // the only one
          openEditorsView[openEditorsViewKey] = class OpenEditorsView extends OpenEditorsViewClass {
            constructor() {
              super(...arguments);
              try {
                const getMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize').get;
                const setMinimumBodySize = Object.getOwnPropertyDescriptor(this.__proto__.__proto__.__proto__.__proto__, 'minimumBodySize').set;

                Object.defineProperty(this, 'minimumBodySize', {
                  get() { return getMinimumBodySize.call(this); },
                  set(num) {
                    const openEditorsConfig = config.listRow.get('open-editors');
                    if (!openEditorsConfig) { return setMinimumBodySize.call(this, num); }
                    const visibleOpenEditors = config.getConfiguration('explorer.openEditors.visible') ?? 1;
                    const size = this.orientation === store.Orientation.VERTICAL ? (Math.min(Math.max(visibleOpenEditors, 1), this._elementCount) * openEditorsConfig.height) ?? 170 : 170;
                    setMinimumBodySize?.call(this, size);
                  },
                  configurable: true,
                });
              } catch (error) { traceError(error); }
            }

            get _elementCount() {
              return services.editorGroupsService.groups.map(g => g.count)
                .reduce((first, second) => first + second, this.showGroups ? services.editorGroupsService.groups.length : 0);
            }
          };
        } catch (error) { traceError(error); }
      };

      exports.listView = function (listView) {
        try {
          const knownlistViews = new Set(['customview-tree', 'tabs-list', 'results', 'open-editors', 'explorer-folders-view', 'tree', 'tree-container', 'outline-tree', 'scm-view', 'debug-view-content', 'debug-breakpoints',
            'settings-toc-wrapper', 'settings-tree-container', 'quick-input-list', 'monaco-table', 'select-box-dropdown-list-container', 'extensions-list', "notifications-list-container"]);

          function findItemList(listView) {
            for (const key in listView) {
              if (listView[key] instanceof Array) {
                return key;
              }
            }
          }
          const [listViewKey, ListViewClass] = findInPrototype(listView, 'ListView', 'domElement'); // the only one
          listView[listViewKey] = class ListView extends ListViewClass {
            constructor(container, virtualDelegate, renderers, options) {

              if (!Array.from(container.classList.values()).some((className) => knownlistViews.has(className))) {
                console.dir(container.classList);
              }
              const originalDelegate = getProperty(virtualDelegate, 'getHeight');
              virtualDelegate.getHeight = function (arg) {
                const configs = config.listRow;
                const className = Array.from(container.classList.values()).find(classname => configs.get(classname));

                if (className) {
                  !container.classList.contains('custom-list-row') && container.classList.add('custom-list-row');

                  const { height, fontSize, input, actionButton } = configs.get(className);
                  container.style.setProperty('--row-height', `${height}px`);
                  container.style.setProperty('--row-font-size', `${fontSize}px`);

                  return arg?.element?.placeholder ?
                    input ?? originalDelegate.value.call(this, arg) :
                    arg?.element?.type === 'actionButton' ?
                      actionButton ?? originalDelegate.value.call(this, arg) :
                      height;
                }
                container.classList.contains('custom-list-row') && container.classList.remove('custom-list-row');

                return originalDelegate.value.call(this, arg);
              };

              super(...arguments);

              const itemsKey = findItemList(this);
              config.disposables.add(config.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('apc.listRow')) {
                  try {
                    this[itemsKey] instanceof Array && this[itemsKey].forEach((item, i) => {
                      this.updateElementHeight(i, virtualDelegate.getHeight(item.element || item));
                    });
                  } catch (error) { traceError(error); }
                }
              }));
            }
          };
        } catch (error) { traceError(error); }

      };

      exports.layout = function (layout) {
        try {
          const [, LayoutClass] = findInPrototype(layout, 'Layout', 'registerPart'); // the only one
          utils.override(LayoutClass, 'registerPart', override.registerPart);
          utils.override(LayoutClass, 'toggleZenMode', override.toggleZenMode);
          utils.override(LayoutClass, 'setPartHidden', override.setPartHidden);
          utils.override(LayoutClass, 'setPanelAlignment', override.setPanelAlignment);
          utils.override(LayoutClass, 'setPanelPosition', override.setPanelPosition);
        } catch (error) { traceError(error); }
      };

      exports.style = function (style) {
        try {
          const [key] = findVariable(style, 'DEFAULT_FONT_FAMILY', 'string'); // the only one
          const _DEFAULT_FONT_FAMILY = style[key];
          Object.defineProperty(style, key, {
            get() {
              try {
                return config.fontFamily.customFontFamily || _DEFAULT_FONT_FAMILY;
              } catch (error) {
                traceError(error);
                return _DEFAULT_FONT_FAMILY;
              }
            },
            set() { },
            configurable: true
          });
        } catch (error) { traceError(error); }
      };

      exports.menubarControl = function (menubarControl) {
        try {
          // ** only in certain cases and it is related to menubar and titleBarStyle
          const [, CustomMenubarControlClass] = findInPrototype(menubarControl, 'CustomMenubarControl', 'create');
          utils.override(CustomMenubarControlClass, 'create', override.menubarControlCreate);
        } catch (error) { traceError(error); }
      };

      exports.editorPart = function (editorPart) {
        try {
          const [, EditorPartClass] = findInPrototype(editorPart, 'EditorPart', 'addGroup'); // the only one
          utils.override(EditorPartClass, 'create', override.editorPartCreate);
          utils.override(EditorPartClass, 'applyLayout', override.editorApplyLayout);
        } catch (error) { traceError(error); }
      };

      exports.compositeBar = function (compositeBar) {
        try {
          const [compositeBarKey, CompositeBarClass] = findInPrototype(compositeBar, 'CompositeBar', 'activateComposite');
          compositeBar[compositeBarKey] = class CompositeBar extends CompositeBarClass {
            constructor(items, options) {
              if (options.getDefaultCompositeId() === 'workbench.view.explorer') {
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
          const [, ActivitybarPartClass] = findInPrototype(activitybarPart, 'ActivitybarPart', 'getVisiblePaneCompositeIds'); // the only one
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

      function findTabsHeights(obj, original, property) {
        if(obj?.[original]?.[property] instanceof Object && 'compact' in obj[original][property]) {
          return [original, obj[original], property];
        }
        for (const className in obj) {
          for (const key in obj[className]) {
            const val = obj[className][key];
            if (val instanceof Object && 'compact' in val) {
              return [className, obj[className], key];
            }
          }
        }

        return [];
      }

      exports.editorTabsControl = function (editorTabsControl) {
        try {
          const [, EditorTabsControl, EDITOR_TAB_HEIGHT] = findTabsHeights(editorTabsControl, 'EditorTabsControl', 'EDITOR_TAB_HEIGHT');

          EditorTabsControl[EDITOR_TAB_HEIGHT] = {
            normal: config.header.normal,
            compact: config.header.compact
          };

          config.disposables.add(config.onDidChangeConfiguration(async e => {
            if (e.affectsConfiguration('apc.header')) {
              try {
                if (!store.initialised) { return; }
                // "window.density.editorTabHeight": "compact",
                EditorTabsControl[EDITOR_TAB_HEIGHT] = {
                  normal: config.header.normal,
                  compact: config.header.compact
                };

                const currentValue = services.configurationService.getValue('window.density.editorTabHeight');
                await services.configurationService.updateValue('window.density.editorTabHeight', currentValue === 'compact' ? 'default' : 'compact');
                services.configurationService.updateValue('window.density.editorTabHeight', currentValue);

              } catch (error) { traceError(error); }
            }
          }));
        } catch (error) { traceError(error); }
      };
      
    } catch (error) { traceError(error); }
  });
