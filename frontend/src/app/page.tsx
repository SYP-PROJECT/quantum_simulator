"use client"

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
      lexer.reset(editorRef.current.getValue());
      parser.reset(lexer.tokenize());

      try {
        const programNode = parser.parseProgram();

        const response = await fetch("http://localhost:8000/api/", {
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          method: 'POST',
          body: JSON.stringify(programNode)
        });

        const json: string[] = await response.json();
        setOutput(json.join("\n"));
      }
      catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setOutput(message);
      }
    }
  };

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor,) => {
    editorRef.current = editor;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {}
      <div style={{ flex: 1 }}>
        <Editor
          height="100vh"
          width="100%"
          defaultLanguage=""
          defaultValue="// Start coding here..."
          theme="vs-dark"
          onMount={handleEditorMount}
        />
      </div>

      {}
      <div style={{ width: '40%', padding: '10px', background: '#333', color: '#fff' }}>
        {}
        <div
          style={{
            background: '#222',
            padding: '10px',
            height: 'calc(100vh - 50px)',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            borderRadius: '5px',
          }}
        >
          {output}
        </div>
        <button
          onClick={handleButtonClick}
          style={{
            marginBottom: '20px',
            padding: '10px',
            background: '#444',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Run Code
        </button>
      </div>
    </div>
  );
}
