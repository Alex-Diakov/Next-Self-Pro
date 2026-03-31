import React from 'react';
import { Header } from '../components/layout/Header';
import { Users, Video, BrainCircuit, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function DashboardPage() {
  const stats = [
    { label: 'Total Sessions', value: '124', icon: Video, color: 'text-accent-hover', bg: 'bg-accent-active/20' },
    { label: 'Active Patients', value: '32', icon: Users, color: 'text-success-muted', bg: 'bg-success-bg/20' },
    { label: 'AI Insights Generated', value: '89', icon: BrainCircuit, color: 'text-info-muted', bg: 'bg-info/10' },
    { label: 'Patient Progress', value: '+14%', icon: TrendingUp, color: 'text-warning-muted', bg: 'bg-warning/10' },
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
                <stat.icon className="w-6 h-6" />
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
          className="card-premium rounded-[40px] p-16 text-center relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-primary mb-4 tracking-tight">Ready for your next session?</h2>
            <p className="text-muted mb-10 max-w-lg mx-auto leading-relaxed text-lg">Upload a new video or audio recording to get instant AI-powered clinical insights and transcriptions.</p>
            <Link to="/sessions" className="inline-flex items-center justify-center px-10 py-4 bg-accent text-primary rounded-full font-bold hover:bg-accent-active transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/50 hover:-translate-y-1 focus-ring">
              Go to Sessions
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
