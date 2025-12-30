"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getTodayWaterIntake, 
  getTodayExercises, 
  getDailyActivity, 
  getStreak,
  saveWaterIntake,
  saveExercise,
  updateDailyActivity,
  getCycleEntries,
} from '@/lib/firestore';
import { getCurrentPhase } from '@/lib/cycleUtils';
import type { Exercise, DailyActivity } from '@/types/activity';
import AddWaterModal from '@/components/dashboard/AddWaterModal';
import AddExerciseModal from '@/components/dashboard/AddExerciseModal';
import UpdateGutHealthModal from '@/components/dashboard/UpdateGutHealthModal';
import { Plus, Droplet, Dumbbell, Camera, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  waterIntake: number;
  exercises: Exercise[];
  activeMinutes: number;
  calories: number;
  streak: number;
  cyclePhase: string;
  cycleDay: number;
  gutHealth: string;
  gutHealthStatus: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    waterIntake: 0,
    exercises: [],
    activeMinutes: 0,
    calories: 0,
    streak: 0,
    cyclePhase: 'Follicular',
    cycleDay: 1,
    gutHealth: 'normal',
    gutHealthStatus: 'stable',
  });

  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showGutHealthModal, setShowGutHealthModal] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load all data in parallel
      const [waterData, exercisesData, dailyData, streakData, cycleData] = await Promise.all([
        getTodayWaterIntake(user.id),
        getTodayExercises(user.id),
        getDailyActivity(user.id),
        getStreak(user.id, 'overall'),
        getCycleEntries(user.id, 1),
      ]);

      // Calculate cycle phase
      let phase = 'Follicular';
      let day = 1;
      
      if (cycleData && cycleData.length > 0) {
        const latestCycle = cycleData[0] as { id: string; startDate?: Date | { toDate: () => Date } };
        if (latestCycle.startDate) {
          const startDate = latestCycle.startDate instanceof Date 
            ? latestCycle.startDate 
            : (latestCycle.startDate as { toDate: () => Date }).toDate();
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          day = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const phaseStr = getCurrentPhase(day);
          phase = phaseStr.charAt(0).toUpperCase() + phaseStr.slice(1);
        }
      }

      // Use aggregated data from fetched results
      setData({
        waterIntake: waterData.total || 0,
        exercises: exercisesData.exercises || [],
        activeMinutes: exercisesData.totalMinutes || 0,
        calories: exercisesData.totalCalories || 0,
        streak: streakData?.currentStreak || 0,
        cyclePhase: phase,
        cycleDay: day,
        gutHealth: dailyData?.gutHealth || 'normal',
        gutHealthStatus: dailyData?.gutHealthStatus || 'stable',
      });
      
      console.log('Dashboard data loaded:', {
        water: waterData.total,
        exerciseCount: exercisesData.exercises?.length,
        activeMinutes: exercisesData.totalMinutes,
        calories: exercisesData.totalCalories,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    try {
      console.log('Saving water:', amount, 'for user:', user.id);
      await saveWaterIntake(user.id, amount);
      console.log('Water saved successfully');
      await loadDashboardData();
    } catch (error) {
      console.error('Error saving water:', error);
      alert('Failed to save water intake. Please try again.');
    }
  };

  const handleAddExercise = async (exercise: { type: string; duration: number; intensity: string; caloriesBurned?: number }) => {
    if (!user) return;
    try {
      console.log('Saving exercise:', exercise, 'for user:', user.id);
      await saveExercise(user.id, exercise as Partial<Exercise>);
      console.log('Exercise saved successfully');
      await loadDashboardData();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Failed to save exercise. Please try again.');
    }
  };

  const handleUpdateGutHealth = async (gutData: { gutHealth: string; gutHealthStatus: string }) => {
    if (!user) return;
    try {
      console.log('Updating gut health:', gutData, 'for user:', user.id);
      await updateDailyActivity(user.id, gutData as Partial<DailyActivity>);
      console.log('Gut health updated successfully');
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating gut health:', error);
      alert('Failed to update gut health. Please try again.');
    }
  };

  const getPhaseEmoji = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      'Menstrual': '🌙',
      'Follicular': '🌱',
      'Ovulation': '⚡',
      'Luteal': '🌸',
    };
    return phaseMap[phase] || '🌿';
  };

  const getPhaseDescription = (phase: string) => {
    const descMap: { [key: string]: string } = {
      'Menstrual': 'Rest & Restore',
      'Follicular': 'High Energy',
      'Ovulation': 'Peak Power',
      'Luteal': 'Winding Down',
    };
    return descMap[phase] || 'Energy balancing';
  };

  const getRecommendedWorkout = (phase: string) => {
    const workoutMap: { [key: string]: { name: string; emoji: string } } = {
      'Menstrual': { name: 'Gentle Yoga', emoji: '🧘‍♀️' },
      'Follicular': { name: 'Cardio', emoji: '🏃‍♀️' },
      'Ovulation': { name: 'HIIT', emoji: '💪' },
      'Luteal': { name: 'Pilates', emoji: '🤸‍♀️' },
    };
    return workoutMap[phase] || { name: 'Yoga', emoji: '🧘‍♀️' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const workout = getRecommendedWorkout(data.cyclePhase);

  return (
    <div 
      className="min-h-screen pb-24 lg:pb-8"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8dff5 50%, #fff9f0 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 uppercase tracking-wide">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{user?.displayName || 'There'}</h1>
          </div>
          <button className="relative w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center">
            <span className="text-2xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          
          {/* Hero Card - Today's Rhythm (Full Width on Mobile, Spans 2 cols on Desktop) */}
          <Card 
            className="md:col-span-2 lg:col-span-2 overflow-hidden border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">
                    Cycle Tracker
                  </CardTitle>
                </div>
                <Link
                  href="/cycle-tracker"
                  className="px-4 py-2 rounded-full bg-white/60 text-sm font-medium text-gray-700 hover:bg-white/80 transition-all"
                >
                  {workout.emoji} {workout.name}
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {data.cyclePhase} Phase
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <span className="text-2xl font-bold text-emerald-600">Day {data.cycleDay}</span>
                    <span className="text-lg">•</span>
                    <span className="text-lg">{getPhaseDescription(data.cyclePhase)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {data.cyclePhase === 'Follicular' && 'Perfect time for high-intensity workouts and trying new activities'}
                    {data.cyclePhase === 'Menstrual' && 'Focus on rest, gentle movement, and self-care'}
                    {data.cyclePhase === 'Ovulation' && 'Peak energy! Go for your most challenging workouts'}
                    {data.cyclePhase === 'Luteal' && 'Energy is naturally decreasing, choose moderate activities'}
                  </p>
                </div>
                <div className="hidden md:block relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(16, 185, 129, 0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(data.cycleDay / 28) * 351.86} 351.86`}
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))',
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">{getPhaseEmoji(data.cyclePhase)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Action Card - Snap Your Meal */}
          <Card 
            className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:scale-[1.02] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.2), 0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Link href="/nutrition" className="block h-full">
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <div 
                  className="w-full h-full"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.4), transparent 70%)',
                  }}
                />
              </div>
              <CardContent className="relative p-6 h-full flex flex-col justify-between min-h-70">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-4">
                    AI Powered
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Snap Your Meal</h3>
                  <p className="text-white/70 text-sm">Analyze Jollof & more</p>
                </div>
                <button className="w-full mt-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg">
                  Open Camera
                </button>
              </CardContent>
            </Link>
          </Card>

          {/* Water Intake Card */}
          <Card 
            className="border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-blue-600" />
                </div>
                <button
                  onClick={() => setShowWaterModal(true)}
                  className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">Water Intake</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">{data.waterIntake.toFixed(1)}<span className="text-xl text-gray-500">L</span></p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min((data.waterIntake / 2.5) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Goal: 2.5L</p>
            </CardContent>
          </Card>

          {/* AI Chat Teaser */}
          <Card 
            className="border-0 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Link href="/chat">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Sisi Coach</p>
                    <p className="text-xs text-gray-600 mt-1">Your AI wellness guide</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    &ldquo;Hey love! Need some advice or just want to chat? I&apos;m here for you. 💚&rdquo;
                  </p>
                </div>
                <button className="w-full py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat Now
                </button>
              </CardContent>
            </Link>
          </Card>

          {/* Exercise/Activity Card */}
          <Card 
            className="border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-orange-600" />
                </div>
                <button
                  onClick={() => setShowExerciseModal(true)}
                  className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">Active Minutes</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">{data.activeMinutes}<span className="text-xl text-gray-500">min</span></p>
              <p className="text-sm text-gray-600 mt-4">Calories: <span className="font-semibold text-orange-600">{data.calories} kcal</span></p>
            </CardContent>
          </Card>

          {/* Gut Health Card */}
          <Card 
            className="border-0 shadow-lg cursor-pointer"
            onClick={() => setShowGutHealthModal(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Gut Health</p>
              <p className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {data.gutHealth.replace('-', ' ')}
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${
                  data.gutHealthStatus === 'improving' ? 'text-green-600' :
                  data.gutHealthStatus === 'worsening' ? 'text-red-600' :
                  'text-gray-600'
                }`} />
                <span className={`text-sm font-medium capitalize ${
                  data.gutHealthStatus === 'improving' ? 'text-green-600' :
                  data.gutHealthStatus === 'worsening' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {data.gutHealthStatus}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Consistency Streak Card */}
          <Card 
            className="md:col-span-2 border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consistency Streak</p>
                  <p className="text-4xl font-bold text-emerald-600">{data.streak} <span className="text-lg text-gray-500">days</span></p>
                </div>
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔥</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {[...Array(Math.min(data.streak, 7))].map((_, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md"
                    style={{
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                ))}
                {[...Array(Math.max(7 - data.streak, 0))].map((_, i) => (
                  <div 
                    key={`empty-${i}`}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">Keep it up! Track your activities daily to maintain your streak.</p>
            </CardContent>
          </Card>

          {/* Daily Tip */}
          <Card 
            className="md:col-span-2 lg:col-span-1 border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.6) 0%, rgba(254, 215, 170, 0.4) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">💡</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Daily Tip</p>
              </div>
              <p className="text-gray-900 font-medium">
                Try peppermint tea for evening bloating.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Natural remedies can support your gut health during different cycle phases.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Modals */}
      <AddWaterModal
        isOpen={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        onSave={handleAddWater}
        currentTotal={data.waterIntake}
      />
      <AddExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSave={handleAddExercise}
      />
      <UpdateGutHealthModal
        isOpen={showGutHealthModal}
        onClose={() => setShowGutHealthModal(false)}
        onSave={handleUpdateGutHealth}
      />
    </div>
  );
}
