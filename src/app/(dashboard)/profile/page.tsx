/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lock, Heart, Bell, Globe, LogOut, Camera } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const data = await getUserProfile(user.id);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <Button
            // onClick={() => router.push('/onboarding')}
            className="text-emerald-600 hover:text-emerald-700"
            variant="ghost"
          >
            Edit
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  width={128}
                  height={128}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-gray-100">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {user?.displayName || 'User'}
          </h2>
          
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-3">
            THE 28TH DAY MEMBER
          </div>
          
          <p className="text-gray-600 text-sm">
            {user?.email}
          </p>
        </Card>

        {/* Account Security */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Account Security
          </h3>
          
          <Card className="divide-y">
            <button
            //   onClick={() => router.push('/change-password')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="text-gray-900 font-medium">Partner Access</p>
                  <p className="text-sm text-gray-500">Allow partner to view health data</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Preferences
          </h3>
          
          <Card className="divide-y">
            <button
            //   onClick={() => router.push('/notifications')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button
            //   onClick={() => router.push('/language')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">English</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </Card>
        </div>

        {/* Sign Out */}
        <Card>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors rounded-lg font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </Card>

        {/* App Version */}
        <p className="text-center text-sm text-gray-500 mt-6">
          App Version 1.0.0 (Build 202)
        </p>
      </div>
    </div>
  );
}
