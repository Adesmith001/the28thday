"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sleep: { hours: number; quality: string }) => Promise<void>;
}

const sleepQualityOptions = [
  { value: 'poor', emoji: '😫', label: 'Poor', description: 'Restless, hard to fall asleep' },
  { value: 'fair', emoji: '😴', label: 'Fair', description: 'Some interruptions' },
  { value: 'good', emoji: '😌', label: 'Good', description: 'Mostly restful' },
  { value: 'excellent', emoji: '😊', label: 'Excellent', description: 'Deep, uninterrupted sleep' },
];

export default function AddSleepModal({ isOpen, onClose, onSave }: AddSleepModalProps) {
  const [hours, setHours] = useState<number>(7);
  const [quality, setQuality] = useState(sleepQualityOptions[2]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (hours <= 0 || hours > 24) return;
    
    setLoading(true);
    try {
      await onSave({
        hours,
        quality: quality.value,
      });
      
      // Reset form
      setHours(7);
      setQuality(sleepQualityOptions[2]);
      onClose();
    } catch (error) {
      console.error('Error saving sleep data:', error);
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
          <div className="text-4xl mb-2">😴</div>
          <h2 className="text-2xl font-bold text-gray-900">Log Sleep</h2>
          <p className="text-sm text-gray-600 mt-1">Track last night&apos;s sleep</p>
        </div>

        {/* Sleep Hours */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Hours of Sleep (last night)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              min="0"
              max="12"
              step="0.5"
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(hours / 12) * 100}%, #ddd ${(hours / 12) * 100}%, #ddd 100%)`
              }}
            />
            <div className="text-3xl font-bold text-blue-600 min-w-20 text-center">
              {hours}h
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>0h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Sleep Quality
          </label>
          <div className="space-y-2">
            {sleepQualityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setQuality(option)}
                className={`
                  w-full p-3 rounded-2xl font-semibold transition-all flex items-center gap-3
                  ${quality.value === option.value
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm">{option.label}</div>
                  <div className={`text-xs ${quality.value === option.value ? 'text-blue-100' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
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
            className="flex-1 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading || hours <= 0}
          >
            {loading ? 'Saving...' : 'Log Sleep'}
          </Button>
        </div>
      </div>
    </div>
  );
}
