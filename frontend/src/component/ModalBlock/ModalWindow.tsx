import React from "react";
import PlusSvg from "../../img/Plus.svg";
import { ModalBlockProps } from "../../interfaces/modalblockprops";

const ModalWindow: React.FC<ModalBlockProps> = ({ closeForm, children }) => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[100]">
        <div className="bg-white rounded-[15px] max-w-[80%] h-auto">
          <div className="flex justify-end p-[10px]">
            <button
              className="rotate-45 select-none"
              onClick={() => closeForm(false)}
            >
              <img src={PlusSvg} alt="Закрыть модальное окно" />
            </button>
          </div>
          <div className="px-[30px] pb-[30px]">{children}</div>
        </div>
      </div>

      <div
        className="fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-30"
        onClick={() => closeForm(false)}
      ></div>
    </>
  );
};
export default ModalWindow;
