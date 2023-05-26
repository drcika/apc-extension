import * as vscode from 'vscode';

type ButtonConfig = {
  text: string;
  tooltip?: string;
  vscommand?: string;
  command?: string;
  priority?: number;
  alignment?: vscode.StatusBarAlignment; // ??
};

let subscriptions: any[] = [];

function processScm(context: vscode.ExtensionContext, statusBarButton: vscode.StatusBarItem) {
  if (vscode.extensions) {
    const git = vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1);

    function updateStatusBar() {
      let totalChanges = 0;
      git?.repositories.forEach((repository: any) => {
        totalChanges += repository.state.workingTreeChanges.length;
      });
      statusBarButton.text = `$(source-control) ${totalChanges}`;
      statusBarButton.show();
    }

    git?.repositories.forEach((repository: any) => {
      const subs = repository.state.onDidChange(updateStatusBar);
      subscriptions.push(subs);
      context.subscriptions.push(subs);
    });
  }
}

function createTerminalCommand(command: string) {
  return async () => {
    const terminal = vscode.window.createTerminal();
    terminal.sendText(command);
    terminal.show();
  };
}

function addButton(context: vscode.ExtensionContext, button: ButtonConfig) {
  const statusBarButton = vscode.window.createStatusBarItem(button.alignment, button.priority);
  if (button.command) {
    const commandName = `apc.${button.command.replace(/\s/g, '.')}`;
    subscriptions.push(vscode.commands.registerCommand(commandName, createTerminalCommand(button.command)));
    statusBarButton.command = commandName;
  } else {
    statusBarButton.command = button.vscommand;
  }
  statusBarButton.text = button.text;
  statusBarButton.tooltip = button.tooltip;
  statusBarButton.show();

  if (button.vscommand === 'workbench.view.scm') {
    processScm(context, statusBarButton);
  }
  return statusBarButton;
}

let buttons: Array<vscode.StatusBarItem> | undefined = undefined;

export function applyButtons(context: vscode.ExtensionContext) {
  if (buttons) { buttons.forEach(button => button.dispose()); }
  subscriptions.forEach(subs => subs.dispose());
  subscriptions = [];

  const config = vscode.workspace.getConfiguration('apc').get<Array<ButtonConfig>>('buttons');
  buttons = config?.map(button => addButton(context, button));
}
