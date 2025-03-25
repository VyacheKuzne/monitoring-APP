import React, { useState, useEffect } from "react";
import axios from "axios";
import PlusSvg from "../../img/Plus.svg";
import ModalWindow from "./ModalWindow";
import { ModalBlockProps } from "../../interfaces/modalblockprops";
import { Company } from "../../interfaces/company";

const FormCreateCompany: React.FC<ModalBlockProps> = ({ closeForm }) => {
  const [companyData, setCompanyData] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData(event.target.value);
  };

  const createCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    axios
      .post("http://localhost:3000/create-company/company/create", {
        name: companyData,
      })
      .then((response) => {
        window.location.href = "http://localhost:3001";
      });
  };

  return (
    <>
      <ModalWindow closeForm={closeForm}>
        <form
          className="flex flex-col gap-5 items-center"
          onSubmit={createCompany}
        >
          <div className="flex flex-col">
            <span className="text-left text-[14px] mb-[5px]">
              Название компании
            </span>
            <input
              className="bg-gray-200 rounded-2xl text-[12px] p-[10px] pr-[30px] placeholder:text-[12px]"
              type="text"
              placeholder="Введите название компании"
              value={companyData}
              onChange={handleChange}
            />
          </div>
          <button
            className="w-[50%] p-[5px] bg-slate-200 hover:bg-slate-300 rounded-[5px] text-[14px] font-montserrat transition"
            type="submit"
          >
            Создать
          </button>
        </form>
      </ModalWindow>
    </>
  );
};
export default FormCreateCompany;
