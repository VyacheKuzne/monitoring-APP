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
    details: any; // Замените на более конкретный интерфейс, если нужно
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
    parentStatus: number | null;
    fingerprint: string;
    publickey: string;
    privatekey: string;
    version: string;
  }