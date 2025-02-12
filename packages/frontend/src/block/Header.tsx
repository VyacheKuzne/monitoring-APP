import React from "react";
import logo from '../img/Logo.svg';
// import { useState, } from "react";
import LinkButton from '../component/Button/LinkButton'
import ExitButton from "../component/Button/ExitButton";
 function Header() {
    const linkText = [
        'Вебинары', 'Курсы', 'Практика', 'О нас'
    ]
    // const [linkText, _setlinkText] = useState() 
    return(
        <>
        <header className="flex justify-center border-b-4 border-gray-300">
            <div className="flex w-[1700px] content-center mx-[10px] my-[10px]">
                <div className="flex">
                    <img src={logo} alt="логотип компаниии" />
                </div>
                <div className="flex w-2/5 m-auto justify-between">
                {
                    linkText.map((text, index)=>(
                        <LinkButton key={index} linkText={text} />
                    ))
                }
                </div>
                <div className="flex">
                    <ExitButton/>          
                </div>
            </div>
        </header>
        </>
    )
 }

 export default Header