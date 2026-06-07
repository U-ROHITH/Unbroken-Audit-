import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarClock, History, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

const nav = [
  { to: '/', label: 'Today', icon: CalendarClock, end: true },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function AppLayout() {
  const { signOut } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      error('Could not sign out. Try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-28 pt-5 sm:pb-10">
      <header className="mb-6 flex items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? 'bg-white/10 text-paper' : 'text-paper/55 hover:text-paper'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-paper/55 hover:text-paper"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-3 text-[11px] transition ${
                  isActive ? 'text-accent' : 'text-paper/50'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-[11px] text-paper/50"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </nav>
    </div>
  );
}
