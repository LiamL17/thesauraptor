import * as vscode from "vscode";
import { dictionaryApiJsonResponse } from "./schemas";
import fetch from "node-fetch";
import { getAntonyms, getDefinitions, getSynonyms } from "./dictionary-client";

export function activate(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (editor === undefined) {
    return;
  }

  const getApiKey = async () => {
    const key = await context.globalState.get("key");

    if (typeof key === "string") {
      return key;
    }

    const url = "https://dictionaryapi.com";

    const options: vscode.MessageOptions = {
      detail: `Visit '${url}' to get an API key.`,
      modal: true,
    };

    vscode.window
      .showInformationMessage("Dictionary API key", options, ...["Open URL"])
      .then((item) => {
        if (item === "Open") {
          vscode.env.openExternal(vscode.Uri.parse(url));
        }
      });

    const input = await vscode.window.showInputBox({
      prompt: "Paste your API key here to use Thesauraptor!",
      ignoreFocusOut: true,
    });

    if (input !== undefined) {
      console.log("input", input);

      await context.globalState.update(`key`, input);
      return input;
    }

    vscode.window.showWarningMessage(
      "No API key provided. Thesauraptor cannot be accessed."
    );
    return;
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.synonyms", async () => {
      const key = await getApiKey();
      if (key === undefined) {
        return;
      }

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

      const synonyms:
        | { type: "error"; message: string }
        | { type: "success"; synonyms: string[] } = await getSynonyms(
        word,
        key
      ).then((result: string[] | string) => {
        if (typeof result === "string") {
          return { type: "error", message: result };
        }
        return {
          type: "success",
          synonyms: result,
        };
      });

      if (synonyms.type === "error") {
        vscode.window.showErrorMessage(synonyms.message);
        return;
      }

      if (synonyms.synonyms.length === 0) {
        return await vscode.window.showInformationMessage(
          `No synonyms found for '${word}'.`
        );
      }

      const definitionArticles = synonyms.synonyms.map(function (
        synonym: string
      ) {
        return {
          label: synonym,
        };
      });

      const synonymPicked = await vscode.window.showQuickPick(
        definitionArticles,
        {
          canPickMany: false,
          title: "Synonyms",
          placeHolder: `List of synonyms for '${word}:'`,
          matchOnDetail: true,
        }
      );

      return editor.edit((selectedWord) => {
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
      const key = await getApiKey();
      if (key === undefined) {
        return;
      }

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

      const antonyms:
        | { type: "error"; message: string }
        | { type: "success"; antonyms: string[] } = await getAntonyms(
        word,
        key
      ).then((result: string[] | string) => {
        if (typeof result === "string") {
          return { type: "error", message: result };
        }
        return {
          type: "success",
          antonyms: result,
        };
      });

      if (antonyms.type === "error") {
        vscode.window.showErrorMessage(antonyms.message);
        return;
      }

      if (antonyms.antonyms.length === 0) {
        return await vscode.window.showInformationMessage(
          `No antonyms found for '${word}'.`
        );
      }

      const definitionArticles = antonyms.antonyms.map(function (
        antonym: string
      ) {
        return {
          label: antonym,
        };
      });

      const antonymPicked = await vscode.window.showQuickPick(
        definitionArticles,
        {
          canPickMany: false,
          title: "Antonyms",
          placeHolder: `List of antonyms for '${word}:'`,
          matchOnDetail: true,
        }
      );

      return editor.edit((selectedWord) => {
        selectedWord.replace(
          editor.selection,
          //@ts-ignore
          antonymPicked === undefined ? word : antonymPicked.label
        );
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("thesauraptor.definitions", async () => {
      const key = await getApiKey();
      if (key === undefined) {
        return;
      }

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

      const definitions:
        | { type: "error"; message: string }
        | { type: "success"; definitions: string[] } = await getDefinitions(
        word,
        key
      ).then((result: string[] | string) => {
        if (typeof result === "string") {
          return { type: "error", message: result };
        }
        return {
          type: "success",
          definitions: result,
        };
      });

      if (definitions.type === "error") {
        vscode.window.showErrorMessage(definitions.message);
        return;
      }

      if (definitions.definitions.length === 0) {
        return await vscode.window.showInformationMessage(
          `No definitions found for '${word}'.`
        );
      }

      const definitionArticles = definitions.definitions.map(function (
        synonym: string
      ) {
        return {
          label: synonym,
        };
      });

      return await vscode.window.showQuickPick(definitionArticles, {
        canPickMany: false,
        title: "Definitions",
        placeHolder: `List of definitions for '${word}':`,
        matchOnDetail: true,
      });
    })
  );
}

export function deactivate() {}
