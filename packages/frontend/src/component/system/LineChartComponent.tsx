import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Интерфейсы для данных, которые принимает график
interface DataPoint {
  time: string;
  value: number;
}

interface LineChartComponentProps {
  title: string;
  data: DataPoint[];  // Массив с данными для графика
  dataKey: string;
  strokeColor: string;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ title, data, dataKey, strokeColor }) => {
  return (
    <div className="w-full h-[300px]">
      <h3 className="text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" reversed={true} /> {/* reversed для отображения данных с правой стороны */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={strokeColor} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
