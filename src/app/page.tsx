'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ActivityIcon, ArrowRightIcon, LeafIcon, StethoscopeIcon } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const isOnboarded = Boolean(user.profile) || Boolean(user.onboardingCompleted);
      router.replace(isOnboarded ? '/dashboard' : '/onboarding');
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
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <main className="mx-auto flex w-full max-w-md flex-col">
        <div className="rounded-[36px] border bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm p-4 shadow-sm">
          {/* Top bar */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
                <LeafIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">The 28th Day</span>
            </div>

            <Link href="/login" className="shrink-0">
              <Button variant="outline" className="h-10 rounded-full px-5">
                Login
              </Button>
            </Link>
          </div>

          {/* Hero */}
          <section className="mt-4 rounded-[28px] border bg-white/60 dark:bg-gray-900/50 overflow-hidden">
            <div className="relative h-105">
              {/* Image placeholder (no external assets): soft photo-like gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-green-200 via-green-100 to-white dark:from-green-950/40 dark:via-gray-900 dark:to-gray-900" />
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.45),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.35),transparent_60%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.8),transparent_50%)]" />

              {/* Glass overlay */}
              <div className="absolute left-4 right-4 top-24 rounded-3xl border bg-white/35 dark:bg-gray-900/35 backdrop-blur-md p-5">
                <h1 className="text-4xl leading-tight font-semibold text-white drop-shadow-sm">
                  Harmony for
                  <br />
                  <span className="text-green-400">your Hormones</span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-black/50">
                  A holistic approach to managing PCOS and gut health through nature and science.
                </p>
              </div>

              {/* CTA */}
              <div className="absolute left-4 right-4 bottom-5">
                <Link href="/register" className="block">
                  <div className="flex items-center justify-between rounded-full bg-green-500 px-6 py-4 text-black">
                    <span className="text-base font-semibold">Get Your Personal Plan</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-400">
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Feature chips */}
          <section className="mt-4 grid grid-cols-3 gap-3 px-1">
            <div className="flex items-center justify-center gap-2 rounded-full border bg-white/70 dark:bg-gray-900/60 px-4 py-3 text-sm">
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              <span>Cycle Tracking</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-full border bg-white/70 dark:bg-gray-900/60 px-4 py-3 text-sm">
              <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
              <span>Gut Health</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-full border bg-white/70 dark:bg-gray-900/60 px-4 py-3 text-sm">
              <LeafIcon className="h-4 w-4 text-muted-foreground" />
              <span>Nutrition</span>
            </div>
          </section>

          {/* Testimonial */}
          <section className="mt-5 rounded-3xl border bg-white/75 dark:bg-gray-900/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-green-200 dark:bg-green-900/40 flex items-center justify-center text-sm font-semibold text-green-900 dark:text-green-200">
                  SJ
                </div>
                <div>
                  <div className="font-semibold">Sarah J.</div>
                  <div className="text-xs text-muted-foreground">PCOS Warrior • Member since 2023</div>
                </div>
              </div>
              <div className="text-4xl leading-none text-green-200 dark:text-green-900/40">“</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              “The 28th Day helped me understand my cycle patterns and build habits that actually fit my lifestyle.
              The guidance feels practical, not overwhelming.”
            </p>
            <div className="mt-4 flex gap-1 text-yellow-500" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-3xl border bg-white/75 dark:bg-gray-900/60 px-4 py-5 text-center">
              <div className="text-4xl font-bold text-green-500">10k+</div>
              <div className="mt-1 text-xs text-muted-foreground">Happy Members</div>
            </div>
            <div className="rounded-3xl border bg-white/75 dark:bg-gray-900/60 px-4 py-5 text-center">
              <div className="text-4xl font-bold text-green-500">500+</div>
              <div className="mt-1 text-xs text-muted-foreground">Curated Recipes</div>
            </div>
          </section>

          {/* Extra details (simple, no new pages) */}
          <section className="mt-6 rounded-3xl border bg-white/75 dark:bg-gray-900/60 p-5">
            <h2 className="text-base font-semibold">What you get</h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border bg-white/60 dark:bg-gray-950/30 p-4">
                <div className="font-medium">Personal plan</div>
                <div className="text-sm text-muted-foreground">A simple routine built around your goals and cycle.</div>
              </div>
              <div className="rounded-2xl border bg-white/60 dark:bg-gray-950/30 p-4">
                <div className="font-medium">Daily check-ins</div>
                <div className="text-sm text-muted-foreground">Track symptoms, mood, and meals in under 60 seconds.</div>
              </div>
              <div className="rounded-2xl border bg-white/60 dark:bg-gray-950/30 p-4">
                <div className="font-medium">Insights that make sense</div>
                <div className="text-sm text-muted-foreground">Clear trends and suggestions based on your history.</div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 px-2 pb-2 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-8">
              <a href="#privacy" className="hover:underline">Privacy Policy</a>
              <a href="#terms" className="hover:underline">Terms of Service</a>
            </div>
            <div className="mt-3">© {new Date().getFullYear()} The 28th Day. All rights reserved.</div>
          </footer>
        </div>

        {/* Inline sections for footer anchors (no extra pages) */}
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <section id="privacy" className="rounded-2xl border bg-white/60 dark:bg-gray-900/50 p-4">
            <div className="font-medium text-foreground">Privacy Policy</div>
            <p className="mt-1">
              We only use your data to provide personalized insights and improve your experience.
            </p>
          </section>
          <section id="terms" className="rounded-2xl border bg-white/60 dark:bg-gray-900/50 p-4">
            <div className="font-medium text-foreground">Terms of Service</div>
            <p className="mt-1">
              The 28th Day is not a substitute for medical advice. Always consult a qualified professional.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
