import * as vscode from 'vscode';
import * as fs from 'fs';

const configKey = 'update.mode';
export async function promptRestart() {
  const config = vscode.workspace.getConfiguration();
  const value = config.inspect(configKey);
  await config.update(configKey, config.get(configKey) === 'default' ? 'manual' : 'default', vscode.ConfigurationTarget.Global);
  config.update(configKey, value?.globalValue, vscode.ConfigurationTarget.Global);
}

export function getConfiguration<T>(configuration: string) {
  const config = vscode.workspace.getConfiguration();
  return config.get<T>(configuration);
}

export function getStyleFromFile(file: string) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    return '';
  }
}

function generateStyleFomObject(obj: Record<string, string>, styles = '') {
  for (const property in obj) {
    const value = obj[property];
    if (['number', 'string'].includes(typeof value)) { styles += `${property}: ${value}; `; }
  }
  return styles;
}

export function getStyles(styleSheet: Record<string, string>, style = '') {
  for (const selector in styleSheet) {
    const value = styleSheet[selector];
    const styles = typeof value === 'string' ? value : typeof value === 'object' ? generateStyleFomObject(value) : '';
    style += `${selector} { ${styles} }\n\t\t\t`;
  }
  return style;
}
