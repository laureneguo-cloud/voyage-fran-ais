import React, { useState, useEffect } from "react";
import { UserState, Lesson } from "./types";
import Dashboard from "./components/Dashboard";
import LessonList from "./components/LessonList";
import Quiz from "./components/Quiz";
import GrammarModal from "./components/GrammarModal";
import { Globe2, User, Home, BookOpen, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { generateNextLesson } from "./services/geminiService";
import { INITIAL_LESSONS } from "./constants";

const INITIAL_USER_STATE: UserState = {
  xp: 0,
  level: 1,
  streak: 1,
  completedLessons: [],
  customLessons: [],
};

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem("voyage_francais_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_USER_STATE, ...parsed };
    }
    return INITIAL_USER_STATE;
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [grammarConcept, setGrammarConcept] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "learn" | "profile">(
    "home",
  );
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  useEffect(() => {
    localStorage.setItem("voyage_francais_state", JSON.stringify(userState));
  }, [userState]);

  const handleLessonComplete = (score: number, total: number) => {
    if (activeLesson) {
      const xpGained = score * 20;
      setUserState((prev) => {
        let newXp = prev.xp + xpGained;
        let newLevel = prev.level;

        while (newXp >= newLevel * 100) {
          newXp -= newLevel * 100;
          newLevel++;
        }

        const newCompleted = prev.completedLessons.includes(activeLesson.id)
          ? prev.completedLessons
          : [...prev.completedLessons, activeLesson.id];

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          completedLessons: newCompleted,
        };
      });
    }
    setActiveLesson(null);
  };

  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    try {
      const allLessons = [...INITIAL_LESSONS, ...userState.customLessons];
      const completedTopics = allLessons
        .filter((l) => userState.completedLessons.includes(l.id))
        .map((l) => l.topic);

      const newLessonData = await generateNextLesson(
        completedTopics,
        userState.level,
      );

      const newLesson: Lesson = {
        ...newLessonData,
        id: `custom-${Date.now()}`,
      };

      setUserState((prev) => ({
        ...prev,
        customLessons: [...prev.customLessons, newLesson],
      }));
    } catch (error) {
      console.error("Failed to generate lesson:", error);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 md:top-0 md:bottom-auto md:border-b md:border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="hidden md:flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Globe2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Voyage Français
              </span>
            </div>

            <div className="flex w-full md:w-auto justify-around md:space-x-8">
              <NavButton
                icon={<Home />}
                label="主页"
                isActive={activeTab === "home"}
                onClick={() => setActiveTab("home")}
              />
              <NavButton
                icon={<BookOpen />}
                label="学习"
                isActive={activeTab === "learn"}
                onClick={() => setActiveTab("learn")}
              />
              <NavButton
                icon={<User />}
                label="我的"
                isActive={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-8 pb-24 md:pt-24 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeLesson ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <Quiz
                topic={activeLesson.topic}
                level={activeLesson.level}
                onComplete={handleLessonComplete}
                onClose={() => setActiveLesson(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Dashboard userState={userState} />
              <LessonList
                completedLessons={userState.completedLessons}
                customLessons={userState.customLessons}
                onStartLesson={setActiveLesson}
                onExplainGrammar={setGrammarConcept}
                onGenerateLesson={handleGenerateLesson}
                isGeneratingLesson={isGeneratingLesson}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <GrammarModal
        concept={grammarConcept || ""}
        isOpen={!!grammarConcept}
        onClose={() => setGrammarConcept(null)}
      />
    </div>
  );
}

function NavButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
        isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <div
        className={`mb-1 ${isActive ? "scale-110" : ""} transition-transform`}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              className: "w-6 h-6",
            })
          : icon}
      </div>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
