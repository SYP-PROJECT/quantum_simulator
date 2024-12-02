"use client"

import { useState } from "react";
import Editor from '@monaco-editor/react';

export default function Home() {
  const [output, setOutput] = useState("");

  const handleButtonClick = () => {
    setOutput("Your output here");
  };

  return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {}
        <div style={{ flex: 1 }}>
          <Editor
              height="100vh"
              width="100%"
              defaultLanguage="javascript"
              defaultValue="// Start coding here..."
              theme="vs-dark"
          />
        </div>

        {}
          <div style={{width: '40%', padding: '10px', background: '#333', color: '#fff'}}>
              {}
              <div
                  style={{
                      background: '#222',
                      padding: '10px',
                      height: 'calc(100vh - 50px)', // Adjust the height based on button size
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap', // Keep the formatting of the output
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
