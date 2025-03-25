import React, { useState, useEffect } from "react";
import axios from "axios";
import PlusSvg from "../../img/Plus.svg";
import ModalWindow from "./ModalWindow";
import { ModalBlockProps } from "../../interfaces/modalblockprops";

const FormCreateServer: React.FC<ModalBlockProps> = ({ closeForm }) => {
  return (
    <>
      <ModalWindow closeForm={closeForm}></ModalWindow>
    </>
  );
};
export default FormCreateServer;
