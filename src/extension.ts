import * as vscode from "vscode";
import { Result, Synonym, wordposSchema } from "./schemas";

export function activate(context: vscode.ExtensionContext) {
  var WordPOS = require("wordpos"),
    wordpos = new WordPOS();

  const editor = vscode.window.activeTextEditor;
  if (editor === undefined) {
    return;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.synonyms", async () => {
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

      const result = await wordpos.lookup(
        selectedWord,
        async function (result: any) {
          return result;
        }
      );
      const parsed = wordposSchema.parse(result);

      const definitionArticles = parsed.flatMap((item: Result) => {
        return item.synonyms
          .filter(function (synonym: any) {
            return synonym !== selectedWord;
          })
          .map(function (synonym: any) {
            return {
              label: synonym,
              detail: item.def,
              description: item.lexName,
            };
          });
      });

      const synonymPicked = await vscode.window.showQuickPick(
        definitionArticles,
        {
          canPickMany: false,
          title: "Synonyms",
          placeHolder: "List of synonyms about the selected word",
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
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.antonyms", async () => {
      // TODO: Look at https://dictionaryapi.com/ for a better solution. Will prompt user for API key or default to using wordpos but antonyms won't work
      // also look at Merriam-Webster Thesaurus extension
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.definitions", async () => {
      const cursorPosition = editor.selection.start;
      const wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
      const selectedWord = editor.document.getText(wordRange);

      if (selectedWord.length === 0) {
        vscode.window.showInformationMessage(
          "No word selected. Please move cursor within word."
        );
        return;
      }
      const result = await wordpos.lookup(
        selectedWord,
        async function (result: any) {
          return result;
        }
      );
      const parsed = wordposSchema.parse(result);

      const definitionArticles = parsed
        .filter(function (item: Result) {
          return item.lemma === selectedWord;
        })
        .flatMap((item: Result) => {
          return {
            label: item.lemma,
            detail: item.def,
            description: item.lexName,
          };
        });

      await vscode.window.showQuickPick(definitionArticles, {
        canPickMany: false,
        title: "Definitions",
        placeHolder: "List of definitions about the selected word",
        matchOnDetail: true,
      });
    })
  );
}

export function deactivate() {}
