import React from "react";
import ExitSvg from "../../img/exit.svg";
export default function NotificationButton() {
  return (
    <>
      <button className="flex items-center mx-[5%]">
        <img src={ExitSvg} alt="Кнопка выхода" className="w-[25px] h-[25px]" loading="lazy" />
        <p className="mx-[10%]">Выйти</p>
      </button>
    </>
  );
}
