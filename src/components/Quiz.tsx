import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { generateQuiz, QuizQuestion } from "../services/geminiService";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface QuizProps {
  topic: string;
  level: string;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}

export default function Quiz({ topic, level, onComplete, onClose }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = await generateQuiz(topic, level);
        if (q && q.length > 0) {
          setQuestions(q);
        } else {
          setError("无法生成测验，请稍后再试。");
        }
      } catch (err) {
        setError("生成测验时发生错误。");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [topic, level]);

  const handleSelect = (index: number) => {
    if (isChecking) return;
    setSelectedAnswer(index);
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    setIsChecking(true);

    if (selectedAnswer === questions[currentIndex].correctAnswerIndex) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10B981", "#34D399"],
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedAnswer(null);
      setIsChecking(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">正在生成专属测验...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 font-medium">{error || "没有找到问题"}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
        >
          返回
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ.correctAnswerIndex;

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-gray-700">得分: {score}</span>
        </div>
        <div className="text-sm font-medium text-gray-500">
          问题 {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        ></div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let btnClass =
              "w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ";

            if (!isChecking) {
              btnClass +=
                selectedAnswer === idx
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700";
            } else {
              if (idx === currentQ.correctAnswerIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-700";
              } else if (idx === selectedAnswer) {
                btnClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                btnClass += "border-gray-200 text-gray-400 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isChecking}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isChecking && idx === currentQ.correctAnswerIndex && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                  {isChecking &&
                    idx === selectedAnswer &&
                    idx !== currentQ.correctAnswerIndex && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                </div>
              </button>
            );
          })}
        </div>

        {isChecking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            <p className="font-bold mb-1">
              {isCorrect ? "太棒了！" : "继续加油！"}
            </p>
            <p className="text-sm opacity-90">{currentQ.explanation}</p>
          </motion.div>
        )}

        <div className="mt-8 flex justify-end">
          {!isChecking ? (
            <button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>检查答案</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>
                {currentIndex < questions.length - 1 ? "下一题" : "完成测验"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
