import React from 'react';
import LineChartComponent from './LineChartComponent'; // Импортируем компонент LineChart

interface CpuInfo {
  model: string;
  speed: number;
  cores: number;
  currentLoad: number;
}

export interface DataPoint {
  time: string;
  value: number;
}

interface Props {
  cpuInfo: CpuInfo | null;   // Информация о процессоре
  cpuData: DataPoint[];      // Данные для графика загрузки процессора
}

const CpuInfoCard: React.FC<Props> = ({ cpuInfo, cpuData }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Информация о процессоре</h2>
      {cpuInfo ? (
        <ul className="mt-2 text-sm">
          <li><strong>Модель:</strong> {cpuInfo.model}</li>
          <li><strong>Частота:</strong> {cpuInfo.speed} GHz</li>
          <li><strong>Ядер:</strong> {cpuInfo.cores}</li>
          <li>
            <strong>Текущая загрузка:</strong> 
            {cpuInfo.currentLoad !== undefined 
              ? cpuInfo.currentLoad.toFixed(2) 
              : 'Данные отсутствуют'}
          </li>
        </ul>
      ) : (
        <p>Загрузка данных...</p>
      )}

      {/* График загрузки процессора */}
      {cpuData.length > 0 && (
        <LineChartComponent 
          title="Загрузка CPU"
          data={cpuData} // Передаем данные для графика
          dataKey="value" 
          strokeColor="#8884d8" 
        />
      )}
    </div>
  );
};

export default CpuInfoCard;
