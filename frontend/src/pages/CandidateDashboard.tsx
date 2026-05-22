import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon, DocumentArrowUpIcon, BriefcaseIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-2xl font-bold">Welcome, {user?.full_name || user?.email || 'Candidate'}!</div>
          <div className="text-gray-500 dark:text-gray-400">ATS Candidate Dashboard</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Logout</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard title="Upload Resume" description="Update your resume" icon={<DocumentArrowUpIcon className="w-8 h-8" />} to="/upload" />
        <DashboardCard title="My Jobs" description="View matched jobs" icon={<BriefcaseIcon className="w-8 h-8" />} to="/jobs" />
        <DashboardCard title="Recommendations" description="Job matches" icon={<SparklesIcon className="w-8 h-8" />} to="/recommendations" />
      </div>
    </div>
  );
}
