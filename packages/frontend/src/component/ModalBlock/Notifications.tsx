import React, { useState, useEffect } from "react";
import axios from "axios";
import { Notification } from "../../interfaces/notification";

function Notifications() {
  useEffect(() => {
    getInfo();
  }, []);

  const [notificationData, setNotificationData] = useState<Notification[]>([]);

  const getInfo = async () => {
    axios.get("http://localhost:3000/notifications/get").then((response) => {
      setNotificationData(response.data);
      console.log(response.data);
    });
  };

  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);
    return `${String(dateObject.getDate()).padStart(2, "0")}.${String(dateObject.getMonth() + 1).padStart(2, "0")}.${dateObject.getFullYear()} в
        ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="absolute z-10">
        <div className="absolute bg-white w-[500px] h-screen p-[30px] shadow-xl z-[1]">
          <p className="text-[16px] font-montserrat">Уведомления</p>
          <hr className="my-[5%] h-[2px] bg-slate-600" />
          <div className="flex flex-col gap-[15px]">
            {notificationData.length !== 0 ? (
              notificationData.map((notification, index) => (
                <div className="grid grid-cols-[10px_auto] gap-[15px]">
                  <div className={notification.status === 'notification' ? 'bg-custom-green w-[10px] h-[10px] mt-[5px] rounded-full' : 'bg-custom-red w-[10px] h-[10px] mt-[5px] rounded-full'}></div>
                  <div className="flex flex-col gap-[5px] text-left">
                    <span className=" text-[14px]">{notification.text}</span>
                    <span className=" text-[12px]">
                      {formatDate(notification.date)}
                    </span>
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
