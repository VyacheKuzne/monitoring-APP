import React from 'react';
// import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import LineChartComponent from './LineChartComponent'; // Импортируем компонент LineChart
import { DataPoint } from '../../interfaces/dataPoints';

interface RamInfo {
  used: string;
  available: string;
  total: string;
}

interface Props {
  ramInfo: RamInfo | null;
  ramData: DataPoint[];  // Данные для графика
}

const MemoryInfoCard: React.FC<Props> = ({ ramInfo, ramData }) => {
  if (!ramInfo) return null;

  const сonversionGb = (bytes: number | string): string => {
    const bytesNum = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    const gb = bytesNum / (1024 * 1024 * 1024); // Делим на 1024^3 для перевода в GB
    return gb.toFixed(2); // Округляем до 2 знаков после запятой
  };

  const conversionRamDataGb = ramData.map(dataPoint => ({
    ...dataPoint,
    value: Number(сonversionGb(dataPoint.value)), // Преобразуем значение в GB
  }));

  return (
    <div className='flex flex-col gap-[10px] w-full'>
      {/* Информация о памяти */}
        <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px] text-[12px] text-left">
          <span>Всего: {сonversionGb(ramInfo.total)} гб</span>
          <span>Доступно: {сonversionGb(ramInfo.available)} гб</span> 
          <div  className='flex gap-[10px] items-center col-span-2'>
            <span>Сейчас используется: {сonversionGb(ramInfo.used)} гб</span>
            <div className='min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#A54CD9] rounded-full' />
          </div>
        </div>

      {/* График использования RAM */}
      <LineChartComponent 
        title="" 
        data={conversionRamDataGb} 
        dataKey="value" 
        strokeColor="#A54CD9" 
        strokeWidth={2}
      />
      <p className="text12-16px">Информация по оперативной памяти</p>
    </div>
  );
};

export default MemoryInfoCard;
