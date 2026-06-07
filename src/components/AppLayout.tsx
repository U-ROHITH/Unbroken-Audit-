import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CalendarClock, Image, History, User, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { to: '/', label: 'Today', icon: CalendarClock, end: true },
  { to: '/card', label: 'Card', icon: Image, end: false },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/account', label: 'Account', icon: User, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const name = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'You';

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-4 pt-4">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <item.icon className="h-4 w-4 shrink-0 text-ink-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-2">
        <NavLink to="/account" onClick={onNavigate} className="nav-item w-full">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{name}</span>
        </NavLink>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-sidebar md:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-sidebar shadow-pop animate-fade-in">
            <button
              onClick={() => setDrawer(false)}
              className="absolute right-2 top-3 rounded-md p-1.5 text-ink-3 hover:bg-hover"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3 md:hidden">
          <button
            onClick={() => setDrawer(true)}
            className="rounded-md p-1.5 text-ink-2 hover:bg-hover"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo compact />
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
