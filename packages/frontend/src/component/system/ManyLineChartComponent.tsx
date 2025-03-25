import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Интерфейсы для данных, которые принимает график
interface DataPoint {
  time: string;
  [key: string]: number | string;
}

interface ManyLineChartComponentProps {
  title: string;
  data: DataPoint[]; // Массив с данными для графика
  dataKeys: string[];
  strokeColor: string[];
  strokeWidth: number;
}

const ManyLineChartComponent: React.FC<ManyLineChartComponentProps> = ({
  title,
  data,
  dataKeys,
  strokeColor,
  strokeWidth,
}) => {
  return (
    <div className="w-full h-[130px]">
      <h3 className="text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {dataKeys.map((_, index) => (
              <linearGradient id={strokeColor[index]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor[index]} stopOpacity={0.85} />
                <stop offset="75%" stopColor={strokeColor[index]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" reversed={true} tick={{ fontSize: 12 }} />{" "}
          {/* reversed для отображения данных с правой стороны */}
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {/* <Legend /> */}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={strokeColor[index]}
              strokeWidth={strokeWidth}
              fill={`url(#${strokeColor[index]})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManyLineChartComponent;
