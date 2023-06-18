define(['exports'], function (exports) {

  const store = new Proxy({}, {
    get() { return Reflect.get(...arguments); },
    set() { return Reflect.set(...arguments); }
  });
  exports.store = store;

  store.isMacintosh = navigator.userAgent.includes('Macintosh');
  store.DUMMY_ACTIVITYBAR_PART = 'workbench.parts.dummyActivitybar';
  store.DUMMY_STATUSBAR_PART = 'workbench.parts.dummyStatusbar';

  const part = require('vs/workbench/browser/part');

  exports.Part = class Part extends part.Part {
    constructor(id) { super(...arguments); this.id = id; }
    minimumWidth = 0; maximumWidth = 0; minimumHeight = 0; maximumHeight = 0;
    element = document.createElement('div');
    toJSON() { return { type: this.id }; }
  };

  exports.storeReference = function (references) {
    for (const key in references) {
      if (!store[key]) { store[key] = references[key]; }
    }
  };

  exports.traceError = function (error) {
    console.trace(error);
  };

  function getProperty(obj, key) {
    return Object.getOwnPropertyDescriptor(obj, key) || (obj.__proto__ ? getProperty(obj.__proto__, key) : undefined);
  }

  exports.getProperty = getProperty;

  exports.findInPrototype = function (obj, original, property) {
    for (const key in obj) { if (obj[key] instanceof Function && property in obj[key].prototype) { return [key, obj[key]]; } }
    return [];
  };

  exports.findOwnPrototype = function (obj, original, property) {
    if (obj[original]) { return [original, obj[original]]; }
    for (const key in obj) { if (obj[key] instanceof Function && obj[key].hasOwnProperty(property)) { return [key, obj[key]]; } }
    return [];
  };

});
