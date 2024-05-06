define(['exports', 'vs/modules/auxiliary', 'vs/modules/configuration'], (exports, auxiliary, configuration) => {
  const { traceError, store, services } = auxiliary;
  const { config } = configuration;

  try {
    const uri = require('vs/base/common/uri');

    function appendStyleElement() {
      const style = document.createElement('style');
      style.rel = 'stylesheet';
      const styleTextNode = document.createTextNode('');
      style.appendChild(styleTextNode);
      document.head.appendChild(style);
      return styleTextNode;
    }
    exports.appendStyleElement = appendStyleElement;

    function createDiv(classList) {
      const div = document.createElement('div');
      div.classList.add(classList);
      return div;
    }
    exports.createDiv = createDiv;

    function prependDiv(parent, classList = '') {
      const div = createDiv(classList);
      try { parent.prepend(div); }
      catch (error) { traceError(error); }
      return div;
    }
    exports.prependDiv = prependDiv;

    function appendDiv(parent, classList = '') {
      const div = createDiv(classList);
      try { parent.appendChild(div); }
      catch (error) { traceError(error); }
      return div;
    }
    exports.appendDiv = appendDiv;

    function updateClasses() {
      const headerConfig = config.header;
      const activityBarConfig = config.activityBar;
      const statusBarConfig = config.statusBar;
      const trafficLightPosition = config.electron.trafficLightPosition;
      const sidebarTitlebarConfig = config.titlebar;
      const { customFontFamily, customMonospaceFontFamily, ...fontFamilyParts } = config.fontFamily;
      const customTitleBarVisibility = config.titleBarStyle === 'native' && services.configurationService.getValue('window.customTitleBarVisibility');

      const classList = document.body.classList;
      classList[customTitleBarVisibility === 'never' ? 'add' : 'remove']('no-custom-title-bar-visibility');
      classList[statusBarConfig.position === 'top' ? 'add' : 'remove']('statusbar-top');
      classList[statusBarConfig.position === 'editor-top' ? 'add' : 'remove']('statusbar-editor-top');
      classList[activityBarConfig.position ? 'add' : 'remove']('horizontal-activitybar');
      classList[activityBarConfig.isEnabled ? 'add' : 'remove']('custom-activitybar');
      classList[headerConfig.isEnabled ? 'add' : 'remove']('custom-header');
      classList[sidebarTitlebarConfig.isEnabled ? 'add' : 'remove']('custom-sidebar-titlebar');
      classList[statusBarConfig.isEnabled ? 'add' : 'remove']('custom-statusbar');
      // 
      classList[customFontFamily ? 'add' : 'remove']('custom-font-family');
      classList[customMonospaceFontFamily ? 'add' : 'remove']('custom-monospace-font');
      classList[fontFamilyParts.statusbar ? 'add' : 'remove']('custom-font-family-statusbar');
      classList[fontFamilyParts.panel ? 'add' : 'remove']('custom-font-family-panel');
      classList[fontFamilyParts['extension-editor'] ? 'add' : 'remove']('custom-font-family-extension-editor');
      classList[fontFamilyParts['settings-body'] ? 'add' : 'remove']('custom-font-family-settings-body');
      classList[fontFamilyParts.auxiliarybar ? 'add' : 'remove']('custom-font-family-auxiliarybar');
      classList[fontFamilyParts.tabs ? 'add' : 'remove']('custom-font-family-tabs');
      classList[fontFamilyParts.sidebar ? 'add' : 'remove']('custom-font-family-sidebar');
      classList[fontFamilyParts.titlebar ? 'add' : 'remove']('custom-font-family-titlebar');
      classList[fontFamilyParts.banner ? 'add' : 'remove']('custom-font-family-banner');
      classList[fontFamilyParts['monaco-menu'] ? 'add' : 'remove']('custom-font-family-monaco-menu');

      if (!store.rootTextNode) {
        store.rootTextNode = appendStyleElement();
      }

      store.rootTextNode.textContent = `:root {
        --header-font-size: ${headerConfig.fontSize}px;
        --titlebar-height: ${sidebarTitlebarConfig.height}px;
        --titlebar-font-size: ${sidebarTitlebarConfig.fontSize}px;
        --activity-bar-action-size: ${activityBarConfig.size}px;
        --activity-bar-action-item-size: ${activityBarConfig.itemSize}px;
        --activity-bar-action-item-margin: ${activityBarConfig.itemMargin}px;
        --status-bar-font-size: ${statusBarConfig.fontSize}px;
        --traffic-X: ${trafficLightPosition.x}px;
        --custom-font-family: ${customFontFamily};
        --custom-monospace-font: ${customMonospaceFontFamily};
        --custom-font-family-statusbar: ${fontFamilyParts.statusbar};
        --custom-font-family-panel: ${fontFamilyParts.panel};
        --custom-font-family-extension-editor: ${fontFamilyParts['extension-editor']};
        --custom-font-family-settings-body: ${fontFamilyParts['settings-body']};
        --custom-font-family-auxiliarybar: ${fontFamilyParts.auxiliarybar};
        --custom-font-family-tabs: ${fontFamilyParts.tabs};
        --custom-font-family-sidebar: ${fontFamilyParts.sidebar};
        --custom-font-family-titlebar: ${fontFamilyParts.titlebar};
        --custom-font-family-banner: ${fontFamilyParts.banner};
        --custom-font-family-monaco-menu: ${fontFamilyParts['monaco-menu']};
        `;
    };
    exports.updateClasses = updateClasses;

    function generateStyleFomObject(obj, styles = '') {
      for (const property in obj) {
        const value = obj[property];
        if (['number', 'string'].includes(typeof value)) {
          styles += `${property}: ${value};\n`;
        }
      }
      return styles;
    }
    exports.generateStyleFomObject = generateStyleFomObject;

    function appendStyles() {
      if (!store.customStyleTextNode) { store.customStyleTextNode = appendStyleElement(); }

      const styleSheet = config.getConfiguration('apc.stylesheet');

      if (styleSheet instanceof Object) {
        store.customStyleTextNode.textContent = '';

        for (const selector in styleSheet) {
          const value = styleSheet[selector];
          const styles = typeof value === 'string' ? value : typeof value === 'object' ? generateStyleFomObject(value) : '';
          store.customStyleTextNode.textContent += `${selector} { ${styles} }\n`;
        }
      }
    }
    exports.appendStyles = appendStyles;

    function createExternal(type, config) {
      const element = document.createElement(type);
      for (const key in config) { element[key] = config[key]; }
      return element;
    }
    exports.createExternal = createExternal;

    function onDidFilesChange(event) {
      store.watchedFiles.size && [event.rawUpdated, event.rawAdded, event.rawDeleted].some(changes => changes.some(config => store.watchedFiles.has(config.path))) && appendFiles();
    }

    async function appendFiles() {
      try {
        const imports = config.getConfiguration('apc.imports');
        const paths = (imports instanceof Array ? imports : []);

        if (store.watchedFiles) {
          store.watchedFiles.forEach(file => file.dispose());
          store.watchedFiles.clear();
        }
        else {
          store.watchedFiles = new Map();
          config.disposables.add(services.fileService.onDidFilesChange(onDidFilesChange));
        }

        if (!store.customFileImports) { store.customFileImports = appendStyleElement(); }

        if (store.customScriptImports) {
          store.customScriptImports.forEach(el => document.head.removeChild(el));
          store.customScriptImports.clear();
        }
        else { store.customScriptImports = new Set(); }

        store.customFileImports.textContent = '';

        for await (const path of paths) {
          try {
            if (typeof path === 'object') {
              const element = 'href' in path ? createExternal('link', path) : 'src' in path && createExternal('script', path);
              if (element) {
                store.customScriptImports.add(element);
                document.head.appendChild(element);
              }
            }
            else if (typeof path === 'string' && path.match(/(\.js)$/)) {
              const substitutedPath = path.replace('${userHome}', services.environmentService.userHome.path);
              const URI = uri.URI.parse(!substitutedPath.startsWith('file://') ? 'file://' + substitutedPath : substitutedPath);
              const data = await services.fileService.readFile(URI);

              const script = document.createElement('script');
              script.type = 'text/javascript';
              document.head.appendChild(script);
              store.customScriptImports.add(script);

              script.textContent += (data?.value?.toString ? `${data.value.toString()}\n` : '');
            }
            else if (typeof path === 'string' && path.match(/(\.css)$/)) {
              const substitutedPath = path.replace('${userHome}', services.environmentService.userHome.path);
              const URI = uri.URI.parse(!substitutedPath.startsWith('file://') ? 'file://' + substitutedPath : substitutedPath);
              const data = await services.fileService.readFile(URI);
              const disposable = services.fileService.watch(URI);
              config.disposables.add(disposable);
              store.watchedFiles.set(URI.path, disposable);

              store.customFileImports.textContent += (data?.value?.toString ? `${data.value.toString()}\n` : '');
            }
          } catch (err) {
            traceError(err);
          }
        }

      } catch (err) {
        traceError(err);
      }

    }
    exports.appendFiles = appendFiles;

    // !! backward compatibility
    async function restore() {
      try {
        const appRoot = services.environmentService.appRoot;
        const IFrameIndexPath = uri.URI.parse('file://' + appRoot + '/out/vs/workbench/contrib/webview/browser/pre/index.html');
        const IFrameIndexPathBkpPath = uri.URI.parse('file://' + appRoot + '/out/vs/workbench/contrib/webview/browser/pre/index.apc.bkp.html');
        const backup = await services.fileService.exists(IFrameIndexPathBkpPath);
        if (backup) {
          services.fileService.copy(IFrameIndexPathBkpPath, IFrameIndexPath);
        }
      } catch (error) {
        traceError(error);
      }
    }

    exports.run = function () {
      try {
        if (config.electron.titleBarStyle) { document.body.classList.add(`inline-title-bar`); }
        if (config.electron.frame === false) { document.body.classList.add(`frameless-title-bar`); }

        updateClasses();
        appendFiles();
        appendStyles();
        restore();

      } catch (error) { traceError(error); }
    };
  } catch (error) { traceError(error); }

});
