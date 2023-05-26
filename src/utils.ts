import * as vscode from 'vscode';

export async function promptRestart() {
  const titleBarStyle = vscode.workspace.getConfiguration().inspect("window.titleBarStyle");
  if (titleBarStyle !== undefined) {
    const value = vscode.workspace.getConfiguration().get("window.titleBarStyle");
    await vscode.workspace.getConfiguration().update("window.titleBarStyle", value === "native" ? "custom" : "native", vscode.ConfigurationTarget.Global);
    vscode.workspace.getConfiguration().update("window.titleBarStyle", titleBarStyle.globalValue, vscode.ConfigurationTarget.Global);
  }
}
