import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, Headphones, BookText, PenLine, FileText, AlertCircle, Home, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/vocabulary', label: '单词背诵', icon: BookOpen },
  { to: '/listening', label: '听力播报', icon: Headphones },
  { to: '/reading', label: '阅读理解', icon: BookText },
  { to: '/writing', label: '作文书写', icon: PenLine },
  { to: '/papers', label: '试卷生成', icon: FileText },
  { to: '/mistakes', label: '错题本', icon: AlertCircle },
];

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper-100/85 backdrop-blur-md border-b border-ink-900/10">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="font-display text-2xl font-black tracking-tightest text-ink-900">
              砚墨
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500 hidden sm:inline">
              CET-4 Studio
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 text-sm transition-colors rounded-sm',
                    active
                      ? 'text-wine-600 font-semibold'
                      : 'text-ink-700 hover:text-wine-500',
                  )}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.6} />
                  <span className="font-serif">{item.label}</span>
                  {active && (
                    <span className="absolute mt-7 h-px w-6 bg-wine-500" aria-hidden />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-ink-900"
            onClick={() => setOpen(!open)}
            aria-label="菜单"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {open && (
          <nav className="lg:hidden pb-4 grid grid-cols-2 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2.5 text-sm rounded-sm border border-ink-900/8',
                    active ? 'text-wine-600 bg-wine-50 font-semibold' : 'text-ink-700 bg-paper-50',
                  )}
                >
                  <Icon size={15} />
                  <span className="font-serif">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
