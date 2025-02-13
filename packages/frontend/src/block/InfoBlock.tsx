import React from 'react'

interface pageProps {
  page?: string;
}

export default function InfoBlock({page}: pageProps ) {
  return (
    <>
    <div className='flex flex-col'>
        <div className='w-1/2 my-[2%] mx-[2%] bg-white rounded-md text-left p-[1.5%] shadow-lg'>
            <p className='text10-20px'>{ page }</p>
        </div>
        <div className='flex'>
        </div>
    </div>
    </>
  )
}
