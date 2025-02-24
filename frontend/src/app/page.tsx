"use client";

import { Lexer } from "@/input_handler/lexer";
import { ProgramNode } from '../input_handler/ast'
import { Parser } from "@/input_handler/parser";
import { SemanticAnalyzer } from "@/input_handler/semanticAnalyzer";
import QuantumCircuit from '../components/QuantumCircuit';

import Editor from '@monaco-editor/react';
import type monaco from 'monaco-editor';
import React, { useRef, useState, useEffect } from 'react';

const lexer: Lexer = new Lexer();
const parser: Parser = new Parser();
const semanticAnalyzer: SemanticAnalyzer = new SemanticAnalyzer();

export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState("");
  const [programNode, setProgramNode] = useState<ProgramNode | null>(null);

  useEffect(() => {
    const originalStyle = {
      html: document.documentElement.style.cssText,
      body: document.body.style.cssText
    };

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.margin = '0';

    return () => {
      document.documentElement.style.cssText = originalStyle.html;
      document.body.style.cssText = originalStyle.body;
    };
  }, []);

  const handleButtonClick = async () => {
    if (editorRef.current) {
      lexer.reset(editorRef.current.getValue());
      parser.reset(lexer);

      try {
        const programNode = parser.parseProgram();

        if (parser.Errors.length != 0) {
          setOutput(parser.Errors.join("\n"));
          return;
        }

        semanticAnalyzer.analyze(programNode);

        if (semanticAnalyzer.Errors.length != 0) {
          setOutput(semanticAnalyzer.Errors.join("\n"));
          return;
        }

        setProgramNode(programNode);

        const response = await fetch("http://localhost:8000/api/", {
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          method: 'POST',
          body: JSON.stringify(programNode),
        });

        const json: string[] = await response.json();
        console.log(json);

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
          [/(\/\/.*)/, "comment"],
          [/\/\*[\s\S]*?\*\//, "comment"],
          [/[+\-\*\/]/, "operator"],
          [/\s+/, "whitespace"],
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
    width: "100%",
    marginTop: "10px",
  };

  const mainMargin = "20px";
  const halfMargin = "10px";

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      flexDirection: "row",
      padding: mainMargin,
      overflow: "hidden"
    }}>
      {/* Left tile - Editor */}
      <div style={{
        flex: 1,
        height: "100%",
        marginRight: halfMargin,
        overflow: "hidden"
      }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage=""
          defaultValue="// Start coding here..."
          theme="vs-dark"
          onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
        />
      </div>

      {/* Right tile - Other components */}
      <div style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: halfMargin,
        marginLeft: halfMargin,
        overflow: "hidden"
      }}>
        {/* Quantum Circuit */}
        <div style={{
          flex: "0 0 47.5%",
          ...commonEditorStyle,
          overflow: "auto"
        }}>
          {programNode && <QuantumCircuit program={programNode} />}
        </div>

        {/* Output */}
        <div style={{
          flex: "0 0 37.5%",
          ...commonEditorStyle,
          overflow: "auto"
        }}>
          {output}
        </div>

        {/* Run Button */}
        <div style={{ flex: "0 0 15%" }}>
          <button onClick={handleButtonClick} style={buttonStyle}>
            Run Code
          </button>
        </div>
      </div>
    </div>
  );
}
