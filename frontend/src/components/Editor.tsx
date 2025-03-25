import Editor from '@monaco-editor/react';
import type monaco from 'monaco-editor';
// import React, { useRef } from 'react';

interface EditorComponentProps {
  onMount: (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => void;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ onMount }) => {
  // const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);


  return (
    <div className='editor-container'>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage=""
        defaultValue="// Start coding here..."
        theme="vs-dark"
        onMount={(editor, monaco) => onMount(editor, monaco)}
      />
    </div>
  );
};
export default EditorComponent;
