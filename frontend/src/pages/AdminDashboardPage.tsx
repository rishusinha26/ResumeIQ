import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  ClockIcon,
  CloudArrowDownIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  AdminAuditEvent,
  AdminDashboard,
  AdminUserDetail,
  AdminUserSummary,
  fetchAdminAuditLog,
  fetchAdminDashboard,
  fetchAdminUserDetail,
  fetchAdminUsers,
  fetchDashboardOverview,
} from '../api/ats';
import { PageHeader } from '../components/PageHeader';
import { ScoreRing } from '../components/ScoreRing';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  admin: '#f59e0b',
  recruiter: '#38bdf8',
  candidate: '#a78bfa',
};

const sortLabels: Record<string, string> = {
  full_name: 'Name',
  email: 'Email',
  role: 'Role',
  created_at: 'Created',
  last_login_at: 'Last login',
  login_count: 'Logins',
  resume_count: 'Resumes',
  job_count: 'Jobs',
};

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never';
  }
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Never';
  }
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) {
    return;
  }
  const headers = Object.keys(rows[0]);
  const body = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n');
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-cyan-300">{icon}</div>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-cyan-200">
      {type === 'login' ? 'IN' : type === 'resume' ? 'CV' : 'JD'}
    </div>
  );
}

function UserDrawer({
  userDetail,
  onClose,
}: {
  userDetail: AdminUserDetail | null;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-slate-950 text-white shadow-[0_30px_120px_rgba(2,6,23,0.65)]"
        initial={{ x: 48 }}
        animate={{ x: 0 }}
        exit={{ x: 48 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">User detail drawer</p>
            <h3 className="mt-2 text-2xl font-semibold">{userDetail?.user.full_name || userDetail?.user.email || 'Account details'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {userDetail ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Role</p>
                  <p className="mt-2 text-lg font-semibold text-white">{userDetail.user.role}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Logins</p>
                  <p className="mt-2 text-lg font-semibold text-white">{userDetail.user.login_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Resumes</p>
                  <p className="mt-2 text-lg font-semibold text-white">{userDetail.user.resume_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Jobs</p>
                  <p className="mt-2 text-lg font-semibold text-white">{userDetail.user.job_count}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Activity history</p>
                <div className="mt-4 space-y-3">
                  {userDetail.activity.length === 0 ? (
                    <p className="text-sm text-slate-400">No activity history available.</p>
                  ) : (
                    userDetail.activity.slice(0, 16).map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                        <ActivityIcon type={item.type} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                          <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Recent resumes</p>
                  <div className="mt-4 space-y-3">
                    {userDetail.resumes.length === 0 ? (
                      <p className="text-sm text-slate-400">No resumes uploaded.</p>
                    ) : (
                      userDetail.resumes.slice(0, 6).map((item) => (
                        <div key={item.id} className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                          <p className="text-sm font-semibold text-white">{item.filename}</p>
                          <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(item.created_at)}</p>
                          <p className="mt-2 text-xs text-slate-500">Skills: {item.skills.length}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Recent jobs</p>
                  <div className="mt-4 space-y-3">
                    {userDetail.jobs.length === 0 ? (
                      <p className="text-sm text-slate-400">No jobs posted.</p>
                    ) : (
                      userDetail.jobs.slice(0, 6).map((item) => (
                        <div key={item.id} className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                          <p className="text-sm font-semibold text-white">{item.filename}</p>
                          <p className="mt-1 text-xs text-slate-400">Posted {formatDate(item.created_at)}</p>
                          <p className="mt-2 text-xs text-slate-500">Skills: {item.skills.length}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Login timeline</p>
                <div className="mt-4 space-y-3">
                  {userDetail.audit_events.length === 0 ? (
                    <p className="text-sm text-slate-400">No login events recorded.</p>
                  ) : (
                    userDetail.audit_events.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{event.event_type}</p>
                          <p className="text-xs text-slate-400">{event.email}</p>
                        </div>
                        <p className="text-xs text-slate-500">{formatDateTime(event.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminDashboard | null>(null);
  const [overview, setOverview] = useState<{ total_resumes: number; total_jobs: number; total_candidates: number } | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [auditLog, setAuditLog] = useState<AdminAuditEvent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'recruiter' | 'candidate'>('all');
  const [sortField, setSortField] = useState<keyof AdminUserSummary>('last_login_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [dashboard, userSummaries, logs] = await Promise.all([
          user?.role === 'admin' ? fetchAdminDashboard() : fetchDashboardOverview(),
          fetchAdminUsers(),
          fetchAdminAuditLog(),
        ]);
        if (!active) {
          return;
        }
        if ('total_users' in dashboard) {
          setAdminStats(dashboard);
        } else {
          setOverview(dashboard);
        }
        setUsers(userSummaries);
        setAuditLog(logs);
      } catch {
        if (active) {
          setError('Could not load admin data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [user?.role]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setDetailError('');
      return undefined;
    }

    let active = true;
    setDetailLoading(true);
    setDetailError('');
    setSelectedUser(null);
    fetchAdminUserDetail(selectedUserId)
      .then((detail) => {
        if (active) {
          setSelectedUser(detail);
        }
      })
      .catch(() => {
        if (active) {
          setDetailError('Could not load user detail.');
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  const filteredUsers = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const matchesSearch = (entry: AdminUserSummary) => {
      const searchable = [entry.email, entry.full_name || '', entry.role].join(' ').toLowerCase();
      return !lowered || searchable.includes(lowered);
    };

    const matchesRole = (entry: AdminUserSummary) => roleFilter === 'all' || entry.role === roleFilter;

    const sorted = [...users]
      .filter((entry) => matchesRole(entry) && matchesSearch(entry))
      .sort((left, right) => {
        const leftValue = left[sortField];
        const rightValue = right[sortField];

        let comparison = 0;
        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          comparison = leftValue - rightValue;
        } else {
          comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });

    return sorted;
  }, [query, roleFilter, sortDirection, sortField, users]);

  const recruiters = filteredUsers.filter((entry) => entry.role === 'recruiter');
  const students = filteredUsers.filter((entry) => entry.role === 'candidate');
  const admins = filteredUsers.filter((entry) => entry.role === 'admin');
  const loginActiveUsers = users.filter((entry) => entry.last_login_at).length;
  const averageLogins = users.length ? users.reduce((sum, entry) => sum + entry.login_count, 0) / users.length : 0;
  const roleBreakdown = [
    { name: 'Admin', value: admins.length },
    { name: 'Recruiter', value: recruiters.length },
    { name: 'Student', value: students.length },
  ].filter((item) => item.value > 0);
  const topLogins = [...users].sort((left, right) => right.login_count - left.login_count).slice(0, 5);
  const visibleAuditLog = auditLog.slice(0, 10);

  const stats =
    user?.role === 'admin' && adminStats
      ? [
          { label: 'Total users', value: adminStats.total_users, hint: 'All platform accounts', icon: <UserGroupIcon className="h-5 w-5" /> },
          { label: 'Total resumes', value: adminStats.total_resumes, hint: 'Uploaded student resumes', icon: <DocumentTextIcon className="h-5 w-5" /> },
          { label: 'Total jobs', value: adminStats.total_jobs, hint: 'Active recruiter postings', icon: <BriefcaseIcon className="h-5 w-5" /> },
          { label: 'Open recommendations', value: adminStats.open_recommendations, hint: 'Live AI suggestion queue', icon: <ArrowTrendingUpIcon className="h-5 w-5" /> },
        ]
      : overview
        ? [
            { label: 'Total resumes', value: overview.total_resumes, hint: 'System-wide resume uploads', icon: <DocumentTextIcon className="h-5 w-5" /> },
            { label: 'Total jobs', value: overview.total_jobs, hint: 'Job descriptions in the system', icon: <BriefcaseIcon className="h-5 w-5" /> },
            { label: 'Registered candidates', value: overview.total_candidates, hint: 'Candidate accounts available', icon: <UserGroupIcon className="h-5 w-5" /> },
            { label: 'Logged in users', value: loginActiveUsers, hint: 'Users with sign-in activity', icon: <ClockIcon className="h-5 w-5" /> },
          ]
        : [];

  const exportRows = filteredUsers.map((entry) => ({
    name: entry.full_name || '',
    email: entry.email,
    role: entry.role,
    created_at: entry.created_at,
    last_login_at: entry.last_login_at || '',
    login_count: entry.login_count,
    resume_count: entry.resume_count,
    job_count: entry.job_count,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Administrator Control Room"
        description="Review recruiter and student activity, login timelines, account details, and platform-wide ATS usage."
      />

      <StatusMessage type="error" message={error} />

      <motion.div
        className="rounded-[1.75rem] border border-white/10 bg-slate-950 text-white shadow-[0_24px_90px_rgba(2,6,23,0.35)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr] xl:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">Platform governance</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Full visibility across recruiters and students</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor sign-ins, account growth, document uploads, and hiring activity from one secure dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                {loading ? 'Loading live records...' : `${filteredUsers.length} visible accounts`}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                Last sync: live from MongoDB
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Role distribution</p>
                <p className="mt-1 text-lg font-semibold text-white">Account mix</p>
              </div>
              <RectangleGroupIcon className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4}>
                    {roleBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={Object.values(roleColors)[index % Object.values(roleColors).length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.92)',
                      border: '1px solid rgba(125, 211, 252, 0.15)',
                      borderRadius: 16,
                      color: '#e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
              {roleBreakdown.map((entry) => (
                <span key={entry.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} icon={stat.icon} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.35fr]">
        <div className="flex flex-wrap gap-3 rounded-[1.35rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          {(['all', 'admin', 'recruiter', 'candidate'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={[
                'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition',
                roleFilter === role ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-slate-950/40 text-slate-300 hover:bg-slate-900/70',
              ].join(' ')}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, or role"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={() => downloadCsv('admin-user-export.csv', exportRows)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <CloudArrowDownIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">All accounts</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Search, sort, and open user details</h3>
            </div>
            <button
              type="button"
              onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:bg-white/10"
            >
              Sort {sortDirection}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  {(['full_name', 'role', 'created_at', 'last_login_at', 'login_count'] as const).map((field) => (
                    <th key={field} className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSortField(field);
                          setSortDirection((current) => (sortField === field && current === 'desc' ? 'asc' : 'desc'));
                        }}
                        className="flex items-center gap-1 text-left transition hover:text-white"
                      >
                        {sortLabels[field]}
                        <ArrowDownIcon className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3">Counts</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/35">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={7}>
                      No accounts match the current search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((entry) => (
                    <tr key={entry.id} className="transition hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-white">{entry.full_name || 'Unnamed user'}</p>
                          <p className="text-xs text-slate-400">{entry.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                          {entry.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{formatDateTime(entry.created_at)}</td>
                      <td className="px-4 py-4 text-slate-300">{formatDateTime(entry.last_login_at)}</td>
                      <td className="px-4 py-4 text-slate-300">{entry.login_count}</td>
                      <td className="px-4 py-4 text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">Resumes {entry.resume_count}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">Jobs {entry.job_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(entry.id)}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/20"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Login timeline</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Recent sign-ins</h3>
              </div>
              <ClockIcon className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-5 space-y-3">
              {visibleAuditLog.length === 0 ? (
                <p className="text-sm text-slate-400">No login events yet.</p>
              ) : (
                visibleAuditLog.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedUserId(event.user_id)}
                    className="flex w-full items-center justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{event.full_name || event.email}</p>
                      <p className="truncate text-xs text-slate-400">{event.role} · {event.event_type}</p>
                    </div>
                    <p className="text-xs text-slate-500">{formatDateTime(event.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Engagement</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Average login activity</h3>
              </div>
              <ArrowTrendingUpIcon className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-6 flex items-center justify-center">
              <ScoreRing score={Math.min(100, Math.round(averageLogins * 20))} size={180} />
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">
              Higher scores indicate stronger account return frequency.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Role mix</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Platform account breakdown</h3>
            </div>
            <RectangleGroupIcon className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4}>
                  {roleBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={Object.values(roleColors)[index % Object.values(roleColors).length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(125, 211, 252, 0.15)',
                    borderRadius: 16,
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            {roleBreakdown.map((entry) => (
              <span key={entry.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Top accounts</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Most active users</h3>
            </div>
            <ArrowPathIcon className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-5 space-y-3">
            {topLogins.length === 0 ? (
              <p className="text-sm text-slate-400">No activity data available yet.</p>
            ) : (
              topLogins.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedUserId(entry.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.full_name || entry.email}</p>
                    <p className="mt-1 text-xs text-slate-400">{entry.role}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-cyan-100">
                    {entry.login_count} logins
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUserId ? (
        <>
          {detailError ? <StatusMessage type="error" message={detailError} /> : null}
          {detailLoading && !selectedUser ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Loading user detail...</div>
          ) : null}
          <UserDrawer userDetail={selectedUser} onClose={() => setSelectedUserId('')} />
        </>
      ) : null}
    </section>
  );
}
