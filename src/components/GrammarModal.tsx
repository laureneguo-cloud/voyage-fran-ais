import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, BookOpen } from "lucide-react";
import { explainGrammar } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

interface GrammarModalProps {
  concept: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function GrammarModal({
  concept,
  isOpen,
  onClose,
}: GrammarModalProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && concept) {
      const loadExplanation = async () => {
        setLoading(true);
        const text = await explainGrammar(concept);
        setExplanation(text);
        setLoading(false);
      };
      loadExplanation();
    }
  }, [isOpen, concept]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                语法解析: {concept}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">
                  AI老师正在为您准备讲解...
                </p>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 prose-li:text-gray-600">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              明白了
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
