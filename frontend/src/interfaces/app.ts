import { Server } from "./server";

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
  SSL: SSL[];
}

interface SSL {
  expires: Date | null; // Или Date
}

export interface Page {
  idPage: number;
  title: string;
  urlPage: string;
  checkPage?: CheckPage[];
  
  app?: App | null;
}

export interface CheckPage {
  idCheckPage: number;
  parentPage?: number | null;
  statusLoadPage: string;
  statusLoadContent: string;
  statusLoadDOM: string;
  statusLoadMedia: string;
  statusLoadStyles: string;
  statusLoadScripts: string;
  responseTime: number;
  date: Date;
  
  page?: Page | null; // Связь с таблицей page (один ко многим)
}
export type PageData = Page | Page[];
