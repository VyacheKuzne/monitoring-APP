import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Интерфейсы для данных, которые принимает график
interface DataPoint {
    time: string; 
    [key: string]: number | string
}

interface ManyLineChartComponentProps {
  title: string;
  data: DataPoint[];  // Массив с данными для графика
  dataKeys: string[];
  strokeColor: string[];
  strokeWidth: number;
}

const ManyLineChartComponent: React.FC<ManyLineChartComponentProps> = ({ title, data, dataKeys, strokeColor, strokeWidth }) => {
    
    return (
        <div className="w-full h-[130px]">
        <h3 className="text-center">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" reversed={true} tick={{ fontSize: 12 }} /> {/* reversed для отображения данных с правой стороны */}
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {/* <Legend /> */}
            {dataKeys.map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={strokeColor[index]} strokeWidth={strokeWidth} />
            ))}
            </LineChart>
        </ResponsiveContainer>
        </div>
    );
};

export default ManyLineChartComponent;
