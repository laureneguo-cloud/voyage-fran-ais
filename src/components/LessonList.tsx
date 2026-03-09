import React from "react";
import { Lesson } from "../types";
import { INITIAL_LESSONS } from "../constants";
import {
  PlayCircle,
  CheckCircle2,
  BookOpen,
  MessageCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";

interface LessonListProps {
  completedLessons: string[];
  customLessons: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
  onExplainGrammar: (concept: string) => void;
  onGenerateLesson: () => void;
  isGeneratingLesson: boolean;
}

export default function LessonList({
  completedLessons,
  customLessons,
  onStartLesson,
  onExplainGrammar,
  onGenerateLesson,
  isGeneratingLesson,
}: LessonListProps) {
  const allLessons = [...INITIAL_LESSONS, ...customLessons];
  const allCompleted = allLessons.every((l) => completedLessons.includes(l.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">学习路线</h2>
        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          A1 初级
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allLessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked =
            index > 0 && !completedLessons.includes(allLessons[index - 1].id);

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 ${
                isCompleted
                  ? "bg-green-50 border-green-200"
                  : isLocked
                    ? "bg-gray-50 border-gray-100 opacity-60 grayscale"
                    : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md cursor-pointer"
              }`}
              onClick={() => !isLocked && onStartLesson(lesson)}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    lesson.type === "grammar"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {lesson.type === "grammar" ? (
                    <BookOpen className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </div>
                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {lesson.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                {lesson.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {lesson.type === "grammar" ? "语法" : "词汇"}
                </span>

                {!isLocked && !isCompleted && (
                  <button className="flex items-center space-x-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    <span>开始</span>
                    <PlayCircle className="w-5 h-5" />
                  </button>
                )}

                {lesson.type === "grammar" && !isLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExplainGrammar(lesson.topic);
                    }}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    AI 讲解
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl p-6 border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center text-center min-h-[200px]"
          >
            {isGeneratingLesson ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-blue-800 font-medium">
                  AI 正在为您定制下一课...
                </p>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  学无止境
                </h3>
                <p className="text-blue-700 text-sm mb-6">
                  您已完成所有可用课程！让 AI 为您生成专属的新课程。
                </p>
                <button
                  onClick={onGenerateLesson}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  生成新课程
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
