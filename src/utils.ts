import * as vscode from 'vscode';

const configKey = 'update.mode';
export async function promptRestart() {
  const config = vscode.workspace.getConfiguration();
  const value = config.inspect(configKey);
  await config.update(configKey, config.get(configKey) === 'default' ? 'manual' : 'default', vscode.ConfigurationTarget.Global);
  config.update(configKey, value?.globalValue, vscode.ConfigurationTarget.Global);
}
