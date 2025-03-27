export interface Company {
  idCompany: number;
  name: string;
  server: [{
    idServer: number
  }]
}
export type CompanyData = Company | Company[];
