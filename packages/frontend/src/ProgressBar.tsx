import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
interface  ProgressBarProps {
    domain: string
}
const ProgressBar: React.FC<ProgressBarProps> = ({domain}) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    socket.on("progress", (data: { progress: number}) => {
      setProgress(data.progress);
      if (data.progress >= 100) {
        setIsProcessing(false);
      }
    });

    return () => {
      socket.off("progress");
    };
  }, []);

  const startProgress = () => {
    setProgress(0);
    setIsProcessing(true);
    socket.emit("startProgress", { domain: domain }); // Можно передавать домен или другие данные
  };

  return (
    <div className="flex flex-col items-center">
        Процесс создания приложения: {progress}%
      <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
        <div
          className="bg-violet-300 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* <button
        onClick={startProgress}
        disabled={isProcessing}
        className={`mt-4 px-4 py-2 text-white rounded-lg ${
          isProcessing ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
        }`}
      >
        {isProcessing ? "В процессе..." : "Старт прогресса"}
      </button> */}
    </div>
  );
};

export default ProgressBar;
