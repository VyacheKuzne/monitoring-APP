import React from 'react';

const OperationStatusChart = () => {

const hours = 24;
const workStatus = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];

  return (
    <div className='flex flex-col gap-[10px] w-full mt-[27px]'>
        <div className='flex gap-[8px] items-center'>
            {hours ? (
                [...Array(Math.floor(hours / 6))].map((_, index) => (
                <React.Fragment key={`status-${index}`}>
                    <div className='relative flex justify-center'>
                        <div className='absolute top-[-27px] text-[12px]'> {index * 6}:00 - {(index + 1) * 6}:00</div>
                        <div className='flex gap-[8px]'>
                            {[...Array(6)].map((_, groupIndex) => (
                            <div key={`status-${groupIndex}`} className={`w-[12px] h-[40px] rounded-full ${workStatus[groupIndex + (index * 6)] ? 'bg-green-500' : 'bg-red-600'}`} />
                            ))}
                        </div>
                    </div>
                    {(index + 1 !== Math.floor(hours / 6)) ? (
                        <div key={`divider-${index}`} className="w-[6px] h-[6px] bg-gray-600 rounded-full" />
                    ) : null}
                </React.Fragment>
            ))) : null}
        </div>
        <p className="text12-16px">Работа сервера за последние {hours} часа</p>
    </div>
  );
};

export default OperationStatusChart;
