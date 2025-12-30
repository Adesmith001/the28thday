"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UpdateGutHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { gutHealth: string; gutHealthStatus: string }) => Promise<void>;
}

const gutHealthLevels = [
  { value: 'normal', label: 'Normal', emoji: '😊' },
  { value: 'low-bloating', label: 'Low Bloating', emoji: '🙂' },
  { value: 'moderate-bloating', label: 'Moderate Bloating', emoji: '😐' },
  { value: 'high-bloating', label: 'High Bloating', emoji: '😣' },
];

const statusOptions = [
  { value: 'stable', label: 'Stable', color: 'text-emerald-600' },
  { value: 'improving', label: 'Improving', color: 'text-blue-600' },
  { value: 'worsening', label: 'Worsening', color: 'text-red-600' },
];

export default function UpdateGutHealthModal({ isOpen, onClose, onSave }: UpdateGutHealthModalProps) {
  const [gutHealth, setGutHealth] = useState('normal');
  const [gutHealthStatus, setGutHealthStatus] = useState('stable');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ gutHealth, gutHealthStatus });
      onClose();
    } catch (error) {
      console.error('Error updating gut health:', error);
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
          <div className="text-4xl mb-2">🌿</div>
          <h2 className="text-2xl font-bold text-gray-900">Gut Health</h2>
          <p className="text-sm text-gray-600 mt-1">How is your digestion today?</p>
        </div>

        {/* Gut Health Level */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Current Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {gutHealthLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setGutHealth(level.value)}
                className={`
                  p-3 rounded-2xl font-semibold transition-all text-center
                  ${gutHealth === level.value
                    ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
                style={{
                  boxShadow: gutHealth === level.value ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                <div className="text-2xl mb-1">{level.emoji}</div>
                <div className="text-xs">{level.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Status Trend */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Trend
          </label>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setGutHealthStatus(status.value)}
                className={`
                  px-4 py-3 rounded-2xl font-semibold transition-all
                  ${gutHealthStatus === status.value
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
              >
                {status.label}
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
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  );
}
