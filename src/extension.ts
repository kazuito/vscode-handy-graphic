import * as vscode from "vscode";
import * as path from "path";

const terminalNames = {
  main: "HandyGraphic",
  displayer: "HandyGraphic Displayer",
  killer: "HandyGraphic Killer",
} as const;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("handy-graphic.run", () => {
    const config = vscode.workspace.getConfiguration("handy-graphic");

    const fileAbsPath = vscode.window.activeTextEditor?.document.fileName || "";

    if (!fileAbsPath) {
      vscode.window.showErrorMessage(
        "アクティブなファイルが見つかりませんでした。"
      );
      return;
    }

    const dirAbsPath = path.dirname(fileAbsPath);
    const fileName = path.basename(fileAbsPath);
    const fileExt = path.extname(fileAbsPath);
    const outFileName = path.basename(fileAbsPath, fileExt);

    // kill the app/HgDisplayer
    const killerTerminal =
      vscode.window.terminals.find((t) => t.name === terminalNames.killer) ||
      vscode.window.createTerminal(terminalNames.killer);
    killerTerminal.sendText("killall HgDisplayer");

    // run the HgDisplayer
    const displayerTerminal =
      vscode.window.terminals.find((t) => t.name === terminalNames.displayer) ||
      vscode.window.createTerminal(terminalNames.displayer);
    displayerTerminal.sendText(
      `/Applications/HgDisplayer.app/Contents/MacOS/HgDisplayer`
    );

    // compile and run the app
    const mainTerminal =
      vscode.window.terminals.find((t) => t.name === terminalNames.main) ||
      vscode.window.createTerminal(terminalNames.main);
    mainTerminal.sendText(
      `cd "${dirAbsPath}" && hgcc -Wall -o "${outFileName}" "./${fileName}" && "./${outFileName}"`
    );

    if (config.get("showTerminal")) {
      mainTerminal.show();
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
