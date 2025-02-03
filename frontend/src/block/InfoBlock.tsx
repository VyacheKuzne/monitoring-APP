import React from 'react'
import ServerCard from '../component/Card/ServerCard'
export default function InfoBlock() {
  return (
    <>
    <div className='flex flex-col'>
        <div className='w-1/2 my-[2%] mx-[2%] bg-white rounded-md text-left p-[1.5%] shadow-lg'>
            <p className='text10-20px'>Главаня</p>
        </div>
        <div className='flex'>
            <ServerCard/>
        </div>
    </div>
    </>
  )
}
