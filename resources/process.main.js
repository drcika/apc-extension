function overrideApc(where, name, cb) {
  (function (original) {
    where.prototype[name] = function () {
      const _this = this;
      const args = arguments;
      return cb.apply(this, [() => original.apply(_this, args)].concat(a));
    };
  })(where.prototype[name]);
}

function overrideURLApc(win) {
  overrideApc(win.CodeWindow, 'doGetUrl', original => original().replace('workbench.html', 'workbench-apc-extension.html'));
}

function error() { }

define([], function () {
  require(['vs/code/electron-main/window'], overrideURLApc, error);
  require(['vs/base/common/network'], function (network) {
    const orig = network.FileAccess.asBrowserUri;
    network.FileAccess.asBrowserUri = function (resourcePath) {
      return orig.apply(this, [resourcePath.replace('workbench.html', 'workbench-apc-extension.html')]);
    };
  }, error);
});
