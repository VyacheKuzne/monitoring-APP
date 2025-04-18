import React, { useState, useEffect } from "react";
import axios from "axios";
import { Notification } from "../../interfaces/notification";

function Notifications() {
  useEffect(() => {
    getInfo();
  }, []);

  const [notificationData, setNotificationData] = useState<Notification[]>([]);

  const getInfo = async () => {
    axios.get("http://89.104.65.22:3000/notifications/get").then((response) => {
      setNotificationData(response.data);
      // console.log(response.data);
    });
  };

  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);
    return `${String(dateObject.getDate()).padStart(2, "0")}.${String(dateObject.getMonth() + 1).padStart(2, "0")}.${dateObject.getFullYear()} в
        ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
  };

  const generateLink = (
    company: number | null, 
    server: number | null,
    app: number | null
  ) => {
    const parts = [
      { key: 'company', value: company },
      { key: 'server', value: server },
      { key: 'app', value: app }
    ];
  
    const url = "http://localhost:3001";
    const linkParts = parts
      .filter(part => part.value !== null) // Оставляем только непустые значения
      .map(part => `${part.key}/${part.value}`); // Формируем сегменты пути
  
    return linkParts.length > 0 ? `${url}/${linkParts.join('/')}/` : '';
  }

  return (
    <>
      <div className="absolute z-10">
        <div className="absolute bg-white w-[500px] h-screen p-[30px] shadow-xl z-[1]">
          <p className="text-[16px] font-montserrat">Уведомления</p>
          <hr className="my-[5%] h-[2px] bg-slate-600" />
          <div className="flex flex-col gap-[15px] h-[calc(100%-60px)] overflow-y-auto mb-[30px] 
                          [&::-webkit-scrollbar]:w-[5px] 
                          [&::-webkit-scrollbar-thumb]:bg-gray-500 
                          [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {notificationData.length !== 0 ? (
              notificationData.map((notification, index) => (
                <div className="grid grid-cols-[10px_auto] gap-[15px]" key={index}>
                  <div className={`w-[10px] h-[10px] mt-[5px] rounded-full 
                    ${notification.status === 'alert' ? 'bg-custom-red' : notification.status === 'warning' ? 
                    'bg-custom-yellow' : 'bg-custom-green'}`} />
                  <div className="flex flex-col gap-[5px] text-left">
                    <span className="text-[14px]">{notification.text}</span>
                    <div className="flex gap-[10px] text-[12px]">
                      <span>{formatDate(notification.date)}</span>
                      {generateLink(notification.parentCompany, notification.parentServer, notification.parentApp) !== '' ? 
                        <a href={generateLink(notification.parentCompany, notification.parentServer, notification.parentApp)}>
                          Перейти
                        </a> : null
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[14px]">Нет уведомлений</div>
            )}
          </div>
        </div>
        <div className="w-screen h-screen bg-black opacity-50"></div>
      </div>
    </>
  );
}
export default Notifications;
