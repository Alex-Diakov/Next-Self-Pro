import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon';

interface ActivityItem {
  id: string;
  patient: string;
  date: string;
  duration: string;
  status: 'Analysis Ready' | 'Processing...';
  type: 'video' | 'audio';
}

const activities: ActivityItem[] = [
  { id: '1', patient: 'Sarah Johnson', date: 'Oct 24', duration: '45 min', status: 'Analysis Ready', type: 'video' },
  { id: '2', patient: 'Michael Chen', date: 'Oct 23', duration: '30 min', status: 'Processing...', type: 'audio' },
  { id: '3', patient: 'Emma Wilson', date: 'Oct 22', duration: '50 min', status: 'Analysis Ready', type: 'video' },
  { id: '4', patient: 'Unknown Patient', date: 'Oct 21', duration: '15 min', status: 'Analysis Ready', type: 'audio' },
];

export function RecentActivity() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-surface rounded-[2rem] p-5 lg:p-6 border border-white/10 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary tracking-tight">Recent Sessions</h2>
        <button className="text-sm font-semibold text-accent-hover hover:text-accent transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 custom-scrollbar">
        {activities.map((activity) => (
          <motion.div 
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300 border border-white/5 group relative"
          >
            {/* 1. Thumbnail (Left) */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 transition-all duration-300 ${
              activity.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
            }`}>
              <Icon name={activity.type === 'video' ? 'videocam' : 'mic'} filled className="text-xl" />
            </div>
            
            {/* 2. Content Wrapper (Flexible Center) */}
            <div className="flex-1 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0">
              <div className="flex flex-col min-w-[120px] flex-1">
                <h4 className="text-sm font-bold text-primary truncate tracking-tight">{activity.patient}</h4>
                <p className="text-[10px] font-medium text-muted/60 truncate">{activity.date} • {activity.duration}</p>
              </div>

              <div className="shrink-0">
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors duration-300 ${
                  activity.status === 'Analysis Ready' ? 'bg-success-bg/20 text-success-muted' : 
                  'bg-warning/10 text-warning-muted animate-pulse'
                }`}>
                  <span className="hidden sm:inline">{activity.status}</span>
                </div>
              </div>
            </div>

            {/* 3. Chevron (Right - Always Centered) */}
            <Icon 
              name="chevron_right" 
              className="shrink-0 text-accent-hover opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" 
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="bg-premium-gradient/5 rounded-2xl p-4 border border-accent/10">
          <p className="text-xs font-bold text-accent-hover mb-1 tracking-tight uppercase">Pro Tip</p>
          <p className="text-[11px] font-medium text-muted leading-relaxed">
            Use shortcuts like <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-primary">Cmd+U</kbd> to upload files from anywhere.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
