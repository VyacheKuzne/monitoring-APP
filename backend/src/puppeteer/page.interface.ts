export interface PageData {
  parentApp: number;
  title: string;
  urlPage: string;
}

export interface СheckPageData {
  parentPage?: number;
  statusLoadPage: string;
  statusLoadContent: string;
  statusLoadDOM: string;
  mediaStatus: string;
  styleStatus: string;
  scriptStatus: string;
  responseTime: string;
}
