define(['exports', 'apc/auxiliary', 'apc/configuration'], (exports, auxiliary, configuration) => {
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
      const listRowConfig = config.listRow;
      const headerConfig = config.header;
      const activityBarConfig = config.activityBar;
      const statusBarConfig = config.statusBar;
      const trafficLightPosition = config.electron.trafficLightPosition;
      const sidebarTitlebarConfig = config.titlebar;

      document.body.classList[statusBarConfig.position === 'top' ? 'add' : 'remove']('statusbar-top');
      document.body.classList[statusBarConfig.position === 'editor-top' ? 'add' : 'remove']('statusbar-editor-top');
      document.body.classList[activityBarConfig.position ? 'add' : 'remove']('horizontal-activitybar');
      document.body.classList[activityBarConfig.position === 'bottom' ? 'add' : 'remove']('activitybar-bottom');
      document.body.classList[activityBarConfig.position === 'top' ? 'add' : 'remove']('activitybar-top');
      document.body.classList[activityBarConfig.isEnabled ? 'add' : 'remove']('custom-activitybar');
      document.body.classList[headerConfig.isEnabled ? 'add' : 'remove']('custom-header');
      document.body.classList[sidebarTitlebarConfig.isEnabled ? 'add' : 'remove']('custom-sidebar-titlebar');
      document.body.classList[listRowConfig.isEnabled ? 'add' : 'remove']('custom-list-row');
      document.body.classList[statusBarConfig.isEnabled ? 'add' : 'remove']('custom-statusbar');

      if (!store.rootTextNode) {
        store.rootTextNode = appendStyleElement();
      }

      store.rootTextNode.textContent = `:root {
        --row-height: ${listRowConfig.height}px; 
        --row-font-size: ${listRowConfig.fontSize}px;
        --header-height: ${headerConfig.height}px;
        --header-font-size: ${headerConfig.fontSize}px;
        --titlebar-height: ${sidebarTitlebarConfig.height}px;
        --titlebar-font-size: ${sidebarTitlebarConfig.fontSize}px;
        --activity-bar-action-size: ${activityBarConfig.size}px;
        --status-bar-font-size: ${statusBarConfig.fontSize}px;
        --traffic-X: ${trafficLightPosition.x}px;
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
      const isFilesChanged = [event.rawUpdated, event.rawAdded, event.rawDeleted].some(changes => changes.some(config => store.watchedFiles.has(config.path)));
      if (isFilesChanged) { appendFiles(); }
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

        if (store.externalLinks) {
          store.externalLinks.forEach(el => document.head.removeChild(el));
          store.externalLinks.clear();
        }
        else { store.externalLinks = new Map(); }

        if (!store.customFileImports) { store.customFileImports = appendStyleElement(); }

        if (!store.customScriptImports) {
          store.customScriptImports = document.createElement('script');
          store.customScriptImports.type = 'text/javascript';
          document.head.appendChild(store.customScriptImports);
        }

        store.customFileImports.textContent = '';
        store.customScriptImports.textContent = '';

        for await (const path of paths) {
          try {
            if (typeof path === 'object') {
              const element = 'href' in path ? createExternal('link', path) : 'src' in path && createExternal('script', path);
              if (element) {
                store.externalLinks.set(path, element);
                document.head.appendChild(element);
              }
            }
            else if (typeof path === 'string' && path.match(/(\.css|\.js)$/)) {
              const URI = uri.URI.parse(!path.startsWith('file://') ? 'file://' + path : path);
              const data = await services.fileService.readFile(URI);
              const isCss = path.endsWith('.css');

              if (isCss) {
                const disposable = services.fileService.watch(URI);
                config.disposables.add(disposable);
                store.watchedFiles.set(URI.path, disposable);
              }
              const source = isCss ? store.customFileImports : store.customScriptImports;
              source.textContent = data?.value?.toString ? `${data.value.toString()}\n` : '';
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

    exports.run = function () {
      try {
        if (store.isMacintosh && config.electron.titleBarStyle) { document.body.classList.add(`inline-title-bar`); }
        if (store.isMacintosh && config.electron.frame === false) { document.body.classList.add(`frameless-title-bar`); }

        updateClasses();
        appendFiles();
        appendStyles();

      } catch (error) { traceError(error); }
    };
  } catch (error) { traceError(error); }

});
