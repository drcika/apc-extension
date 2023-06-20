define(['vs/platform/windows/electron-main/windowImpl', 'electron', 'apc-main/utils'], (windowImpl, electron, utils) => {
  function findeCodeWindow() {
    for (const key in windowImpl) { if (windowImpl[key] instanceof Function) { return key; } }
  }
  const codeWindowKey = 'CodeWindow' in windowImpl ? 'CodeWindow' : findeCodeWindow();

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
          }

          for (const key in config) {
            Object.defineProperty(Object.prototype, key, {
              get() { return config[key]; },
              set() { },
              configurable: true
            });
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
