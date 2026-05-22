import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  title?: string;
  labels: string[];
  data: number[];
  color?: string;
}

export default function BarChart({ title, labels, data, color = '#6366f1' }: BarChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: color,
        borderRadius: 6,
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
  return <Bar data={chartData} options={options} />;
}
