'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { saveCycleEntry } from '@/lib/firestore';
import { CyclePhase } from '@/types/cycle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

// Form validation schema
const onboardingSchema = z.object({
  // Step 1: Basic Info
  dateOfBirth: z.date({
    message: 'Date of birth is required',
  }),
  height: z.number({
    message: 'Height is required',
  }).min(100, 'Height must be at least 100 cm').max(250, 'Height must be less than 250 cm'),
  weight: z.number({
    message: 'Weight is required',
  }).min(30, 'Weight must be at least 30 kg').max(300, 'Weight must be less than 300 kg'),
  
  // Step 2: Medical Context
  hasPCOS: z.boolean(),
  hasUlcer: z.boolean(),
  spicyFoodSensitivity: z.boolean(),
  
  // Step 3: Cycle History
  averageCycleLength: z.number({
    message: 'Average cycle length is required',
  }).min(21, 'Cycle length must be at least 21 days').max(45, 'Cycle length must be less than 45 days'),
  lastPeriodStartDate: z.date({
    message: 'Last period start date is required',
  }),
  periodLength: z.number().min(2).max(10).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const isOnboarded = Boolean(user.profile) || Boolean(user.onboardingCompleted);
    if (isOnboarded) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      averageCycleLength: 28,
      periodLength: 5,
      hasPCOS: false,
      hasUlcer: false,
      spicyFoodSensitivity: false,
    },
  });

  const dateOfBirth = watch('dateOfBirth');
  const lastPeriodStartDate = watch('lastPeriodStartDate');
  const hasPCOS = watch('hasPCOS');
  const hasUlcer = watch('hasUlcer');
  const spicyFoodSensitivity = watch('spicyFoodSensitivity');

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(
        userRef,
        {
          profile: {
            dateOfBirth: data.dateOfBirth,
            height: data.height,
            weight: data.weight,
            hasPCOS: data.hasPCOS,
            hasUlcer: data.hasUlcer,
            spicyFoodSensitivity: data.spicyFoodSensitivity,
            averageCycleLength: data.averageCycleLength,
            lastPeriodStartDate: data.lastPeriodStartDate,
            periodLength: data.periodLength || 5,
          },
          updatedAt: serverTimestamp(),
          onboardingCompleted: true,
        },
        { merge: true }
      );

      try {
        await saveCycleEntry(user.id, {
          startDate: data.lastPeriodStartDate,
          cycleLength: data.averageCycleLength,
          periodLength: data.periodLength || 5,
          phase: CyclePhase.MENSTRUAL,
        });
      } catch (cycleError) {
        console.error('Error creating initial cycle entry:', cycleError);
        // Continue without blocking onboarding completion
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!dateOfBirth || !watch('height') || !watch('weight')) {
        alert('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-16 rounded-full transition-colors ${
                    i <= step ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step {step} of 3
            </p>
          </div>
          <CardTitle className="text-3xl">
            {step === 1 && 'The Basics'}
            {step === 2 && 'Medical Context'}
            {step === 3 && 'Your Cycle'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'We use these metrics to calculate your metabolic baseline and personalize your plan.'}
            {step === 2 && 'Providing these details helps us tailor your holistic health plan safely.'}
            {step === 3 && 'This helps us predict your phases and manage symptoms effectively.'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker
                    date={dateOfBirth}
                    onDateChange={(date) => setValue('dateOfBirth', date!)}
                    placeholder="DD / MM / YYYY"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="height">Height</Label>
                    <span className="text-2xl font-bold text-green-600">
                      {watch('height') || 165} <span className="text-sm">cm</span>
                    </span>
                  </div>
                  <Input
                    id="height"
                    type="range"
                    min="100"
                    max="250"
                    defaultValue="165"
                    {...register('height', { valueAsNumber: true })}
                    className="w-full"
                  />
                  {errors.height && (
                    <p className="text-sm text-red-500 mt-1">{errors.height.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="weight">Weight</Label>
                    <span className="text-2xl font-bold text-green-600">
                      {watch('weight') || 60} <span className="text-sm">kg</span>
                    </span>
                  </div>
                  <Input
                    id="weight"
                    type="range"
                    min="30"
                    max="200"
                    defaultValue="60"
                    {...register('weight', { valueAsNumber: true })}
                    className="w-full"
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-500 mt-1">{errors.weight.message}</p>
                  )}
                </div>

                <Button type="button" onClick={nextStep} className="w-full" size="lg">
                  Next →
                </Button>
              </div>
            )}

            {/* Step 2: Medical Context */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Diagnosed with PCOS?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Have you been medically diagnosed with Polycystic Ovary Syndrome?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={hasPCOS ? 'default' : 'outline'}
                          onClick={() => setValue('hasPCOS', true)}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!hasPCOS ? 'default' : 'outline'}
                          onClick={() => setValue('hasPCOS', false)}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Have an Ulcer?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Do you currently suffer from any form of stomach ulcer?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={hasUlcer ? 'default' : 'outline'}
                          onClick={() => setValue('hasUlcer', true)}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!hasUlcer ? 'default' : 'outline'}
                          onClick={() => setValue('hasUlcer', false)}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Spicy food sensitivity?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Do spicy foods typically trigger discomfort or pain for you?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={spicyFoodSensitivity ? 'default' : 'outline'}
                          onClick={() => setValue('spicyFoodSensitivity', true)}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!spicyFoodSensitivity ? 'default' : 'outline'}
                          onClick={() => setValue('spicyFoodSensitivity', false)}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your data is encrypted and private.
                </div>

                <div className="flex gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1" size="lg">
                    Next Step →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Cycle History */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-6 bg-linear-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-full">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Label htmlFor="averageCycleLength" className="text-lg font-semibold">
                      Average Cycle Length
                    </Label>
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center gap-4 my-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const current = watch('averageCycleLength') || 28;
                        if (current > 21) setValue('averageCycleLength', current - 1);
                      }}
                    >
                      −
                    </Button>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600">
                        {watch('averageCycleLength') || 28}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">days</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const current = watch('averageCycleLength') || 28;
                        if (current < 45) setValue('averageCycleLength', current + 1);
                      }}
                    >
                      +
                    </Button>
                  </div>

                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Typical cycle length varies between 21 and 35 days.
                  </p>
                  {errors.averageCycleLength && (
                    <p className="text-sm text-red-500 text-center mt-2">{errors.averageCycleLength.message}</p>
                  )}
                </div>

                <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Label className="text-lg font-semibold">Last Period Start Date</Label>
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <DatePicker
                    date={lastPeriodStartDate}
                    onDateChange={(date) => setValue('lastPeriodStartDate', date!)}
                    placeholder="Select date"
                  />
                  {errors.lastPeriodStartDate && (
                    <p className="text-sm text-red-500 mt-2">{errors.lastPeriodStartDate.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your data is private & encrypted
                </div>

                <div className="flex gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1" size="lg">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1" size="lg">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Continue →'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
