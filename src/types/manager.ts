export interface BlockchainStatus {
  connected: boolean;
  blockNumber: number;
  gasPrice: string;
  networkId: string;
  transactionCount: number;
}

export interface DatabaseStatus {
  connected: boolean;
  responseTime: number;
  activeConnections: number;
}

export interface PackageFormData {
  packageId: string;
  newStage: string;
  sealStatus: string;
}

export interface NewPackageData {
  newPackageId: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
}