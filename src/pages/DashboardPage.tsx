import React from 'react';
import { QuickWorkspace } from '../components/dashboard/QuickWorkspace';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 h-full min-h-full relative">
      <div className="flex-1 overflow-auto relative z-10 flex flex-col">
        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
          {/* Quick Workspace (2/3) */}
          <div className="xl:col-span-2 h-full">
            <QuickWorkspace />
          </div>

          {/* Recent Activity (1/3) */}
          <div className="xl:col-span-1 h-full">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
