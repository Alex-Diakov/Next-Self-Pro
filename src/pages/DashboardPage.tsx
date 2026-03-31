import React from 'react';
import { Header } from '../components/layout/Header';
import { Icon } from '../components/ui/Icon';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function DashboardPage() {
  const stats = [
    { label: 'Total Sessions', value: '124', iconName: 'videocam', color: 'text-accent-hover', bg: 'bg-accent-active/20' },
    { label: 'Active Patients', value: '32', iconName: 'group', color: 'text-success-muted', bg: 'bg-success-bg/20' },
    { label: 'AI Insights Generated', value: '89', iconName: 'psychology', color: 'text-info-muted', bg: 'bg-info/10' },
    { label: 'Patient Progress', value: '+14%', iconName: 'trending_up', color: 'text-warning-muted', bg: 'bg-warning/10' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full relative">
      <Header title="Dashboard" subtitle="Welcome back, Dr. Therapist" />
      <div className="flex-1 overflow-auto p-6 lg:p-10 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              variants={itemVariants}
              className="card-premium p-7 group relative overflow-hidden"
            >
              {/* Subtle hover gradient */}
              <div className="absolute -inset-px bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-5 border border-border-subtle group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                <Icon name={stat.iconName} filled className="text-2xl" />
              </div>
              <p className="text-muted text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-primary tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          className="card-premium rounded-[40px] p-16 text-center relative overflow-hidden border-t-white/20"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-primary mb-6 tracking-tight leading-tight">Ready for your next session?</h2>
            <p className="text-muted mb-10 max-w-xl mx-auto leading-relaxed text-xl font-medium">Upload a new video or audio recording to get instant AI-powered clinical insights and transcriptions.</p>
            <Link to="/sessions" className="inline-flex items-center justify-center px-12 py-4.5 bg-premium-gradient text-background rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-accent/40 border-t border-white/20 glow-accent">
              Go to Sessions
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
