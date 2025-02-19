import React, { useEffect, useState } from 'react'
import { pageProps } from '../interfaces/pageprops'
import Crumbs from '../component/Button/Сrumbs'

export default function InfoBlock({page, url = [], crumb = []}: pageProps ) {

    const urls = Array.isArray(url) ? url : [url];
    const crumbs = urls.map((u: string, index: number) => ({
      url: u,
      crumb: crumb[index],
    }));
    console.log(crumbs);

  return (
    <>
    <div className='flex flex-col'>
      <div className='flex gap-[10px] items-center w-1/2 bg-white rounded-md text-left p-[1.5%] shadow-lg'>
        {crumbs.length === 0 ? <p className='text10-20px'>{ page }</p> : 
        <a className='text10-20px' href={`${url[0]}`}>{ page }</a>}
        {crumbs.map((itemCrumb: { url: string; crumb: string }, index: number) => (
          <React.Fragment key={index}>
            <p className='text10-20px'>/</p>
            {index == crumbs.length ? <Crumbs url={itemCrumb.url} crumb={itemCrumb.crumb} /> : 
            <Crumbs crumb={itemCrumb.crumb} />}
            
          </React.Fragment>
        ))}
      </div>
    </div>
    </>
  )
}
