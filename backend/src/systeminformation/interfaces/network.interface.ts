export interface NetworkData {
    iface: string;       // Interface name
    ip4: string;         // IPv4 address
    ip6: string;         // IPv6 address
    received: number;    // Bytes received
    sent: number;        // Bytes sent
    speed: number;       // Connection speed in Mb/s
  }