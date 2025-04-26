"use client";

import { useRouter } from "next/navigation";
import lessons from "@/data/lessons.json";

export default function LandingPage() {
    const router = useRouter();

    const openLesson = (lessonId: number) => {
        router.push(`/sandbox?lessonId=${lessonId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Quantum Computing Tutorials</h1>
                <p className="text-gray-400">Start your quantum journey with interactive lessons and exercises.</p>
            </header>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className="bg-gray-800 rounded-2xl shadow-lg p-6 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:bg-gray-700"
                        onClick={() => openLesson(lesson.id)}
                    >
                        <h2 className="text-2xl font-semibold mb-2">{lesson.title}</h2>
                        <p className="text-gray-400">{lesson.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
