export interface NotificationData {
  text: string;
  parentCompany: number | null;
  parentServer: number | null;
  parentApp: number | null;
  status: string | null;
  date: Date;
}
