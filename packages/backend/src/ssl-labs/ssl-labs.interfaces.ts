export interface SSLInfo {
    host: string;
    port: number;
    protocol: string;
    endpoints: SSLEndpoint[];
    status: string;
    startTime: number;
    testTime: number;
    engineVersion: string;
    criteriaVersion: string;
    certs?: CertInfo[];
  }

  interface CertInfo {
    serialNumber?: string;
    issuerSubject?: string;
    notBefore?: number;
    notAfter?: number;
    sha256Hash?: string;
    publicKey?: string;
  }
  
  export interface SSLEndpoint {
    ipAddress: string;
    serverName: string;
    statusMessage: string;
    grade: string;
    hasWarnings: boolean;
    isExceptional: boolean;
    progress: number;
    duration: number;
    delegation: number;
    protocol?: string;
    details: {
      protocols: 
      { 
        name: string; 
        version: string 
      }[];
      cert?: {
        serialNumber: string;
        issuer: string;
        validFrom: number;
        validTo: number;
        sha256Fingerprint: string;
        version: number;
        publicKey?: string;
      };
    };  
  }
  
  export interface SSLInfoAPI {
      queue: number;
      criteriaVersion: string;
      engines: Engine[];
  }
  
  export interface Engine {
      name: string;
      version: string;
      date: string;
  }

  export interface SSLData {
    serialNumber: string;
    namePublisher: string;
    registered: Date;
    expires: Date;
    fingerprint: string;
    publickey: string;
    privatekey: string;
    version: string;
  }
