import React from "react";
import ExitSvg from "../../img/exit.svg";
import axios from "axios";
export default function NotificationButton() {
  async function getData() {
    try {
      const response = await axios.get('http://89.104.65.22:3000/system/all')
      console.log(response.data)
    } catch (error) {
      
    }
  }
  return (
    <>
      <button className="flex items-center mx-[5%]" onClick={getData}>
        <img src={ExitSvg} alt="Кнопка выхода" />
        <p className="mx-[10%]">Выйти</p>
      </button>
    </>
  );
}
