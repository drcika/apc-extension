import * as vscode from 'vscode';

import { applyButtons } from './buttons/button';
import * as customizations from './customizations.json';
import { ensurePatch, uninstallPatch, install, appendIframeStyles } from './patch';
import { promptRestart } from './utils';

function changeTheme(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration();
  const apcTheme = config.get<Array<{ color: string; tokens: string[]; }>>('apc.theme');
  const colorCustomizations = config.get<any>('workbench.colorCustomizations');
  const customeTheme = apcTheme || customizations.theme;
  customeTheme.forEach(({ color, tokens }) => {
    tokens.forEach(token => {
      colorCustomizations[token] = color;
    });
  });
  config.update('workbench.colorCustomizations', colorCustomizations, true);
}

function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('apc.extension.enable', () => {
    install(context);
    context.globalState.update('isEnabled', true);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('apc.extension.disable', () => {
    uninstallPatch();
    context.globalState.update('isEnabled', false);
  }));

}


export function activate(context: vscode.ExtensionContext) {
  const isRunned = context.globalState.get('isRunned');
  const isEnabled = context.globalState.get('isEnabled');

  isEnabled && appendIframeStyles();
  if (isRunned) { isEnabled && ensurePatch(context); }
  else {
    context.globalState.update('isRunned', true);
    install(context);
  }

  registerCommands(context);

  async function onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent) {
    if (!isEnabled) { return; };
    e.affectsConfiguration('apc.theme') && changeTheme(context);
    e.affectsConfiguration('apc.buttons') && applyButtons(context);
    e.affectsConfiguration('apc.iframe.style') && appendIframeStyles();
    (e.affectsConfiguration('apc.electron') || e.affectsConfiguration('apc.menubar.compact')) && promptRestart();
  }
  function onDidChangeWorkspaceFolders(e: vscode.WorkspaceFoldersChangeEvent) {
    applyButtons(context);
  }

  applyButtons(context);

  isEnabled && context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(onDidChangeWorkspaceFolders));
  isEnabled && context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration));
}

export function deactivate() {
  // uninstallPatch();
}
