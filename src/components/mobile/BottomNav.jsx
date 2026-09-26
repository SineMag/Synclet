import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Watch, Shield, UserRound, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/app', label: 'Home', Icon: Home, end: true },
  { to: '/app/device', label: 'Device', Icon: Watch },
  { to: '/app/safety', label: 'Safety', Icon: Shield },
  { to: '/app/profile', label: 'Profile', Icon: UserRound },
  { to: '/app/settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="shrink-0 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`
          }
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}