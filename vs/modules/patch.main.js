define(['vs/platform/windows/electron-main/windowImpl', 'vs/platform/windows/electron-main/windows', 'electron', 'vs/modules/utils'], (windowImpl, windows, electron, utils) => {
  function findeCodeWindow() {
    for (const key in windowImpl) { if (windowImpl[key] instanceof Function && windowImpl[key].toString().startsWith('class extends')) { return key; } }
  }
  const codeWindowKey = 'CodeWindow' in windowImpl ? 'CodeWindow' : findeCodeWindow();

  function findDefaultBrowserWindowOptions() {
    for (const key in windows) { if (windows[key] instanceof Function && windows[key].toString?.() !== 'windowsMainService') { return key; } }
  }

  const defaultBrowserWindowOptionsKey = 'defaultBrowserWindowOptions' in windows ? 'defaultBrowserWindowOptions' : findDefaultBrowserWindowOptions();

  if (codeWindowKey) {
    windowImpl[codeWindowKey] = class CodeWindow extends windowImpl[codeWindowKey] {
      constructor(
        appConfig,
        logService,
        loggerMainService,
        environmentMainService,
        policyService,
        userDataProfilesService,
        fileService,
        applicationStorageMainService,
        storageMainService,
        configurationService,
        themeMainService,
        workspacesManagementMainService,
        backupMainService,
        telemetryService,
        dialogMainService,
        lifecycleMainService,
        productService,
        protocolMainService,
        windowsMainService,
        stateService) {
        try {
          const config = (configurationService.getValue && configurationService.getValue('apc.electron')) || {};
          const originalGetBackgroundColor = themeMainService?.getBackgroundColor?.bind(themeMainService);
          if (originalGetBackgroundColor) {
            themeMainService.getBackgroundColor = () => config.backgroundColor ?? originalGetBackgroundColor();
            utils.override(electron.BrowserWindow, "setBackgroundColor", function (original, [color]) { });
            utils.override(electron.BrowserWindow, "setTrafficLightPosition", function () { });
          }

          if (defaultBrowserWindowOptionsKey) {
            const originalDefaultBrowserWindowOptions = windows[defaultBrowserWindowOptionsKey];
            windows[defaultBrowserWindowOptionsKey] = (...args) => {
              return { ...originalDefaultBrowserWindowOptions(...args), ...config };
            };
          }
          else {
            for (const key in config) {
              Object.defineProperty(Object.prototype, key, {
                get() { return config[key]; },
                set() { },
                configurable: true
              });
            }
          }
          super(...arguments);
          for (const key in config) { delete Object.prototype[key]; }
        } catch (error) {
          console.log('***************');
          console.log('***************');
          console.log('***************');
          console.log(error);
          console.log('***************');
          console.log('***************');
          console.log('***************');
          super(...arguments);
        }
      }
    };
  }
  else {
    console.log('***************');
    console.log('***************');
    console.log('***************');
    console.log('not found windowImpl.CodeWindow');
    console.log('***************');
    console.log('***************');
    console.log('***************');
  }
});
