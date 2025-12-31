"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyHealthSummary, getHealthSummaries } from '@/lib/firestore';
import { DailyHealthSummary } from '@/types/health-summary';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function InsightsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todaySummary, setTodaySummary] = useState<DailyHealthSummary | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<DailyHealthSummary[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch today's summary first so we can render even if history query fails
        let today: DailyHealthSummary | null = null;
        try {
          today = await getDailyHealthSummary(user.id);
          setTodaySummary(today);
        } catch (todayError) {
          console.error('Error loading today\'s summary:', todayError);
        }

        // Fetch last 7 days history; if this fails (e.g., missing index), still show today
        try {
          const recent = await getHealthSummaries(user.id, 7);
          setRecentSummaries(recent);
        } catch (historyError) {
          console.error('Error loading recent summaries:', historyError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'fair': return '⚠️';
      case 'poor': return '❌';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 lg:pb-8"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8dff5 50%, #fff9f0 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Health Insights</h1>
          <p className="text-gray-600 mt-2">
            AI-powered analysis of your daily health data
          </p>
        </div>

        {/* Today's Summary */}
        {todaySummary && (
          <Card 
            className="border-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Today&apos;s Health Status</CardTitle>
                  <CardDescription className="mt-1">
                    {new Date(todaySummary.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(todaySummary.status)}`}>
                    <span className="text-2xl">{getStatusEmoji(todaySummary.status)}</span>
                    <span className="font-bold capitalize">{todaySummary.status}</span>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {todaySummary.healthScore}/100
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Insights */}
              {todaySummary.insights && todaySummary.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    What&apos;s Going Well
                  </h3>
                  <div className="space-y-2">
                    {todaySummary.insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {todaySummary.recommendations && todaySummary.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    Areas to Improve
                  </h3>
                  <div className="space-y-2">
                    {todaySummary.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Today&apos;s Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Water</p>
                    <p className="text-2xl font-bold text-blue-600">{todaySummary.waterIntake}L</p>
                  </div>
                  {todaySummary.sleepHours && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Sleep</p>
                      <p className="text-2xl font-bold text-indigo-600">{todaySummary.sleepHours}h</p>
                    </div>
                  )}
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-orange-600">{todaySummary.totalActiveMinutes}min</p>
                  </div>
                  {todaySummary.moodScore && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Mood</p>
                      <p className="text-lg font-bold text-purple-600 capitalize">{todaySummary.moodScore.replace('-', ' ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent History */}
        <Card 
          className="border-0 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(30px)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Last 7 Days
            </CardTitle>
            <CardDescription>Track your health trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSummaries.map((summary, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusEmoji(summary.status)}</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(summary.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{summary.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>💧 {summary.waterIntake}L</span>
                        {summary.sleepHours && <span>😴 {summary.sleepHours}h</span>}
                        <span>🏃 {summary.totalActiveMinutes}min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{summary.healthScore}</p>
                      <p className="text-xs text-gray-500">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentSummaries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No health data available yet</p>
                <p className="text-sm text-gray-400 mt-2">Start tracking your activities to see insights here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
