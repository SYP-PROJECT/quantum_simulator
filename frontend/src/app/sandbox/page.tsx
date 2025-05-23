"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import lessons from "@/data/lessons.json";
import Editor from "@monaco-editor/react";
import { Lexer } from "@/input_handler/lexer";
import { Parser } from "@/input_handler/parser";
import { Interpreter } from "@/input_handler/interpreter";
import type monaco from "monaco-editor";
import { ProgramNode as QuantumProgramNode } from '@/input_handler/ast';
import QuantumCircuitComponent from "@/components/Rendering";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const lexer: Lexer = new Lexer();
const parser: Parser = new Parser();
const interpreter: Interpreter = new Interpreter();

const LessonDetails = ({ lessonId, onClose }: { lessonId: string; onClose: () => void }) => {
    const [lesson, setLesson] = useState<{ id: number; title: string; description: string; content: string } | null>(null);

    useEffect(() => {
        const lessonData = lessons.find((l) => l.id === parseInt(lessonId));
        if (lessonData) {
            setLesson(lessonData);
        }
    }, [lessonId]);

    if (!lesson) return <div>Loading lesson...</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl w-full text-left space-y-6 overflow-y-auto max-h-full">
                <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>

                <div className="prose prose-invert max-w-none text-gray-300">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {lesson.content}
                    </ReactMarkdown>
                </div>

                <button
                    onClick={onClose}
                    className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg mt-6 w-full"
                >
                    Start Lesson
                </button>
            </div>
        </div>
    );
};

function SandboxContent() {
    const searchParams = useSearchParams();
    const [lessonId, setLessonId] = useState<string | null>(null);
    const [showLessonPopup, setShowLessonPopup] = useState<boolean>(true);
    const [output, setOutput] = useState("");
    const [programNode, setProgramNode] = useState<QuantumProgramNode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        const lessonIdParam = searchParams.get("lessonId");
        if (lessonIdParam) {
            setLessonId(lessonIdParam);
            setShowLessonPopup(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const originalStyle = {
            html: document.documentElement.style.cssText,
            body: document.body.style.cssText,
        };

        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.height = "100%";
        document.body.style.overflow = "hidden";
        document.body.style.height = "100%";
        document.body.style.margin = "0";

        return () => {
            document.documentElement.style.cssText = originalStyle.html;
            document.body.style.cssText = originalStyle.body;
        };
    }, []);

    const handleButtonClick = async () => {
        if (editorRef.current) {
            setIsLoading(true);
            setOutput("");

            const tokens = lexer.tokenize(editorRef.current.getValue());
            const programNode = parser.parseProgram(tokens);

            if (parser.Errors.length !== 0) {
                setOutput(parser.Errors.join("\n"));
                setProgramNode(null); // Clear program node on error
                setIsLoading(false);
                return;
            }

            setProgramNode(programNode);
            setIsLoading(false);
            setOutput(interpreter.interpret(programNode));
        }
    };

    const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
        editorRef.current = editor;

        monacoInstance.languages.register({ id: "customLang" });
        monacoInstance.languages.setMonarchTokensProvider("customLang", {
            tokenizer: {
                root: [
                    [/\b(qubit|register|gate|measure|if|repeat|print|define|as|matrix|for|let|true|false)\b/, "keyword"],
                    [/\b\d+(\.\d+)?i\b/, "imaginary"],
                    [/\b\d+(\.\d+)?\b/, "number"],
                    [/\b[a-zA-Z_][a-zA-Z0-9_]*\b/, "identifier"],
                    [/=>|==|!=|&&|\|\||[=+\-*/<>!]/, "operator"],
                    [/[{}[\],;]/, "delimiter"],
                    [/#.*$/, "comment"],
                    [/\s+/, "whitespace"],
                ],
            },
        });

        monacoInstance.languages.setLanguageConfiguration("customLang", {
            comments: {
                lineComment: "#",
            },
            brackets: [["[", "]"], ["{", "}"], ["(", ")"]],
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

    const handleCloseLessonPopup = () => {
        setShowLessonPopup(false);
    };

    const handleShowLesson = () => {
        setShowLessonPopup(true);
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 overflow-hidden relative">
            {/* Render Lesson Popup */}
            {lessonId && showLessonPopup && (
                <LessonDetails
                    lessonId={lessonId}
                    onClose={handleCloseLessonPopup}
                />
            )}

            {/* Left side: Editor */}
            <div className="flex-1 h-full mr-2 overflow-hidden rounded-2xl shadow-lg">
                <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage=""
                    defaultValue="#Start coding here..."
                    theme="vs-dark"
                    onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
                />
            </div>

            {/* Right side: Output, Quantum Circuit, and Buttons */}
            <div className="flex flex-col flex-1 h-full ml-2 space-y-4">
                {/* Output panel */}
                <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="sticky top-0 bg-gray-800 p-4 pb-2 z-10 border-b border-gray-700">
                        <h3 className="text-lg font-semibold">Output</h3>
                    </div>
                    <div className="flex-1 p-4 pt-2 overflow-auto">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            output ? (
                                <pre>{output}</pre>
                            ) : (
                                <div className="text-gray-400 italic">Run a program to see output</div>
                            )
                        )}
                    </div>
                </div>

                {/* Quantum Circuit Visualization */}
                <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="sticky top-0 bg-gray-800 p-4 pb-2 z-10 border-b border-gray-700">
                        <h3 className="text-lg font-semibold">Quantum Circuit</h3>
                    </div>
                    <div className="flex-1 p-4 pt-2 overflow-auto">
                        {programNode ? (
                            <QuantumCircuitComponent programNode={programNode} />
                        ) : (
                            <div className="text-gray-400 italic">Run a valid quantum program to see the circuit visualization</div>
                        )}
                    </div>
                </div>


                {/* Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleButtonClick}
                        className="flex-1 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg"
                    >
                        Run Program
                    </button>

                    <button
                        onClick={handleShowLesson}
                        className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg"
                        title="Show Lesson"
                    >
                        ?
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Sandbox() {
    return (
        <Suspense fallback={<div>Loading Sandbox...</div>}>
            <SandboxContent />
        </Suspense>
    );
}