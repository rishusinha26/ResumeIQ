import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  title?: string;
  labels: string[];
  data: number[];
  color?: string;
}

export default function LineChart({ title, labels, data, color = '#0ea5e9' }: LineChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}33`,
        tension: 0.35,
        fill: true,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };
  return <Line data={chartData} options={options} />;
}
