define(['vs/platform/windows/electron-main/windowImpl'], windowImpl => windowImpl.CodeWindow = class CodeWindow extends windowImpl.CodeWindow {
  constructor() {
    const config = arguments[9].getValue('apc.electron');
    for (const key in config) {
      Object.defineProperty(Object.prototype, key, {
        get() { return config[key]; },
        set() { },
        configurable: true
      });
    }
    super(...arguments);
    for (const key in config) { delete Object.prototype[key]; }

  }
});
