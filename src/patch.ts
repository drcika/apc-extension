import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promptRestart } from './utils';

const bkpName = '.apc.extension.backup';
const bootstrapName = 'bootstrap-amd.js';
const installationPath = path.dirname(require.main!.filename);
const bootstrapPath = path.join(installationPath, bootstrapName);
const bootstrapBackupPath = bootstrapPath + bkpName;
const modules = 'modules';
const mainJsName = 'main.js';
const mainProcessJsName = 'process.main.js';
const mainJsPath = path.join(installationPath, mainJsName);
const mainJsBackupPath = mainJsPath + bkpName;
const workbenchHtmlName = 'workbench.html';
const workbenchHtmldir = path.join(installationPath, 'vs/code/electron-sandbox/workbench');
const workbenchHtmlPath = path.join(workbenchHtmldir, workbenchHtmlName);
const workbenchHtmlReplacementPath = workbenchHtmlPath.replace(workbenchHtmlName, "workbench-apc-extension.html");
const patchPath = path.join(installationPath, modules);
const isWin = os.platform() === 'win32';
const browserMain = 'browser.main.js';

function fixPath(path: string) {
  return isWin ? "file://./" + path.replace(/\\/g, "/") : path;
}

const fixedPatchPath = fixPath(patchPath);

export async function ensurePatch(context: vscode.ExtensionContext) {
  const browserEntrypointPath = path.join(patchPath, browserMain);
  const generatedScriptsPathRelative = path.join(path.relative(installationPath, context.extensionPath), modules).replace(/\\/g, '/');
  
  if (
    !fs.existsSync(bootstrapBackupPath) ||
    !fs.existsSync(workbenchHtmlReplacementPath) ||
    !fs.readFileSync(bootstrapPath, "utf8")?.includes('$apcExtensionBootstrapToken$') || 
    !fs.existsSync(browserEntrypointPath) ||
    !fs.readFileSync(browserEntrypointPath, "utf8")?.includes(generatedScriptsPathRelative)
  ) {
    await install(context);
  }
}

function patchBootstrap(extensionPath: string) {
  if (!fs.existsSync(bootstrapBackupPath)) {
    // bkp bootstrap-amd.js
    fs.renameSync(bootstrapPath, bootstrapBackupPath);
  }

  // patch bootstrap-amd.js
  const bootstrapResourcesPath = path.join(extensionPath, "resources", bootstrapName);
  const inject = `
  if (entrypoint === "vs/code/electron-main/main") {
    const fs = nodeRequire('fs');
    const p = nodeRequire('path');
    const readFile = fs.readFile;
    fs.readFile = function (path, options, callback) {
      if (path.endsWith(p.join('electron-main', 'main.js'))) {
        readFile(path, options, function () {
          loader(["apc/main"], console.log, console.log);
          callback.apply(this, arguments);
        });
      }
      else readFile(...arguments);
    };
  }
  performance.mark('code/fork/willLoadCode');
  // $apcExtensionBootstrapToken$`;
  const patchedbootstrapJs = fs.readFileSync(bootstrapResourcesPath, 'utf8')
    .replace('amdModulesPattern: \/^vs\\\/\/', `paths: { "apc": "${fixedPatchPath}" }`)
    .replace(`performance.mark('code/fork/willLoadCode');`, inject);

  fs.writeFile(bootstrapPath, patchedbootstrapJs, 'utf8', () => { });
}

function restoreBootstrap() {
  // restore bootstrap-amd.js
  fs.renameSync(bootstrapBackupPath, bootstrapPath);
  // remove bkp bootstrap-amd.js
  fs.rm(bootstrapBackupPath, () => { });
}

function patchMain(extensionPath: string) {
  const generatedPath = fixPath(path.join(extensionPath, modules));

  const proccesMainPath = path.join(extensionPath, "resources", mainProcessJsName);
  const processEntrypointPath = path.join(patchPath, mainJsName);
  const processMainSourcePath = path.join(patchPath, mainProcessJsName);

  const moduleName = 'apc-main';
  const patchModule = 'apc-patch';

  const files = `["${patchModule}/process.main", "${moduleName}/patch.main", "${moduleName}/utils"]`;
  const data = `require.config({\n\tpaths: {\n\t\t"${moduleName}": "${generatedPath}",\n\t\t"${patchModule}": "${fixedPatchPath}"\n\t}\n});\ndefine(${files}, () => { });`;

  const patchedMainJs = fs.readFileSync(mainJsPath, 'utf8').replace('require_bootstrap_amd()', 'require("./bootstrap-amd")');

  // bkp main.js
  if (!fs.existsSync(mainJsBackupPath)) { fs.renameSync(mainJsPath, mainJsBackupPath); }
  // patch main.js
  fs.writeFileSync(mainJsPath, patchedMainJs, 'utf8');

  if (!fs.existsSync(patchPath)) { fs.mkdirSync(patchPath); }
  // patch proccess.main.js
  fs.writeFileSync(processMainSourcePath, fs.readFileSync(proccesMainPath));
  // patched modules/main.js
  fs.writeFileSync(processEntrypointPath, data, "utf8");
}

function restoreMain() {
  // restore main.js
  fs.renameSync(mainJsBackupPath, mainJsPath);
  // remove bkp file
  fs.rm(mainJsBackupPath, () => { });
  // remove pached modules
  fs.rmSync(patchPath, { recursive: true, force: true });
}

function patchWorkbench(extensionPath: string) {
  const workbenchHtmldirRelative = path.relative(workbenchHtmldir, patchPath).replace(/\\/g, '/');
  const browserEntrypointPathRelative = path.join(workbenchHtmldirRelative, browserMain).replace(/\\/g, '/');

  const patchedWorkbenchHtml = fs.readFileSync(workbenchHtmlPath, 'utf8')
    .replace('<script src="workbench.js"></script>', `<script src="${browserEntrypointPathRelative}"></script>\n\t<script src="workbench.js"></script>`);
  fs.writeFileSync(workbenchHtmlReplacementPath, patchedWorkbenchHtml, 'utf8');

  const generatedScriptsPathRelative = path.join(path.relative(installationPath, extensionPath), modules).replace(/\\/g, '/');
  const browserEntrypointPath = path.join(patchPath, browserMain);

  const data = `\
  'use strict';
  function _apcPatch(bootstrapWindow) {
    const _prev = bootstrapWindow.load;
    function bootstrapWindowLoad(modulePaths, resultCallback, options) {
      const prevBeforeLoaderConfig = options.beforeLoaderConfig;
      function beforeLoaderConfig(configuration, loaderConfig) {
        if (!loaderConfig) loaderConfig = configuration;
        if (typeof prevBeforeLoaderConfig === 'function') prevBeforeLoaderConfig(configuration, loaderConfig);
        if (loaderConfig.amdModulesPattern) loaderConfig.amdModulesPattern = new RegExp(loaderConfig.amdModulesPattern.toString().slice(1, -1) + /|^apc\\//.toString().slice(1, -1));
        Object.assign(loaderConfig.paths, {
          "apc": "${generatedScriptsPathRelative}",
        });
        require.define("apc-patch", { load: (name, req, onload, config) => req([name], (value) => req(["apc/main"], () => onload(value), error => (console.error(error), onload(value)))) });
      };
      options.beforeLoaderConfig = beforeLoaderConfig;
  
      if ('vs/workbench/workbench.desktop.main' === modulePaths[0]) modulePaths[0] = 'apc-patch!' + modulePaths[0];
      return _prev(modulePaths, resultCallback, options);
    };
  
    bootstrapWindow.load = bootstrapWindowLoad;
  }
  
  if (window.MonacoBootstrapWindow) _apcPatch(window.MonacoBootstrapWindow);
  else {
    Object.defineProperty(
      window,
      "MonacoBootstrapWindow",
      {
        set: function (value) { _apcPatch(value); window._patchMonacoBootstrapWindow = value; },
        get: function () { return window._patchMonacoBootstrapWindow; }
      }
    );
  }`;

  fs.writeFileSync(browserEntrypointPath, data, "utf8");
}

function restoreWorkbench() {
  fs.rm(workbenchHtmlReplacementPath, () => { });
}

export async function install(context: vscode.ExtensionContext) {
  try {
    const extensionPath = context.extensionPath;
    patchBootstrap(extensionPath);
    patchMain(extensionPath);
    patchWorkbench(extensionPath);
    promptRestart();
  } catch (e) {
    vscode.window.showErrorMessage(`Apc Extension failed: ${e}`);
  }
}

export function uninstallPatch() {
  restoreBootstrap();
  restoreMain();
  restoreWorkbench();
  promptRestart();
}
