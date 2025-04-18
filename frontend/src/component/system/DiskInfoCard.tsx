import React from "react";
import LineChartComponent from "./LineChartComponent"; // Импортируем компонент для графика

interface DiskInfo {
  device: string;
  mount: string;
  type: string;
  size: number;
  used: number;
  available: number;
  use: number;
}

interface DataPoint {
  time: string;
  value: number;
}

interface Props {
  diskInfo: DiskInfo;
  diskData: DataPoint[]; // Данные для графика использования диска
}

const DiskInfoCard: React.FC<Props> = ({ diskInfo, diskData }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">
        Информация о диске {diskInfo.device} ({diskInfo.mount})
      </h2>
      <ul className="mt-2 text-sm">
        <li>
          <strong>Тип:</strong> {diskInfo.type}
        </li>
        <li>
          <strong>Использовано:</strong> {diskInfo.used / (1024 * 1024 * 1024)}{" "}
          GB
        </li>{" "}
        {/* Преобразуем в GB */}
        <li>
          <strong>Свободно:</strong> {diskInfo.available / (1024 * 1024 * 1024)}{" "}
          GB
        </li>{" "}
        {/* Преобразуем в GB */}
        <li>
          <strong>Общий объем:</strong> {diskInfo.size / (1024 * 1024 * 1024)}{" "}
          GB
        </li>{" "}
        {/* Преобразуем в GB */}
        <li>
          <strong>Использование:</strong> {diskInfo.use}%
        </li>
      </ul>

      {/* График использования диска */}
      <LineChartComponent
        title={`Использование диска ${diskInfo.device}`}
        data={diskData}
        dataKey="value"
        strokeColor="#FF8042"
        strokeWidth={2}
      />
    </div>
  );
};

export default DiskInfoCard;
