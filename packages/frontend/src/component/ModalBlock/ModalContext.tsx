// import React, { createContext, useState, useContext } from 'react';
// import { ModalBlockProps } from '../../interfaces/modalblockprops'

// const ModalContext = createContext<ModalBlockProps | undefined>(undefined);

// export const ModalProvider: React.FC<ModalBlockProps> = ({ children }) => {
//   const [modals, setModals] = useState<ModalItem[]>([]);

//   const openModal = (id: string, component: React.ReactNode) => {
//     setModals(prev => {
//       const existingModal = prev.find(m => m.id === id);
//       if (existingModal) {
//         // Если модальное окно уже существует, обновляем его состояние
//         return prev.map(m =>
//           m.id === id ? { ...m, isOpen: true } : m
//         );
//       }
//       // Добавляем новое модальное окно
//       return [...prev, { id, component, isOpen: true }];
//     });
//   };

//   const closeModal = () => {
//     setModals(prev =>
//         prev.map(m => (m.id === id ? { ...m, isOpen: false } : m))
//       );
//   };

//   const contextValue: ModalBlockProps = {
//     modals,
//     openModal,
//     closeModal,
//   };

//   return (
//     <ModalContext.Provider value={contextValue}>
//       {children}
//       {modals.map((modal, index) => (
//         <div
//           key={index}
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             zIndex: 100 + index, // Увеличиваем z-index для каждого окна
//             background: 'rgba(0, 0, 0, 0.5)', // Полупрозрачный фон
//           }}
//         >
//           {modal}
//         </div>
//       ))}
//     </ModalContext.Provider>
//   );
// };

// export const useModal = () => {
//   const context = useContext(ModalContext);
//   if (!context) throw new Error('useModal must be used within a ModalProvider');
//   return context;
// };