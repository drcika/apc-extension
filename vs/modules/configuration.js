define(['exports', 'vs/modules/auxiliary'], function (exports, auxiliary) {

  class DomListener {
    constructor(node, type, handler, options) {
      this._node = node;
      this._type = type;
      this._handler = handler;
      this._options = (options ?? false);
      this._node.addEventListener(this._type, this._handler, this._options);
    }

    dispose() {
      if (!this._handler) { return; }
      this._node.removeEventListener(this._type, this._handler, this._options);
      this._node = null;
      this._handler = null;
    }
  };

  try {
    const { store, findOwnProperty, traceError, services } = auxiliary;

    const [, DisposableStore] = findOwnProperty(require('vs/base/common/lifecycle'), 'DisposableStore', 'DISABLE_DISPOSED_WARNING');
    const [, Dimension] = findOwnProperty(require('vs/base/browser/dom'), 'Dimension', 'equals');

    store.Dimension = Dimension;

    exports.config = {
      disposables: new DisposableStore(),
      addDisposable(disposable) {
        try {
          this.disposables.add(disposable);
          return disposable;
        } catch (error) { traceError(error); }
      },
      addDisposableListener(node, type, handler, options) {
        return this.addDisposable(new DomListener(node, type, handler, options));
      },
      getConfiguration(config) {
        try { return services.configurationService?.getValue?.(config); }
        catch (error) { traceError(error); }
      },

      HEADER_NORMAL: 35,
      HEADER_COMPACT: 22,
      HEADER_FONT_SIZE: 13,
      get header() {
        const { height, fontSize, default: normal, compact } = this.getConfiguration('apc.header') || {};
        return {
          normal: (normal || height || this.HEADER_NORMAL),
          compact: (compact || height || this.HEADER_COMPACT),
          fontSize: (fontSize || this.HEADER_FONT_SIZE),
          isEnabled: !!fontSize
        };
      },

      TITLEBAR_HEIGHT: 35,
      TITLEBAR_FONT_SIZE: 11,
      get titlebar() {
        const { height, fontSize } = this.getConfiguration('apc.sidebar.titlebar') || {};
        return {
          height: (height || this.TITLEBAR_HEIGHT),
          fontSize: (fontSize || this.TITLEBAR_FONT_SIZE),
          isEnabled: !!(fontSize || height)
        };
      },

      LIST_ROW_HEIGHT: 22,
      LIST_ROW_FONT_SIZE: 13,
      LIST_ROW: ['customview-tree', 'results', 'open-editors', 'explorer-folders-view', 'outline-tree', 'scm-view', 'debug-view-content', 'debug-breakpoints', 'tree'],
      get listRow() {
        const { parts, input, actionButton, ...config } = this.getConfiguration('apc.listRow') || {};
        const isEnabled = Boolean(config.height || config.fontSize || config.lists?.length || parts);

        const configs = new Map();

        if (!isEnabled) { return configs; }

        const lists = config.lists || (Boolean(config.height || config.fontSize) ? this.LIST_ROW : []);
        const height = (config.height ?? this.LIST_ROW_HEIGHT);
        const fontSize = (config.fontSize ?? this.LIST_ROW_FONT_SIZE);

        lists.forEach(className => configs.set(className, {
          height,
          fontSize,
          ...(className === 'scm-view' && {
            input,
            actionButton,
          })
        }));

        for (const className in (parts || {})) {
          configs.set(className, {
            height: parts[className].height ?? height,
            fontSize: parts[className].fontSize ?? fontSize,
            ...(className === 'scm-view' && {
              input: parts[className].input,
              actionButton: parts[className].actionButton,
            })
          });
        }
        return configs;
      },

      ACTIVITY_BAR_SIZE: 48,
      get activityBar() {
        const { size, itemSize, itemMargin, position } = this.getConfiguration('apc.activityBar') || {};
        const isHorizontal = position === 'bottom';
        return {
          position: position === 'bottom' ? 'bottom' : undefined,
          isHorizontal,
          orientation: isHorizontal ? store.ActionsOrientation.HORIZONTAL : store.ActionsOrientation.VERTICAL,
          size: (size ?? this.ACTIVITY_BAR_SIZE),
          itemSize: (itemSize ?? size ?? this.ACTIVITY_BAR_SIZE),
          itemMargin: (itemMargin ?? 3),
          isEnabled: !!size
        };
      },

      STATUSBAR_HEIGHT: 22,
      STATUSBAR_FONT_SIZE: 12,
      get statusBar() {
        const { fontSize, height, position } = this.getConfiguration('apc.statusBar') || {};
        return {
          position: position || 'bottom',
          height: (height ?? this.STATUSBAR_HEIGHT),
          fontSize: (fontSize ?? this.STATUSBAR_FONT_SIZE),
          isEnabled: !!(fontSize || height || position)
        };
      },

      get electron() {
        if (!this._electronConfig) {
          this._electronConfig = this.getConfiguration('apc.electron') || {};
          if (!this._electronConfig.trafficLightPosition) { this._electronConfig.trafficLightPosition = {}; }
          if (!this._electronConfig.trafficLightPosition.x !== undefined) { this._electronConfig.trafficLightPosition.x = 6; }
          if (!this._electronConfig.trafficLightPosition.y !== undefined) { this._electronConfig.trafficLightPosition.y = 6; }
        }
        return this._electronConfig;
      },

      get fontFamily() {
        const customFontFamily = this.getConfiguration('apc.font.family');
        const customMonospaceFontFamily = this.getConfiguration('apc.monospace.font.family');
        const customPartsFontFamily = this.getConfiguration('apc.parts.font.family') || {};
        return {
          customFontFamily,
          customMonospaceFontFamily,
          ...customPartsFontFamily,
        };
      },

      get titleBarStyle() {
        if (!this._titleBarStyle) {
          this._titleBarStyle = this.getConfiguration('window.titleBarStyle');
        }
        return this._titleBarStyle;
      },

      get isInline() {
        if (!this._isInline) {
          this._isInline = (!!this.electron.titleBarStyle || this.electron.frame === false);
        }
        return this._isInline;
      },

      handleDblclick(element, onDblclick) {
        return this.addDisposableListener(element, 'dblclick', onDblclick);
      },

      handleTitleDoubleClick(...args) {
        try { return services.nativeHostService.handleTitleDoubleClick(...args); }
        catch (error) { traceError(error); }
      },

      onDidChangeConfiguration(...args) {
        try { return services.configurationService.onDidChangeConfiguration(...args); }
        catch (error) { traceError(error); }
      },

      getColor(config) {
        try { return services.themeService.getColorTheme().getColor(config)?.toString(); }
        catch (error) { traceError(error); }
      },

      isVisible(part) {
        try { return services.layoutService.isVisible(part); }
        catch (error) { traceError(error); }
        return false;
      }
    };
  } catch (error) { traceError(error); }

});
