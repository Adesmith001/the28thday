"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Food Snap',
    href: '/nutrition',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Sisi AI',
    href: '/chat',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v.01M12 16v.01" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function FloatingNavBar() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 lg:hidden"
      style={{
        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))',
      }}
    >
      <div 
        className="relative rounded-full px-10 py-4 backdrop-blur-[30px]"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.9) 100%)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Inner glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.4), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        
        {/* Navigation items */}
        <div className="relative flex items-center justify-between gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 transition-all duration-300 ease-out",
                  "active:scale-90",
                  isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {/* Icon container with glow effect for active state */}
                <div className="relative">
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                        transform: 'scale(1.5)',
                      }}
                    />
                  )}
                  <div className={cn(
                    "relative transition-all duration-300",
                    isActive && "scale-110"
                  )}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div 
                    className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse"
                    style={{
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}