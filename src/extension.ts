import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("handy-graphic.run", () => {
    const config = vscode.workspace.getConfiguration("handy-graphic");

    const dir = path.dirname(
      vscode.window.activeTextEditor?.document.fileName || ""
    );
    const filePath = vscode.window.activeTextEditor?.document.fileName || "";
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);
    const outFileName = path.basename(filePath, ext);

    // kill the app/HgDisplayer
    const killerTerminal =
      vscode.window.terminals.find((t) => t.name === "HandyGraphic Killer") ||
      vscode.window.createTerminal("HandyGraphic Killer");
    killerTerminal.sendText("killall HgDisplayer");

    // run the HgDisplayer
    const displayerTerminal =
      vscode.window.terminals.find(
        (t) => t.name === "HandyGraphic Displayer"
      ) || vscode.window.createTerminal("HandyGraphic Displayer");
    displayerTerminal.sendText(
      `/Applications/HgDisplayer.app/Contents/MacOS/HgDisplayer`
    );

    // compile and run the app
    const terminal =
      vscode.window.terminals.find((t) => t.name === "HandyGraphic") ||
      vscode.window.createTerminal("HandyGraphic");
    terminal.sendText(
      `cd "${dir}" && hgcc -Wall -o "${outFileName}" "./${fileName}" && "./${outFileName}"`
    );

    if (config.get("showTerminal")) {
      terminal.show();
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
