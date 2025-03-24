import React, { useEffect } from 'react';

interface Props {
  allData: any[];      // Все данные
}

const OperationStatusChart: React.FC<Props> = ({ allData }) => {

    // console.log(allData);

    const hours = 24; // Количество часов для анализа
    const threshold = 5; // Порог количества "нулевых" записей для считать час "плохим"
    const groupSize = 6; // размер одной группы часов
    const totalGroups = Math.ceil(hours / groupSize); // Общее количество грапп
  
    // Текущая дата, округлённая до начала текущего часа
    const now = new Date();
    now.setMinutes(0, 0, 0); // Устанавливаем минуты и секунды в 0
  
    // Инициализируем массив статусов для 24 часов
    const workStatus: number[] = new Array(hours).fill(0);
  
    // Объект для подсчёта записей по часам
    const hourlyStats: { [key: number]: { total: number; zeros: number } } = {};
  
    // Обрабатываем все данные
    allData.forEach((data) => {
      const dataDate = new Date(data.date);
      const hourDiff = Math.floor((now.getTime() - dataDate.getTime()) / (60 * 60 * 1000));

      if (hourDiff >= 0 && hourDiff < hours) {
        hourlyStats[hourDiff] = hourlyStats[hourDiff] || { total: 0, zeros: 0 };
        hourlyStats[hourDiff].total += 1;

        if ((data.loadCPU || data.loadRAM || data.received || data.sent) === 0) {
          hourlyStats[hourDiff].zeros += 1;
        }
      }
    });
  
    // Определяем статус для каждого часа
    for (let i = 0; i < hours; i++) {
      const statsForHour = hourlyStats[i] || { total: 0, zeros: 0 };
      // Если нет данных или слишком много "нулевых" записей, статус = 0
      workStatus[i] = statsForHour.total === 0 || statsForHour.zeros >= threshold ? 0 : 1;
    }

    const reversedWorkStatus = [...workStatus].reverse(); // Переворачиваем массив

    const getHourLabel = (hourOffset: number) => {
        const hourDate = new Date(now.getTime() + hourOffset * 60 * 60 * 1000);
        return hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='flex flex-col gap-[10px] w-full mt-[27px]'>
            <div className='flex gap-[8px] items-center'>
                {[...Array(totalGroups)].map((_, groupIndex) => {

                    const startHourOffset = groupIndex * groupSize;
                    const endHourOffset = Math.min(startHourOffset + groupSize + 1, hours + 1);

                    return (
                        <div key={`group-${groupIndex}`} className='flex items-center gap-[8px]'>
                            <div className='relative flex justify-center'>
                                <div className='absolute top-[-27px] text-[12px]'> 
                                    {getHourLabel(startHourOffset + 1)} - {getHourLabel(endHourOffset)}
                                </div>
                                <div className='flex gap-[8px]'>
                                    {[...Array(groupSize)].map((_, indexInGroup) => {

                                        const hourIndex = startHourOffset + indexInGroup;
                                        return (
                                            <div
                                            key={`status-${hourIndex}`}
                                            className={`w-[12px] h-[40px] rounded-full ${
                                                reversedWorkStatus[hourIndex] ? 'bg-green-500' : 'bg-red-600'
                                            }`}
                                            title={`Час ${getHourLabel(hourIndex)}`}
                                            />
                                        );                          
                                    })}
                                </div>
                            </div>
                            {groupIndex + 1 < totalGroups && (
                                <div key={`divider-${groupIndex}`} className="w-[6px] h-[6px] bg-gray-600 rounded-full" />
                            )}
                        </div>
                    )
                })}
            </div>
            <p className="text12-16px">Работа сервера за последние {hours} часа</p>
        </div>
    );
};

export default OperationStatusChart;
