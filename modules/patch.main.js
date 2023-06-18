define(['vs/platform/windows/electron-main/windowImpl'], windowImpl => {
  function findeCodeWindow() {
    for (const key in windowImpl) { if (windowImpl[key] instanceof Function) { return key; } }
  }
  const codeWindowKey = 'CodeWindow' in windowImpl ? 'CodeWindow' : findeCodeWindow();

  if (codeWindowKey) {
    windowImpl[codeWindowKey] = class CodeWindow extends windowImpl[codeWindowKey] {
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
