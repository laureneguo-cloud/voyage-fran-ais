import React from "react";
import { UserState } from "../types";
import { Trophy, Flame, Star, Award } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  userState: UserState;
}

export default function Dashboard({ userState }: DashboardProps) {
  const xpForNextLevel = userState.level * 100;
  const progress = (userState.xp / xpForNextLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider">
              当前等级
            </h3>
            <p className="text-3xl font-bold">Lv. {userState.level}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-blue-100">
            <span>{userState.xp} XP</span>
            <span>{xpForNextLevel} XP</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-6"
      >
        <div className="p-4 bg-orange-100 rounded-2xl">
          <Flame className="w-10 h-10 text-orange-500" />
        </div>
        <div>
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">
            连续学习
          </h3>
          <div className="flex items-baseline space-x-1">
            <p className="text-4xl font-bold text-gray-800">
              {userState.streak}
            </p>
            <span className="text-gray-500 font-medium">天</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-6"
      >
        <div className="p-4 bg-emerald-100 rounded-2xl">
          <Star className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">
            已完成课程
          </h3>
          <div className="flex items-baseline space-x-1">
            <p className="text-4xl font-bold text-gray-800">
              {userState.completedLessons.length}
            </p>
            <span className="text-gray-500 font-medium">节</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
