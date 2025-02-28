export interface Notification
{
    idNotifiction: number;
    text: string;
    parentCompany: number | null;
    parentServer: number | null;
    parentApp: number | null;
    date: string;
}