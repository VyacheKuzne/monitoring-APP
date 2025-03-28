import React, { useState, useEffect } from "react";
import axios from "axios";
import OperationStatusChart from "../../component/system/OperationStatusChart";
import CpuInfoCard from "../../component/system/CpuInfoCard";
import MemoryInfoCard from "../../component/system/MemoryInfoCard";
import NetworkInfoCard from "../../component/system/NetworkInfoCard";
import { DataPoint } from "../../interfaces/dataPoints";

function ServerGraphs() {
  const [systemInfo, setSystemInfo] = useState<any>(null); // Все текущие данные
  const [workStatusData, setWorkStatusData] = useState<[]>([]);
  const [cpuData, setCpuData] = useState<DataPoint[]>([]);
  const [ramData, setRamData] = useState<DataPoint[]>([]);
  const [networkReceivedData, setNetworkReceivedData] = useState<DataPoint[]>(
    [],
  );
  const [networkSentData, setNetworkSentData] = useState<DataPoint[]>([]);

  const newInterval = 60000;
  const countPoint = 10;

  useEffect(() => {
    updateSystemData(); // Запрашиваем последние 10 значений loadCPU

    // Устанавливаем интервал для обновления данных каждую 10 секунд
    const interval = setInterval(() => {
      updateSystemData(); // Получаем последние 10 значений loadCPU каждые 10 секунд
    }, newInterval); // 10 секунд
    return () => clearInterval(interval);
  }, []);

  // Запрос на получение данных о процессоре и обновление cpuData для графика
  const updateSystemData = async () => {
    try {
      // Получаем текущие данные
      const currentResponse = await axios.get(
        `http://localhost:3000/system/all`,
      );
      const systemData = currentResponse.data; // Сохраняем все данные системы

      if (
        !systemData ||
        !systemData.cpu ||
        !systemData.memory ||
        !systemData.network ||
        systemData.network.length === 0
      ) {
        console.warn("Загрузка данных графиков");
        return;
      }
      setSystemInfo(systemData); // Устанавливаем все текущие данные
      // Object.entries(systemData).map(([key, value]) => {
      //   console.log(`${key}:`, value);
      // });
      
      // Получаем статистику
      const statsResponse = await axios.get(
        "http://localhost:3000/system/stats",
      );
      const stats = statsResponse.data.stats;
      const workStatus = statsResponse.data.workStatus;

      // Обновляем данные для всех метрик
      setWorkStatusData(workStatus);
      setCpuData(
        createDataPoints(stats, systemData.cpu.currentLoad, "loadCPU"),
      );
      setRamData(createDataPoints(stats, systemData.memory.used, "usedRAM"));
      setNetworkReceivedData(
        createDataPoints(stats, systemData.network[0].received, "received"),
      );
      setNetworkSentData(
        createDataPoints(stats, systemData.network[0].sent, "sent"),
      );
    } catch (error) {
      console.error("Error fetching system data", error);
    }
  };

  const createDataPoints = (
    stats: any[],
    currentValue: number,
    statKey: string,
  ): DataPoint[] => {
    // console.log(statKey);
    const statsPoints = stats.map((stat) => ({
      time: new Date(stat.date).toLocaleTimeString(),
      value: stat[statKey],
    }));
    const currentPoint = {
      time: new Date().toLocaleTimeString(),
      value: currentValue.toFixed(2),
    };
    const allPoints = [...statsPoints, currentPoint];
    return allPoints.slice(0, countPoint);
  };

  return (
    <div>
      {systemInfo &&
      cpuData.length > 0 &&
      ramData.length > 0 &&
      networkReceivedData.length > 0 &&
      networkSentData.length > 0 ? (
        <div className="flex flex-col items-end sm:gap-[3.5vh]">
          <div>
            <OperationStatusChart workStatusData={workStatusData} />
          </div>

          <div className="flex gap-[30px]">
            <CpuInfoCard cpuInfo={systemInfo.cpu} cpuData={cpuData} />
            <MemoryInfoCard ramInfo={systemInfo.memory} ramData={ramData} />
            <NetworkInfoCard
              networkInfo={systemInfo.network}
              receivedData={networkReceivedData}
              sentData={networkSentData}
            />
          </div>
        </div>
      ) : (
        <p className="text8-12px">Загрузка графиков...</p>
      )}
    </div>
  );
}

export default ServerGraphs;
