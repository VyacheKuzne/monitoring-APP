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
  domain?: Domain | null; // Добавляем поле для данных о домене
}
