import React from "react";
import PlusSvg from "../../img/Plus.svg";

interface ModalBlockProps {
  openForm: (modalAction: boolean) => void;
}

const CreateCompanyButton: React.FC<ModalBlockProps> = ({ openForm }) => {
  return (
    <>
      <button onClick={() => openForm(true)} className="w-full flex gap-[15px]">
        <img src={PlusSvg} alt="Создать новую компанию" />
        <p className="">Добавить компанию</p>
      </button>
    </>
  );
};
export default CreateCompanyButton;
