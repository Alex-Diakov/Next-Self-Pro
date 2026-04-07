import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { cn } from '../lib/utils';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person', path: '/settings/profile' },
  { id: 'ai-preferences', label: 'AI Preferences', icon: 'psychology', path: '/settings/ai-preferences' },
  { id: 'billing', label: 'Billing', icon: 'credit_card', path: '/settings/billing' },
  { id: 'design-system', label: 'Design System', icon: 'palette', path: '/settings/design-system' },
];

export function SettingsPage() {
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Settings Navigation Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
        <div className="mb-4 px-2">
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-sm text-subtle mt-1">Manage your account and preferences</p>
        </div>
        
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                isActive 
                  ? "bg-accent/10 text-accent" 
                  : "text-subtle hover:bg-surface-hover hover:text-secondary"
              )}
            >
              <Icon name={tab.icon} className="text-xl" />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 bg-surface rounded-3xl border border-border/40 overflow-y-auto custom-scrollbar shadow-sm relative">
        <Outlet />
      </main>
    </div>
  );
}
