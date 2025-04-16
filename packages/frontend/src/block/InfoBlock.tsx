import React, { useEffect, useState } from "react";
import { pageProps } from "../interfaces/pageprops";
import Crumbs from "../component/Button/Сrumbs";

export default function InfoBlock({ url = [], crumb = [] }: pageProps) {

  return (
    <>
      <div className="flex flex-col w-auto">
        <div className="flex gap-[10px] min-w-1/2 items-center bg-white rounded-md text-left p-[1.5%] shadow-lg">
          {[...Array(crumb.length)].map((_, index) => (
            <div className="flex gap-[10px]" key={index}>
              {index == crumb.length ? (
                <Crumbs crumb={crumb[index]} />
              ) : (
                <Crumbs url={url[index]} crumb={crumb[index]} />
              )}
              {index != crumb.length - 1 ? (
                <p className="text10-20px">/</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
