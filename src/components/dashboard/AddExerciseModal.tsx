"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: { type: string; duration: number; intensity: string; caloriesBurned?: number }) => Promise<void>;
}

const exerciseTypes = [
  { name: 'Yoga', emoji: '🧘‍♀️', defaultCalories: 150 },
  { name: 'Cardio', emoji: '🏃‍♀️', defaultCalories: 300 },
  { name: 'Strength', emoji: '💪', defaultCalories: 200 },
  { name: 'Walking', emoji: '🚶‍♀️', defaultCalories: 120 },
  { name: 'Dancing', emoji: '💃', defaultCalories: 250 },
  { name: 'Swimming', emoji: '🏊‍♀️', defaultCalories: 350 },
  { name: 'Skipping', emoji: '🪢', defaultCalories: 400 },
];

const intensityLevels = ['low', 'medium', 'high'];

export default function AddExerciseModal({ isOpen, onClose, onSave }: AddExerciseModalProps) {
  const [selectedType, setSelectedType] = useState(exerciseTypes[0]);
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<string>('medium');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (duration <= 0) return;
    
    setLoading(true);
    try {
      const caloriesBurned = Math.round((selectedType.defaultCalories / 60) * duration * 
        (intensity === 'low' ? 0.7 : intensity === 'high' ? 1.3 : 1));
      
      await onSave({
        type: selectedType.name,
        duration,
        intensity,
        caloriesBurned,
      });
      
      // Reset form
      setSelectedType(exerciseTypes[0]);
      setDuration(30);
      setIntensity('medium');
      onClose();
    } catch (error) {
      console.error('Error saving exercise:', error);
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
          <div className="text-4xl mb-2">🏋️‍♀️</div>
          <h2 className="text-2xl font-bold text-gray-900">Log Exercise</h2>
          <p className="text-sm text-gray-600 mt-1">Track your workout activity</p>
        </div>

        {/* Exercise Type */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Exercise Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {exerciseTypes.map((type) => (
              <button
                key={type.name}
                onClick={() => setSelectedType(type)}
                className={`
                  p-3 rounded-2xl font-semibold transition-all text-center
                  ${selectedType.name === type.name
                    ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
                style={{
                  boxShadow: selectedType.name === type.name ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="text-xs">{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            step="5"
            min="0"
            max="300"
            className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
        </div>

        {/* Intensity */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Intensity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {intensityLevels.map((level) => (
              <button
                key={level}
                onClick={() => setIntensity(level)}
                className={`
                  px-4 py-3 rounded-2xl font-semibold transition-all capitalize
                  ${intensity === level
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
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
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading || duration <= 0}
          >
            {loading ? 'Saving...' : 'Log Exercise'}
          </Button>
        </div>
      </div>
    </div>
  );
}
