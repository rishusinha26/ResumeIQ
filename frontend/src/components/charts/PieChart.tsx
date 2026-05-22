import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  title?: string;
  labels: string[];
  data: number[];
  colors?: string[];
}

export default function PieChart({ title, labels, data, colors }: PieChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors ?? [
          '#6366f1',
          '#f59e42',
          '#10b981',
          '#f43f5e',
          '#3b82f6',
          '#fbbf24',
          '#a78bfa',
          '#f472b6',
          '#34d399',
          '#f87171',
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: !!title, text: title },
    },
  };
  return <Pie data={chartData} options={options} />;
}
