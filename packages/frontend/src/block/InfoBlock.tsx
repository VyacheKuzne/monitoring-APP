import React, { useEffect, useState } from 'react'
import { pageProps } from '../interfaces/pageprops'
import Crumbs from '../component/Button/Сrumbs'

export default function InfoBlock({url = [], crumb = []}: pageProps ) {

    // const urls = Array.isArray(url) ? url : [url];
    // const crumbs = urls.map((u: string, index: number) => ({
    //   url: index ===  ? '' : u,
    //   crumb: crumb[index],
    // }));
    // console.log(crumbs);

  return (
    <>
    <div className='flex flex-col'>
      <div className='flex gap-[10px] items-center w-1/2 bg-white rounded-md text-left p-[1.5%] shadow-lg'>
        {[...Array(crumb.length)].map((_, index) => (
          <div className='flex gap-[10px]' key={index}>
            {index == crumb.length ? <Crumbs crumb={crumb[index]} /> : <Crumbs url={url[index]} crumb={crumb[index]} />}
            {index != crumb.length - 1 ? <p className='text10-20px'>/</p> : null}
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
