"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
  currentTotal: number;
}

export default function AddWaterModal({ isOpen, onClose, onSave, currentTotal }: AddWaterModalProps) {
  const [amount, setAmount] = useState<number>(0.25);
  const [loading, setLoading] = useState(false);

  const quickAmounts = [0.25, 0.5, 0.75, 1.0];

  const handleSave = async () => {
    if (amount <= 0) return;
    
    setLoading(true);
    try {
      await onSave(amount);
      setAmount(0.25);
      onClose();
    } catch (error) {
      console.error('Error saving water intake:', error);
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
        className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl"
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
          <div className="text-4xl mb-2">💧</div>
          <h2 className="text-2xl font-bold text-gray-900">Add Water</h2>
          <p className="text-sm text-gray-600 mt-1">
            Today&apos;s total: <span className="font-semibold">{currentTotal.toFixed(2)}L</span>
          </p>
        </div>

        {/* Quick select amounts */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Quick Select
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((qty) => (
              <button
                key={qty}
                onClick={() => setAmount(qty)}
                className={`
                  px-4 py-3 rounded-2xl font-semibold transition-all
                  ${amount === qty 
                    ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }
                `}
                style={{
                  boxShadow: amount === qty ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                {qty}L
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Custom Amount (Liters)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="0"
            max="5"
            className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          />
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
            disabled={loading || amount <= 0}
          >
            {loading ? 'Saving...' : 'Add Water'}
          </Button>
        </div>
      </div>
    </div>
  );
}
