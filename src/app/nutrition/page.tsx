/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera, X, Upload, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FoodSnapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [foodDescription, setFoodDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setFoodDescription('');
    setAnalysis(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsCameraOpen(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const analyzeFood = async () => {
    if (!capturedImage || !user || !foodDescription.trim()) return;

    setAnalyzing(true);
    try {
      // Get user profile for context
      const profileResponse = await fetch(`/api/user/profile?userId=${user.id}`);
      const profile = profileResponse.ok ? await profileResponse.json() : null;

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          foodDescription: foodDescription.trim(),
          userId: user.id,
          userProfile: profile 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('Failed to analyze food. Please try again or use the chat: "Can I eat [food name]?"');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToLog = async () => {
    if (!analysis || !user) return;

    try {
      await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...analysis,
          image: capturedImage,
          timestamp: new Date().toISOString(),
        }),
      });

      alert('Meal logged successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen pb-24 lg:pb-8"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8dff5 50%, #fff9f0 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Snap Your Meal</h1>
            <p className="text-gray-600 mt-1">AI-powered nutrition analysis</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {!capturedImage && !isCameraOpen && (
            <div 
              className="rounded-3xl p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(30px)',
                boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Analyze?</h2>
              <p className="text-gray-600 mb-6">
                Take a photo of your meal and get instant nutritional insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={openCamera}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-6 text-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Camera View */}
          {isCameraOpen && (
            <div 
              className="rounded-3xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(30px)',
                boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <Button
                  onClick={closeCamera}
                  variant="outline"
                  className="bg-white/90 backdrop-blur-md rounded-full"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <div 
              className="rounded-3xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(30px)',
                boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full rounded-2xl mb-4"
              />
              
              {!analysis && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your food
                    </label>
                    <input
                      type="text"
                      value={foodDescription}
                      onChange={(e) => setFoodDescription(e.target.value)}
                      placeholder="e.g., Jollof Rice with chicken, Suya and plantain..."
                      className="w-full px-4 py-3 rounded-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <Button
                    onClick={analyzeFood}
                    disabled={analyzing || !foodDescription.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-6 text-lg disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">AI Analysis Complete</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/60 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Detected Food</p>
                      <p className="text-xl font-bold text-gray-900">{analysis.foodName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 rounded-2xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Calories</p>
                        <p className="text-2xl font-bold text-orange-600">{analysis.calories} kcal</p>
                      </div>
                      <div className="bg-white/60 rounded-2xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Protein</p>
                        <p className="text-2xl font-bold text-blue-600">{analysis.protein}g</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 rounded-2xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Carbs</p>
                        <p className="text-2xl font-bold text-yellow-600">{analysis.carbs}g</p>
                      </div>
                      <div className="bg-white/60 rounded-2xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Fat</p>
                        <p className="text-2xl font-bold text-purple-600">{analysis.fat}g</p>
                      </div>
                    </div>

                    {analysis.ulcerWarning && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Ulcer Alert</p>
                        <p className="text-sm text-red-700">{analysis.ulcerWarning}</p>
                      </div>
                    )}

                    {analysis.pcosAdvice && (
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-emerald-800 mb-1">💚 PCOS Tip</p>
                        <p className="text-sm text-emerald-700">{analysis.pcosAdvice}</p>
                      </div>
                    )}

                    {analysis.recommendation && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-blue-800 mb-1">💡 Recommendation</p>
                        <p className="text-sm text-blue-700">{analysis.recommendation}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => {
                        setCapturedImage(null);
                        setAnalysis(null);
                      }}
                      variant="outline"
                      className="flex-1 rounded-full"
                    >
                      Retake
                    </Button>
                    <Button
                      onClick={saveToLog}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                    >
                      Save to Log
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
