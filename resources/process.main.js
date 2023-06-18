define([], function () {
  require(['vs/base/common/network'], function (network) {
    function getFileAccessProperty() {
      for (const key in network) {
        if (network[key] instanceof Object && 'asBrowserUri' in network[key]) {
          return key;
        }
      }
    }
    const fileAccessProperty = 'FileAccess' in network ? 'FileAccess' : getFileAccessProperty();

    const orig = network[fileAccessProperty]?.asBrowserUri;
    if (orig) {
      network[fileAccessProperty].asBrowserUri = function (resourcePath) {
        return orig.apply(this, [resourcePath.replace('workbench.html', 'workbench-apc-extension.html')]);
      };
    }
    else {
      console.log('***************');
      console.log('***************');
      console.log('***************');
      console.log('not found network.FileAccess.asBrowserUri');
      console.log('***************');
      console.log('***************');
      console.log('***************');
    }
  }, function () { });
});
