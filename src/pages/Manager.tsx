import { useState } from "react";
import { QrCode, Send, Database, Wifi, Activity, AlertCircle, CheckCircle, Settings, Zap, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from 'qrcode.react';

interface BlockchainStatus {
  connected: boolean;
  blockNumber: number;
  gasPrice: string;
  networkId: string;
  transactionCount: number;
}

interface DatabaseStatus {
  connected: boolean;
  responseTime: number;
  activeConnections: number;
}

const Manager = () => {
  const [managerId, setManagerId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [newStage, setNewStage] = useState("");
  const [sealStatus, setSealStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState("");

  // Mock blockchain status
  const [blockchainStatus] = useState<BlockchainStatus>({
    connected: true,
    blockNumber: 18592847,
    gasPrice: "25.3",
    networkId: "1337",
    transactionCount: 156
  });

  // Mock database status
  const [databaseStatus] = useState<DatabaseStatus>({
    connected: true,
    responseTime: 45,
    activeConnections: 12
  });

  const stages = [
    "Package Created",
    "Dispatched", 
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Exception"
  ];

  const sealStatuses = ["Intact", "Broken", "Replaced"];

  const handleSubmit = async () => {
    if (!managerId || !packageId || !newStage || !sealStatus) return;

    setIsSubmitting(true);
    
    // Generate QR code data
    const qrData = JSON.stringify({
      packageId,
      managerId,
      stage: newStage,
      sealStatus,
      timestamp: new Date().toISOString()
    });
    setQrData(qrData);

    // Simulate blockchain transaction
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form
      setPackageId("");
      setNewStage("");
      setSealStatus("");
    }, 2000);
  };

  const recentTransactions = [
    { hash: "0x1a2b3c4d5e6f...", status: "Confirmed", gasUsed: "21000", timestamp: "2m ago" },
    { hash: "0x2b3c4d5e6f7a...", status: "Pending", gasUsed: "23000", timestamp: "5m ago" },
    { hash: "0x3c4d5e6f7a8b...", status: "Confirmed", gasUsed: "19000", timestamp: "8m ago" },
  ];

  return (
    <div className="min-h-screen bg-background blockchain-grid">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Manager Dashboard
              </h1>
              <p className="text-muted-foreground">Blockchain package management system</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="connection-indicator flex items-center gap-2 px-3 py-2 bg-success/20 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="update" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="update" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Package Update
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Monitor
            </TabsTrigger>
          </TabsList>

          {/* Package Update Tab */}
          <TabsContent value="update" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Update Form */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Send className="w-6 h-6 text-primary" />
                    Update Package Status
                  </CardTitle>
                  <CardDescription>
                    Submit new package status to the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Manager ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your manager ID"
                          value={managerId}
                          onChange={(e) => setManagerId(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Package ID</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter package ID"
                          value={packageId}
                          onChange={(e) => setPackageId(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">New Stage</label>
                      <Select value={newStage} onValueChange={setNewStage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Seal Status</label>
                      <Select value={sealStatus} onValueChange={setSealStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seal status" />
                        </SelectTrigger>
                        <SelectContent>
                          {sealStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    variant="blockchain"
                    size="lg"
                    className="w-full"
                    disabled={!managerId || !packageId || !newStage || !sealStatus || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Submit to Blockchain
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* QR Code Generator */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-accent" />
                    Live QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan for quick package logging
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {qrData ? (
                    <div className="space-y-4">
                      <div className="inline-block p-4 bg-background rounded-lg">
                        <QRCodeSVG 
                          value={qrData} 
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        QR Code generated for latest update
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setQrData("")}
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <QrCode className="w-24 h-24 text-muted-foreground mx-auto mb-4 animate-float" />
                      <p className="text-muted-foreground">
                        Submit an update to generate QR code
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Blockchain Status */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary" />
                    Ethereum Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <Badge variant={blockchainStatus.connected ? "success" : "destructive"} className="animate-pulse-glow">
                      {blockchainStatus.connected ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disconnected
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Block Number</span>
                      <div className="font-mono text-lg font-bold text-primary">
                        #{blockchainStatus.blockNumber.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gas Price</span>
                      <div className="font-mono text-lg font-bold text-accent">
                        {blockchainStatus.gasPrice} Gwei
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Network ID</span>
                      <div className="font-mono text-lg font-bold">
                        {blockchainStatus.networkId}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transactions</span>
                      <div className="font-mono text-lg font-bold text-success">
                        {blockchainStatus.transactionCount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Status */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Wifi className="w-6 h-6 text-accent" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <Badge variant={databaseStatus.connected ? "success" : "destructive"} className="animate-pulse-glow">
                      {databaseStatus.connected ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Online
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Offline
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time</span>
                      <div className="font-mono text-lg font-bold text-success">
                        {databaseStatus.responseTime}ms
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Connections</span>
                      <div className="font-mono text-lg font-bold text-primary">
                        {databaseStatus.activeConnections}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="blockchain-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Activity className="w-6 h-6 text-warning" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest blockchain transactions from this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          tx.status === 'Confirmed' ? 'bg-success animate-pulse-glow' : 'bg-warning animate-pulse'
                        }`}></div>
                        <div>
                          <div className="font-mono text-sm text-primary">{tx.hash}</div>
                          <div className="text-xs text-muted-foreground">Gas used: {tx.gasUsed}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={tx.status === 'Confirmed' ? 'success' : 'warning'}>
                          {tx.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">{tx.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Manager;