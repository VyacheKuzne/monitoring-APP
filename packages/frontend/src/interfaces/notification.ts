import { status } from './../../../backend/node_modules/.prisma/client/index.d';
export interface Notification {
  idNotifiction: number;
  text: string;
  parentCompany: number | null;
  parentServer: number | null;
  parentApp: number | null;
  status: string | null;
  date: string;
}
