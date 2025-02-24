export interface ModalBlockProps {
    closeForm: (modalAction: boolean) => void;
    children?: React.ReactNode;
}


// export interface ModalBlockProps {
//     openModal: (id: string, component: React.ReactNode) => void;
//     closeModal: (id: string) => void;
//     modals: ModalItem[];
//     children?: React.ReactNode;
// }

// interface ModalItem {
//     id: string; // Уникальный идентификатор
//     component: React.ReactNode; // Содержимое модального окна
//     isOpen: boolean; // Состояние открытия
//   }