import React from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { QuickWorkspace } from '../components/dashboard/QuickWorkspace';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { motion } from 'motion/react';

export function DashboardPage() {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-auto relative z-10">
        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 h-full min-h-[700px]">
          {/* Quick Workspace (2/3) */}
          <div className="xl:col-span-2">
            <QuickWorkspace />
          </div>

          {/* Recent Activity (1/3) */}
          <div className="xl:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
