import React from "react";
// import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import ManyLineChartComponent from "./ManyLineChartComponent"; // Импортируем компонент LineChart
import { DataPoint } from "../../interfaces/dataPoints";

interface NetworkInfo {
  received: string;
  sent: string;
}

interface Props {
  networkInfo: NetworkInfo | null;
  receivedData: DataPoint[]; // Данные для графика
  sentData: DataPoint[]; // Данные для графика
}

const NetworkInfoCard: React.FC<Props> = ({
  networkInfo,
  receivedData,
  sentData,
}) => {
  if (!networkInfo) return null;

  const сonversionMb = (bytes: number | string): string => {
    const bytesNum = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    const gb = bytesNum / (1024 * 1024); // Делим на 1024^3 для перевода в MB
    return gb.toFixed(2); // Округляем до 2 знаков после запятой
  };

  // const sumField = (data: NetworkInterface[], field: keyof NetworkInterface): number =>
  //     data.reduce((sum, item) => sum + (item[field] as number), 0);

  const networkData = receivedData.map((received, index) => {
    return {
      time: received.time,
      received: сonversionMb(receivedData[index].value),
      sent: сonversionMb(sentData[index].value),
    };
  });

  return (
    <div className="flex flex-col gap-[10px] w-full">
      {/* Информация о памяти */}
      <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px] text-[12px] text-left">
        <div className="flex gap-[10px] items-center col-span-2">
          <span>Получено пакетов: {networkData[0].received} мб</span>
          <div className="min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#2FBD12] rounded-full" />
        </div>
        <div className="flex gap-[10px] items-center col-span-2">
          <span>Отправлено пакетов: {networkData[0].sent} мб</span>
          <div className="min-w-[10px] w-[10px] min-h-[10px] h-[10px] bg-[#444347] rounded-full" />
        </div>
      </div>

      {/* График использования RAM */}
      <ManyLineChartComponent
        title=""
        data={networkData}
        dataKeys={["received", "sent"]}
        strokeColor={["#2FBD12", "#444347"]}
        strokeWidth={2}
      />
      <p className="text12-16px">Информация по сетевым пакетам</p>
    </div>
  );
};

export default NetworkInfoCard;
