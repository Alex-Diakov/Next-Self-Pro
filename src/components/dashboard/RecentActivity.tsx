import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon';
import { dbService, SessionRecord } from '../../services/db.service';
import { useNavigate } from 'react-router-dom';
import { safeFormatDate } from '../../lib/utils';

export function RecentActivity() {
  const [activities, setActivities] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const sessions = await dbService.getAllSessions();
        setActivities(sessions.slice(0, 5)); // Show top 5 recent sessions
      } catch (error) {
        console.error('Failed to load recent activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-surface rounded-[2rem] p-5 lg:p-6 border border-border-glass h-full flex flex-col items-center justify-center">
        <Icon name="sync" className="text-3xl animate-spin text-accent mb-4" />
        <p className="text-sm text-subtle font-mono">Loading sessions...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-surface rounded-[2rem] p-5 lg:p-6 border border-border-glass h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary tracking-tight">Recent Sessions</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
            <Icon name="history" className="text-4xl mb-3 text-subtle" />
            <p className="text-sm font-medium text-muted">No recent sessions found.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <motion.div 
              key={activity.id}
              onClick={() => navigate(`/sessions/${activity.id}`)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-surface-glass hover:bg-surface-highlight cursor-pointer transition-all duration-300 border border-border-highlight group relative"
            >
              {/* 1. Thumbnail (Left) */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border-highlight transition-all duration-300 ${
                activity.fileType?.startsWith('video/') ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'
              }`}>
                <Icon name={activity.fileType?.startsWith('video/') ? 'videocam' : 'mic'} filled className="text-xl" />
              </div>
              
              {/* 2. Content Wrapper (Flexible Center) */}
              <div className="flex-1 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0">
                <div className="flex flex-col min-w-[120px] flex-1">
                  <h4 className="text-sm font-bold text-primary truncate tracking-tight">{activity.title}</h4>
                  <p className="text-[10px] font-medium text-muted/60 truncate">
                    {safeFormatDate(activity.date, 'MMM d')} • {(activity.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                <div className="shrink-0">
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors duration-300 ${
                    activity.status === 'completed' ? 'bg-success-bg/20 text-success-muted' : 
                    activity.status === 'processing' ? 'bg-warning/10 text-warning-muted animate-pulse' :
                    'bg-error/10 text-error-muted'
                  }`}>
                    <span className="hidden sm:inline">
                      {activity.status === 'completed' ? 'Analysis Ready' : 
                       activity.status === 'processing' ? 'Processing...' : 'Error'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Chevron (Right - Always Centered) */}
              <Icon 
                name="chevron_right" 
                className="shrink-0 text-accent-hover opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" 
              />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
