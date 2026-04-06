import React from 'react';
import { Icon } from '../../../ui/Icon';
import { motion } from 'motion/react';
import { cn } from '../../../../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'accent' | 'success' | 'warning' | 'info';
  delay?: number;
}

export function StatsCard({ label, value, icon, trend, color, delay = 0 }: StatsCardProps) {
  const colorClasses = {
    accent: "bg-accent/10 text-accent-hover border-accent/20",
    success: "bg-success/10 text-success-muted border-success/20",
    warning: "bg-warning/10 text-warning-muted border-warning/20",
    info: "bg-info/10 text-info-muted border-info/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="card-premium p-5 flex items-center gap-5 group"
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-lg",
        colorClasses[color]
      )}>
        <Icon name={icon} filled className="text-2xl" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-subtle uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-primary tracking-tight">{value}</h4>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              trend.isPositive ? "bg-success/10 text-success-muted" : "bg-error/10 text-error-muted"
            )}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
