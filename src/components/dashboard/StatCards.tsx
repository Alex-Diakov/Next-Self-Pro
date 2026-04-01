import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../ui/Icon';

interface Stat {
  label: string;
  value: string;
  subtitle: string;
  iconName: string;
  color: string;
  bg: string;
}

const stats: Stat[] = [
  { label: 'Pending Notes', value: '3', subtitle: 'Drafts ready for review', iconName: 'description', color: 'text-accent-hover', bg: 'bg-accent-active/20' },
  { label: 'Next Session', value: '14:00', subtitle: 'Sarah J. (Anxiety tracking)', iconName: 'calendar_today', color: 'text-success-muted', bg: 'bg-success-bg/20' },
  { label: 'Weekly Pattern', value: 'Elevated Stress', subtitle: 'Detected in 4 recent patients', iconName: 'psychology', color: 'text-info-muted', bg: 'bg-info/10' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function StatCards() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {stats.map((stat) => (
        <motion.div 
          key={stat.label} 
          variants={itemVariants}
          className="bg-surface rounded-2xl p-4 border border-white/10 group relative overflow-hidden flex items-center gap-4"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
            <Icon name={stat.iconName} filled className="text-xl" />
          </div>
          <div>
            <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
            <p className="text-xl font-bold text-primary tracking-tight leading-none mb-1">{stat.value}</p>
            <p className="text-[10px] font-medium text-muted/80 truncate max-w-[120px]">{stat.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
