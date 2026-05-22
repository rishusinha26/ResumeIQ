import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface RecommendationDatum {
  name: string;
  score: number;
}

interface RecommendationVisualizationProps {
  title: string;
  subtitle: string;
  data: RecommendationDatum[];
  emptyMessage: string;
}

const breakdownColors = ['#22d3ee', '#38bdf8', '#a78bfa'];

export function RecommendationVisualization({ title, subtitle, data, emptyMessage }: RecommendationVisualizationProps) {
  const bounded = data.slice(0, 6);
  const pieData = [
    { name: 'Strong fit', value: data.filter((item) => item.score >= 75).length },
    { name: 'Review', value: data.filter((item) => item.score >= 55 && item.score < 75).length },
    { name: 'Explore', value: data.filter((item) => item.score < 55).length },
  ].filter((item) => item.value > 0);

  if (bounded.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Recommendations</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          Live ranking
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
        <div className="min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bounded}>
              <defs>
                <linearGradient id="recommendationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(125, 211, 252, 0.15)',
                  borderRadius: 16,
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#22d3ee"
                strokeWidth={2.5}
                fill="url(#recommendationGradient)"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex min-h-[260px] flex-col justify-between rounded-[1.35rem] border border-white/10 bg-slate-950/40 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Fit breakdown</p>
            <div className="mt-4 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={breakdownColors[index % breakdownColors.length]} />
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
          </div>

          <div className="grid gap-2 text-xs font-medium text-slate-300">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between rounded-full bg-white/5 px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: breakdownColors[index % breakdownColors.length] }} />
                  {entry.name}
                </span>
                <span>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
