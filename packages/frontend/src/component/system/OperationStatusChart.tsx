import React, { useEffect } from "react";

interface Props {
  workStatusData: number[]; // Все данные
}

const OperationStatusChart: React.FC<Props> = ({ workStatusData }) => {

    const hours = 24; // Количество часов для анализа
    const groupSize = 6; // размер одной группы часов
    const totalGroups = Math.ceil(hours / groupSize); // Общее количество грапп

    // Текущая дата, округлённая до начала текущего часа
    const now = new Date();
    now.setMinutes(0, 0, 0); // Устанавливаем минуты и секунды в 0

    const getHourLabel = (hourOffset: number) => {
        const hourDate = new Date(now.getTime() + hourOffset * 60 * 60 * 1000);
        return hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='flex flex-col gap-[10px] w-full'>
            <div className='flex items-center'>
                {[...Array(totalGroups)].map((_, groupIndex) => {

                    const startHourOffset = groupIndex * groupSize + 1;
                    const endHourOffset = Math.min(startHourOffset + groupSize, hours  + 1);

                    return (
                        <div key={`group-${groupIndex}`} className='flex items-center gap-[8px]'>
                            <div className='grid grid-cols-[auto_auto] items-center'>
                                <div className='col-start-1 text-[12px] mb-[10px]'> 
                                    {getHourLabel(startHourOffset)} - {getHourLabel(endHourOffset)}
                                </div>
                                <div className='col-start-1 flex gap-[8px]'>
                                    <div className='flex gap-[8px]'>
                                        {[...Array(groupSize)].map((_, indexInGroup) => {

                                            const hourIndex = (startHourOffset + indexInGroup);
                                            return (
                                                <div
                                                    key={`status-${hourIndex}`}
                                                    className={`w-[12px] h-[40px] rounded-full ${
                                                        workStatusData[hourIndex - 1] ? 'bg-custom-green' : 'bg-custom-red'
                                                    }`}
                                                    title={`Период с ${getHourLabel(hourIndex)} по ${getHourLabel(hourIndex + 1)}`}
                                                />
                                            );                          
                                        })}
                                    </div>
                                </div>
                                {groupIndex + 1 < totalGroups && (
                                    <div key={`divider-${groupIndex}`} className="w-[6px] h-[6px] bg-gray-600 rounded-full m-[8px]" />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <p className="text12-16px">Работа сервера за последние {hours} часа</p>
        </div>
    )
};

export default OperationStatusChart;
