define(['exports'], function (exports) {

  const store = new Proxy({}, {
    get() { return Reflect.get(...arguments); },
    set() { return Reflect.set(...arguments); }
  });

  const services = new Proxy({}, {
    get() { return Reflect.get(...arguments); },
    set() { return Reflect.set(...arguments); }
  });

  exports.store = store;
  exports.services = services;

  store.isMacintosh = navigator.userAgent.includes('Macintosh');
  store.DUMMY_ACTIVITYBAR_PART = 'workbench.parts.dummyActivitybar';
  store.DUMMY_STATUSBAR_PART = 'workbench.parts.dummyStatusbar';

  const part = require('vs/workbench/browser/part');
  const [partKey, PartClass] = findInPrototype(part, 'Part', 'layout'); // the only one type class

  exports.Part = class Part extends PartClass {
    constructor(id) { super(...arguments); this.id = id; }
    minimumWidth = 0; maximumWidth = 0; minimumHeight = 0; maximumHeight = 0;
    element = document.createElement('div');
    toJSON() { return { type: this.id }; }
  };

  exports.traceError = function (error) {
    console.trace(error);
  };

  function getProperty(obj, key) {
    return Object.getOwnPropertyDescriptor(obj, key) || (obj.__proto__ ? getProperty(obj.__proto__, key) : undefined);
  }

  exports.getProperty = getProperty;

  
  function findInPrototype (obj, original, property) {
    if (obj[original]) { return [original, obj[original]]; }
    for (const key in obj) { if (obj[key] instanceof Function && property in obj[key].prototype) { return [key, obj[key]]; } }
    return [];
  };
  exports.findInPrototype = findInPrototype;

  exports.findOwnProperty = function (obj, original, property) {
    if (obj[original]) { return [original, obj[original]]; }
    for (const key in obj) { if (obj[key] instanceof Function && obj[key].hasOwnProperty(property)) { return [key, obj[key]]; } }
    return [];
  };

  exports.findPropertyByValue = function (obj, value) {
    for (const key in obj) {
      if (obj[key] === value) {
        return key;
      }
    }
  };
  exports.findVariable = function (obj, original, _typeof) {
    if (obj[original]) { return [original, obj[original]]; }
    for (const key in obj) { if (typeof obj[key] === _typeof) { return [key, obj[key]]; } }
  };
});
