define([], function () {
  require(['vs/base/common/network'], function (network) {
    const orig = network.FileAccess.asBrowserUri;
    network.FileAccess.asBrowserUri = function (resourcePath) {
      return orig.apply(this, [resourcePath.replace('workbench.html', 'workbench-apc-extension.html')]);
    };
  }, function () { });
});
