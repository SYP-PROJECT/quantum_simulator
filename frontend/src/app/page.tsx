
"use client";

import { Lexer } from "@/input_handler/lexer";
import { Parser } from "@/input_handler/parser";
import Editor from '@monaco-editor/react';
import type monaco from 'monaco-editor';
import React, { useRef, useState } from "react";

const lexer: Lexer = new Lexer();
const parser: Parser = new Parser();

export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState("");

  const handleButtonClick = async () => {
    if (editorRef.current) {
      try{
        lexer.reset(editorRef.current.getValue());
        parser.reset(lexer.tokenize());
      } catch (e){
        const message = e instanceof Error ? e.message : String(e);
        setOutput(message);
        return;
      }

      try {
        const programNode = parser.parseProgram();

        const response = await fetch("http://localhost:8000/api/", {
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          method: 'POST',
          body: JSON.stringify(programNode),
        });

        const json: string[] = await response.json();
        setOutput(json.join("\n"));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setOutput(message);
      }
    }
  };

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;

    monacoInstance.languages.register({ id: "customLang" });
    monacoInstance.languages.setMonarchTokensProvider("customLang", {
      tokenizer: {
        root: [
          [/\b(create|qubit|apply|measure|display)\b/, "keyword"],
          [/\b[+-]?\d+(\.\d+)?\b/, "number"],
          [/i\b/, "imaginary"],
          [/\b[a-zA-Z_][a-zA-Z0-9_]*\b/, "identifier"],
          [/[=;,]/, "delimiter"],
          [/[\[\]]/, "bracket"],
          [/[+\-]/, "operator"],
          [/\s+/, "whitespace"],
          [/(\/\/.*)/, "comment"],
          [/\/\*[\s\S]*?\*\//, "comment"]
        ],
      },
    });

    monacoInstance.languages.setLanguageConfiguration("customLang", {
      comments: {
        lineComment: "//",
        blockComment: ["/*", "*/"],
      },
      brackets: [
        ["[", "]"],
        ["{", "}"],
        ["(", ")"],
      ],
      autoClosingPairs: [
        { open: "[", close: "]" },
        { open: "{", close: "}" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
      ],
    });

    monacoInstance.editor.defineTheme("draculaCustom", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "#ff79c6" },
        { token: "number", foreground: "#f1fa8c" },
        { token: "imaginary", foreground: "#8be9fd" },
        { token: "identifier", foreground: "#8be9fd" },
        { token: "delimiter", foreground: "#ff5555" },
        { token: "bracket", foreground: "#50fa7b" },
        { token: "operator", foreground: "#ffb86c" },
        { token: "whitespace", foreground: "#6272a4" },
        { token: "comment", foreground: "#6272a4", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#282a36",
        "editor.foreground": "#f8f8f2",
        "editorCursor.foreground": "#f8f8f0",
        "editor.selectionBackground": "#bd93f9",
        "editor.inactiveSelectionBackground": "#6272a4",
        "editorIndentGuide.background": "#6272a4",
        "editorIndentGuide.activeBackground": "#50fa7b",
      },
    });

    monacoInstance.editor.setTheme("draculaCustom");
    monacoInstance.editor.setModelLanguage(editor.getModel()!, "customLang");
  };

  const commonEditorStyle = {
    background: "#282a36",
    color: "#f8f8f2",
    padding: "10px",
    borderRadius: "5px",
    height: "100%",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
  };

  const buttonStyle = {
    padding: "10px",
    background: "#444",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "5px",
  };

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
      <div style={{ flex: 1, height: "100%" }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage=""
          defaultValue="// Start coding here..."
          theme="vs-dark"
          onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
        />
      </div>
      <div style={{ width: "40%", padding: "10px", height: "100%" }}>
        <div style={{ ...commonEditorStyle, height: "calc(100% - 50px)", marginBottom: "10px" }}>
          {output}
        </div>
        <button onClick={handleButtonClick} style={buttonStyle}>
          Run Code
        </button>
      </div>

    </div>
  );
}
