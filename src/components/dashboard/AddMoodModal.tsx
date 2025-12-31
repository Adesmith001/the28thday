"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mood: string) => Promise<void>;
}

const moodOptions = [
  { value: 'very-bad', emoji: '😢', label: 'Very Bad', color: 'bg-red-500' },
  { value: 'bad', emoji: '😟', label: 'Bad', color: 'bg-orange-500' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'bg-green-500' },
  { value: 'excellent', emoji: '😄', label: 'Excellent', color: 'bg-emerald-500' },
];

export default function AddMoodModal({ isOpen, onClose, onSave }: AddMoodModalProps) {
  const [selectedMood, setSelectedMood] = useState(moodOptions[2]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedMood.value);
      setSelectedMood(moodOptions[2]);
      onClose();
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 20px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="text-4xl mb-2">💭</div>
          <h2 className="text-2xl font-bold text-gray-900">How are you feeling?</h2>
          <p className="text-sm text-gray-600 mt-1">Track your emotional well-being</p>
        </div>

        {/* Mood Options */}
        <div className="mb-6 space-y-3">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood)}
              className={`
                w-full p-4 rounded-2xl font-semibold transition-all flex items-center gap-3
                ${selectedMood.value === mood.value
                  ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
                }
              `}
              style={{
                boxShadow: selectedMood.value === mood.value ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none',
              }}
            >
              <div className="text-3xl">{mood.emoji}</div>
              <div className="flex-1 text-left">
                <div className="font-bold">{mood.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-2xl"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Mood'}
          </Button>
        </div>
      </div>
    </div>
  );
}
