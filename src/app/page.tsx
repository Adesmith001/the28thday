'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <main className="flex flex-col items-center justify-center px-4 text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          The 28th Day
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
          Empowering Nigerian Women with PCOS
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
          Take control of your health journey with personalized cycle tracking, 
          nutrition guidance featuring local foods, and AI-powered insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Cycle Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your menstrual cycle and predict your next period
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold mb-2">Nigerian Foods</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PCOS-friendly meal tracking with local Nigerian dishes
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personalized health recommendations powered by AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
