import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingNavBar from '@/components/navigation/FloatingNavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <FloatingNavBar />
    </div>
  );
}
