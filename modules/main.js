function addStyleSheet(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.querySelector('head')?.appendChild(link);
};

function apc(module, r, insantiationService, patch) {
  try {
    const url = r.toUrl(module.id) + '.css';
    addStyleSheet(!url.startsWith('file://') && !url.startsWith('vscode-file://') ? 'file://' + url : url);

    class InstantiationService extends insantiationService.InstantiationService {
      constructor() {
        super(...arguments);
        try {
          patch.run(this);
        } catch (error) {
          console.error(e);
        }
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
  'apc/patch',
], apc);
