import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.synonyms", async () => {
      var WordPOS = require("wordpos"),
        wordpos = new WordPOS();

      const editor = vscode.window.activeTextEditor;
      if (editor === undefined) { return; }

      const cursorPosition = editor.selection.start;
      const wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
      const selectedWord = editor.document.getText(wordRange);
      const word = selectedWord;

      if (selectedWord.length === 0) {
        vscode.window.showInformationMessage(
          "No word selected. Please move cursor within word."
        );
        return;
      }

	  await wordpos.lookup(selectedWord, async function (result: any) {
        const synonymWithDef = result.flatMap((item: any) => {
          return item.synonyms
            .filter(function (synonym: any) {
              return synonym !== selectedWord;
            })
            .map(function (synonym: any) {
              return {
                synonym: synonym,
                definition: item.def,
                type: item.lexName,
              };
            });
        });
		

        const synonymArticles = await synonymWithDef.map((syn: any) => {
          return {
            label: syn.synonym,
            detail: syn.definition,
            description: syn.type,
          };
        });

        const synonymPicked = await vscode.window.showQuickPick(
          synonymArticles,
          {
            canPickMany: false,
            title: "Synonyms",
            matchOnDetail: true,
          }
        );

        editor.edit((selectedWord) => {
          selectedWord.replace(
            editor.selection,
            //@ts-ignore
            synonymPicked === undefined ? word : synonymPicked.label
          );
        });
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.antonyms", async () => {
      vscode.window.showInformationMessage("Antonyms");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.definitions", async () => {
      vscode.window.showInformationMessage("Definitions");
    })
  );
}

export function deactivate() {}
