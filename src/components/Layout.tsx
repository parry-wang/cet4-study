import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { useEffect } from 'react';
import { useProgressStore } from '@/store/useProgressStore';

export default function Layout() {
  const ensureDailyUpdate = useProgressStore((s) => s.ensureDailyUpdate);

  // 应用启动时检查并执行当日词库定点更新
  useEffect(() => {
    ensureDailyUpdate();
  }, [ensureDailyUpdate]);

  return (
    <div className="min-h-screen flex flex-col bg-paper-100">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
