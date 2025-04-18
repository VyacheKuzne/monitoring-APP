import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://89.104.65.22:3000");
interface ProgressBarProps {
  domain: string;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ domain }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState <string> ('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    socket.on("progress", (data: { progress: number, message: string }) => {
      setProgress(data.progress);
      setMessage(data.message)
      setIsProcessing(true);
      if (data.progress >= 100) {
        setIsProcessing(false);
      }
    });

    return () => {
      socket.off("progress");
    };
  }, []);

  // const startProgress = () => {
  //   setProgress(0);
  //   setIsProcessing(true);
  //   socket.emit("startProgress", { domain: domain }); // Можно передавать домен или другие данные
  // };

  return (
    // <div className={isProcessing ? 'flex flex-col items-center' : 'hidden flex-col items-center'}>
    <div className={isProcessing ? 'flex flex-col items-center' : 'hidden'}>
      Процесс создания приложения: {progress}% <p className="whitespace-nowrap">{message} </p> 
      <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
        <div
          className="bg-violet-300 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%`  }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
