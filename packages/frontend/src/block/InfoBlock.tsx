import React from 'react'
import { pageProps } from '../interfaces/pageprops'
import Crumbs from '../component/Button/Сrumbs'

export default function InfoBlock({page, url, crumb}: pageProps ) {
  return (
    <>
    <div className='flex flex-col'>
      <div className='w-1/2 my-[2%] mx-[2%] bg-white rounded-md text-left p-[1.5%] shadow-lg'>
        <p className='text10-20px'>{ page }</p>
        {/* {.map((index) (
          <p>/</p>
          <Crumbs url={url} crumb={crumb} />  
        ))} */}
      </div>
    </div>
    </>
  )
}
