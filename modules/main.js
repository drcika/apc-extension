function apc(module, require, insantiationService, utils, patch) {
  try {
    let url = require.toUrl(module.id) + '.css';
    if (!url.startsWith('file://') && !url.startsWith('vscode-file://')) {
      url = 'file://' + url;
    }
    utils.addStyleSheet(url);

    class InstantiationService extends insantiationService.InstantiationService {
      constructor() {
        super(...arguments);
        const service = this;
        const run = function (what) {
          try {
            what.run(service);
          } catch (e) {
            console.error(e);
          }
        };

        run(patch);
      }
    }

    insantiationService.InstantiationService = InstantiationService;
  } catch (e) {
    console.error("Couldn't initialize apc", e);
  }
}

define([
  'module',
  'require',
  'vs/platform/instantiation/common/instantiationService',
  'apc/utils',
  'apc/patch',
], apc);
