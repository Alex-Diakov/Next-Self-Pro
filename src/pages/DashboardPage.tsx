import React from 'react';
import { Header } from '../components/layout/Header';
import { Users, Video, BrainCircuit, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const stats = [
    { label: 'Total Sessions', value: '124', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Patients', value: '32', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AI Insights Generated', value: '89', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Patient Progress', value: '+14%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back, Dr. Therapist" />
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Ready for your next session?</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Upload a new video or audio recording to get instant AI-powered clinical insights and transcriptions.</p>
          <Link to="/sessions" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors">
            Go to Sessions
          </Link>
        </div>
      </div>
    </>
  );
}
