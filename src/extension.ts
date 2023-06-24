import * as vscode from 'vscode';

import { applyButtons } from './buttons/button';
import * as customizations from './customizations.json';
import { ensurePatch, uninstallPatch, install } from './patch';
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

  if (isRunned) { isEnabled && ensurePatch(context); }
  else {
    context.globalState.update('isRunned', true);
    install(context);
  }

  registerCommands(context);

  async function onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent) {
    e.affectsConfiguration('apc.theme') && isEnabled && changeTheme(context);
    e.affectsConfiguration('apc.buttons') && isEnabled && applyButtons(context);

    if (e.affectsConfiguration('apc.electron')) {
      const newState: any = vscode.workspace.getConfiguration().get('apc.electron') || {};

      if (newState.frame === false || newState.titleBarStyle) {
        if (vscode.workspace.getConfiguration().get('window.titleBarStyle') !== 'native') {
          const res = await vscode.window.showWarningMessage("Inline title bar requires titleBarStyle = 'native'.", 'Enable');
          await vscode.workspace.getConfiguration().update('window.titleBarStyle', 'native', vscode.ConfigurationTarget.Global);
          if (res === 'Enable') {
            await vscode.workspace.getConfiguration().update('window.titleBarStyle', 'native', vscode.ConfigurationTarget.Global);
            return;
          }
        }
      }

      return promptRestart();
    }

    e.affectsConfiguration('apc.menubar.compact') && isEnabled && promptRestart(); // reload
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
