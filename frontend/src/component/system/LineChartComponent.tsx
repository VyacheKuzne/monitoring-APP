import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Интерфейсы для данных, которые принимает график
interface DataPoint {
  time: string;
  value: number;
}

interface LineChartComponentProps {
  title: string;
  data: DataPoint[]; // Массив с данными для графика
  dataKey: string;
  strokeColor: string;
  strokeWidth: number;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  title,
  data,
  dataKey,
  strokeColor,
  strokeWidth,
}) => {
  return (
    <div className="w-full min-h-[130px]">
      <h3 className="text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -35 }}>
          <defs>
            <linearGradient id={strokeColor} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.85} />
              <stop offset="75%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(time) => time.slice(0, 5)} reversed={true} tick={{ fontSize: 12 }} />{" "}
          {/* reversed для отображения данных с правой стороны */}
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {/* <Legend /> */}
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth}
            fill={`url(#${strokeColor})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
