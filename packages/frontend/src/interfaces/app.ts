export interface App {
    idApp: number | null;
    parentServer: number;
    parentDomain: number | null;
    name: string;
    // checkPage: CheckPage[]; // Assuming CheckPage is a type or interface
    notification: Notification[]; // Assuming Notification is a type or interface
    server: Server; // Assuming Server is a type or interface
    domain?: Domain; // Assuming Domain is a type or interface
}
export interface Domain {
    idDomain: number;
    name: string;
    registered: Date | null;
    expires: Date | null;
    updated: Date | null;
    nameRegistar: string | null;
    nameOwner: string | null;
    access: boolean | null;
  }
  
  export interface Server {
    idServer: number;
    parentCompany: string;
    ipAddress: string;
    hostname: string;
    location: string;
    os: string;
    created: Date;
    updated: Date;
    domain?: Domain | null;  // Добавляем поле для данных о домене
  }
  export interface CheckPage {
    idCheckPage: number;
    parentApp?: number | null;
    urlPage: string;
    statusLoadPage: string;
    statusLoadContent: string;
    statusLoadDOM: string;
    statusLoadMedia: string;
    statusLoadStyles: string;
    statusLoadScripts: string;
    requestTime: number;
    responseTime: number;
    responseRate: number;
    date: Date;
    app?: App | null; // Связь с таблицей app (один ко многим)
  }
export type AppData = App | App[];
