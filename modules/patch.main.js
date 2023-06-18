define(['vs/platform/windows/electron-main/windowImpl', 'vs/platform/theme/electron-main/themeMainService', 'electron', 'apc-main/utils'], (windowImpl, themeMainService, electron, utils) => {
  function findeCodeWindow() {
    for (const key in windowImpl) { if (windowImpl[key] instanceof Function) { return key; } }
  }
  const codeWindowKey = 'CodeWindow' in windowImpl ? 'CodeWindow' : findeCodeWindow();

  if (codeWindowKey) {
    windowImpl[codeWindowKey] = class CodeWindow extends windowImpl[codeWindowKey] {
      constructor(logService, loggerMainService, environmentMainService, policyService, userDataProfilesService, fileService, applicationStorageMainService, storageMainService,
        configurationService, themeMainService, workspacesManagementMainService, backupMainService, telemetryService, dialogMainService, lifecycleMainService, productService,
        protocolMainService, windowsMainService, stateService) {
        const config = configurationService.getValue('apc.electron');
        themeMainService.getBackgroundColor = () => config.backgroundColor ?? 'rgba(0, 0, 0, 0)';

        for (const key in config) {
          Object.defineProperty(Object.prototype, key, {
            get() { return config[key]; },
            set() { },
            configurable: true
          });
        }
        super(...arguments);
        // this.win.setBackgroundColor(config.backgroundColor ?? 'rgba(0, 0, 0, 0)');
        // this.win.setTitleBarOverlay(options)
        // this.win.setVibrancy('ultra-dark');
        // this.win.setOpacity(0.5);
        utils.override(electron.BrowserWindow, "setBackgroundColor", function (original, args) { });
        for (const key in config) { delete Object.prototype[key]; }

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
