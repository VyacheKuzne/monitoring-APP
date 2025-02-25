import React from 'react';
// import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import LineChartComponent from './LineChartComponent'; // Импортируем компонент LineChart

interface MemoryInfo {
  used: string;
  available: string;
  total: string;
}

interface DataPoint {
  time: string;
  value: number;
}

interface Props {
  memoryInfo: MemoryInfo | null;
  ramData: DataPoint[];  // Данные для графика
}

const MemoryInfoCard: React.FC<Props> = ({ memoryInfo, ramData }) => {
  if (!memoryInfo) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center">
      <h2 className="text-lg font-semibold">Использование RAM</h2>
      {/* Информация о памяти */}
      <p className="text-sm mt-2">
        <strong>Использовано:</strong> {memoryInfo.used} GB / {memoryInfo.total} GB
      </p>
      <p className="text-sm">
        <strong>Свободно:</strong> {memoryInfo.available} GB
      </p>

      {/* График использования RAM */}
      <LineChartComponent 
        title="Использование RAM" 
        data={ramData} 
        dataKey="value" 
        strokeColor="#FF8042" 
      />
    </div>
  );
};

export default MemoryInfoCard;
