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
    <div className='flex flex-col gap-[10px] w-full'>
      {cpuInfo ? (
        <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px] text-[12px] text-left">
          <span>Модель: {cpuInfo.model}</span>
          <span>Ядер: {cpuInfo.cores}</span>
          <span>Частота: {cpuInfo.speed} GHz</span>
          <div className='flex gap-[10px] items-center'>
            <span>
              Текущая загрузка: 
              {cpuInfo.currentLoad !== undefined 
                ? cpuInfo.currentLoad.toFixed(2) 
                : 'Данные отсутствуют'}
              %
            </span>
            <div className='min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#18A0FB] rounded-full' />
          </div>
        </div>
      ) : (
        <p>Загрузка данных...</p>
      )}

      {/* График загрузки процессора */}
      {cpuData.length > 0 && (
        <LineChartComponent 
          title=""
          data={cpuData} // Передаем данные для графика
          dataKey="value" 
          strokeColor="#18A0FB" 
          strokeWidth={2}
        />
      )}
      <p className="text12-16px">Информация о процессоре</p>
    </div>
  );
};

export default CpuInfoCard;
