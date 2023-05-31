import * as vscode from 'vscode';

export async function promptRestart() {
  const nativeTabs = vscode.workspace.getConfiguration().inspect("window.nativeTabs");
  if (nativeTabs !== undefined) {
    const value = vscode.workspace.getConfiguration().get("window.nativeTabs");
    await vscode.workspace.getConfiguration().update("window.nativeTabs", !value, vscode.ConfigurationTarget.Global);
    vscode.workspace.getConfiguration().update("window.nativeTabs", nativeTabs.globalValue, vscode.ConfigurationTarget.Global);
  }
}
