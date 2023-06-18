import * as vscode from "vscode";
import * as path from "path";
import { genOutFilePath } from "./utils";

const terminalNames = {
  main: "HandyGraphic",
  displayer: "HandyGraphic Displayer",
  killer: "HandyGraphic Killer",
} as const;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "handy-graphic.run",
    async () => {
      const config = vscode.workspace.getConfiguration("handy-graphic");

      const fileAbsPath = vscode.window.activeTextEditor?.document.fileName;

      if (!fileAbsPath) {
        vscode.window.showErrorMessage(
          "アクティブなファイルが見つかりませんでした。"
        );
        return;
      }

      const dirAbsPath = path.dirname(fileAbsPath);
      const fileName = path.basename(fileAbsPath);
      const fileExt = path.extname(fileAbsPath);
      const fileNameWithoutExt = path.basename(fileAbsPath, fileExt);

      const fileInfo: FileInfo = {
        fileName: fileName,
        fileNameWithoutExt: fileNameWithoutExt,
        fileExt: fileExt,
        fileAbsPath: fileAbsPath,
        dirAbsPath: dirAbsPath,
      };

      const hgPath = `/Applications/HgDisplayer.app/Contents/MacOS/HgDisplayer`;

      const command = genOutFilePath(config.get("command") || "", fileInfo);

      // Save all files before run
      if (config.get("saveAllFilesBeforeRun")) {
        await vscode.workspace.saveAll();
      }

      const killerTerminal =
        vscode.window.terminals.find((t) => t.name === terminalNames.killer) ||
        vscode.window.createTerminal(terminalNames.killer);

      const displayerTerminal =
        vscode.window.terminals.find(
          (t) => t.name === terminalNames.displayer
        ) || vscode.window.createTerminal(terminalNames.displayer);

      const mainTerminal =
        vscode.window.terminals.find((t) => t.name === terminalNames.main) ||
        vscode.window.createTerminal(terminalNames.main);

      if (config.get("showTerminal")) {
        mainTerminal.show();
      }

      // Kill the app/HgDisplayer
      killerTerminal.sendText(
        `killall ${fileNameWithoutExt} && killall HgDisplayer`
      );
      await sleep(100);

      // Run the HgDisplayer
      displayerTerminal.sendText(hgPath);
      await sleep(100);

      // Compile and run the app
      mainTerminal.sendText(command);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
