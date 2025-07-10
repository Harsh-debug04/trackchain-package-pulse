import { useState, useEffect } from "react";
import { QrCode, Send, Database, Wifi, Activity, AlertCircle, CheckCircle, Settings, Zap, User, Package, LogOut, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

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

const ManagerContent = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [packageId, setPackageId] = useState("");
  const [newStage, setNewStage] = useState("");
  const [sealStatus, setSealStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState("");
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  
  // Package creation state
  const [newPackageId, setNewPackageId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [activeLogins, setActiveLogins] = useState(0);

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

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent" => {
    switch (status.toLowerCase()) {
      case "delivered": return "success";
      case "in transit": return "default";
      case "dispatched": return "accent";
      case "package created": return "secondary";
      case "out for delivery": return "warning";
      default: return "secondary";
    }
  };

  useEffect(() => {
    fetchRecentUpdates();
    fetchPackages();
    fetchActiveLogins();
    
    // Set up real-time subscriptions
    const updatesSubscription = supabase
      .channel('package_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'package_updates' },
        () => fetchRecentUpdates()
      )
      .subscribe();

    const packagesSubscription = supabase
      .channel('packages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'packages' },
        () => fetchPackages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(updatesSubscription);
      supabase.removeChannel(packagesSubscription);
    };
  }, []);

  const fetchRecentUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('package_updates')
        .select(`
          *,
          packages (package_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentUpdates(data || []);
    } catch (error) {
      console.error('Error fetching recent updates:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchActiveLogins = async () => {
    // For now, we'll simulate active logins. In a real app, you'd track sessions
    setActiveLogins(Math.floor(Math.random() * 20) + 5);
  };

  const handleCreatePackage = async () => {
    if (!newPackageId || !senderName || !senderAddress || !recipientName || !recipientAddress) return;

    setIsCreatingPackage(true);
    
    try {
      // Check if package ID already exists
      const { data: existingPackage } = await supabase
        .from('packages')
        .select('package_id')
        .eq('package_id', newPackageId)
        .single();

      if (existingPackage) {
        toast({
          title: "Package ID already exists",
          description: "Please use a different package ID.",
          variant: "destructive",
        });
        setIsCreatingPackage(false);
        return;
      }

      // Create new package
      const { error } = await supabase
        .from('packages')
        .insert({
          package_id: newPackageId,
          sender_name: senderName,
          sender_address: senderAddress,
          recipient_name: recipientName,
          recipient_address: recipientAddress,
          created_by: user?.id
        });

      if (error) throw error;

      // Create initial package update
      const { data: packageData } = await supabase
        .from('packages')
        .select('id')
        .eq('package_id', newPackageId)
        .single();

      if (packageData) {
        await supabase
          .from('package_updates')
          .insert({
            package_id: packageData.id,
            stage: "Package Created",
            seal_status: "Intact",
            updated_by: user?.id,
            notes: `Package created by ${user?.email}`
          });
      }

      toast({
        title: "Package created successfully",
        description: `Package ${newPackageId} has been added to the system.`,
      });

      // Reset form
      setNewPackageId("");
      setSenderName("");
      setSenderAddress("");
      setRecipientName("");
      setRecipientAddress("");
      
      // Refresh data
      fetchPackages();
      fetchRecentUpdates();

    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Creation failed",
        description: "There was an error creating the package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPackage(false);
    }
  };

  const handleSubmit = async () => {
    if (!packageId || !newStage || !sealStatus) return;

    setIsSubmitting(true);
    
    try {
      // Check if package exists
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('package_id', packageId)
        .single();

      if (packageError || !packageData) {
        toast({
          title: "Package not found",
          description: "Please check the package ID and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update package status
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          current_stage: newStage,
          seal_status: sealStatus,
          updated_at: new Date().toISOString()
        })
        .eq('package_id', packageId);

      if (updateError) throw updateError;

      // Insert package update record
      const { error: insertError } = await supabase
        .from('package_updates')
        .insert({
          package_id: packageData.id,
          stage: newStage,
          seal_status: sealStatus,
          updated_by: user?.id,
          notes: `Updated by ${user?.email}`
        });

      if (insertError) throw insertError;

      // Generate QR code data
      const qrData = JSON.stringify({
        packageId,
        stage: newStage,
        sealStatus,
        timestamp: new Date().toISOString(),
        updatedBy: user?.email
      });
      setQrData(qrData);

      toast({
        title: "Package updated successfully",
        description: `Package ${packageId} has been updated to ${newStage}.`,
      });

      // Reset form
      setPackageId("");
      setNewStage("");
      setSealStatus("");
      
      // Refresh recent updates
      fetchRecentUpdates();

    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Tabs defaultValue="packages" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Package Management
            </TabsTrigger>
            <TabsTrigger value="update" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Package Update
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Monitor
            </TabsTrigger>
          </TabsList>

          {/* Package Management Tab */}
          <TabsContent value="packages" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Package Form */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Plus className="w-6 h-6 text-primary" />
                    Create New Package
                  </CardTitle>
                  <CardDescription>
                    Add a new package to the blockchain tracking system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Package ID</label>
                      <Input
                        placeholder="Enter unique package ID"
                        value={newPackageId}
                        onChange={(e) => setNewPackageId(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Sender Name</label>
                      <Input
                        placeholder="Enter sender name"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Sender Address</label>
                      <Input
                        placeholder="Enter sender address"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                      <Input
                        placeholder="Enter recipient name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                      <Input
                        placeholder="Enter recipient address"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreatePackage}
                    variant="blockchain"
                    size="lg"
                    className="w-full"
                    disabled={!newPackageId || !senderName || !senderAddress || !recipientName || !recipientAddress || isCreatingPackage}
                  >
                    {isCreatingPackage ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Creating Package...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Package
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Package List */}
              <Card className="blockchain-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Eye className="w-6 h-6 text-accent" />
                    Package Database
                  </CardTitle>
                  <CardDescription>
                    View all packages in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {packages.length > 0 ? (
                      packages.map((pkg) => (
                        <div key={pkg.id} className="p-4 bg-muted/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-sm text-primary font-bold">
                              {pkg.package_id}
                            </div>
                            <Badge variant={getStatusColor(pkg.current_stage) as any}>
                              {pkg.current_stage}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>From: {pkg.sender_name}</div>
                            <div>To: {pkg.recipient_name}</div>
                            <div>Created: {new Date(pkg.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No packages in database</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                      <label className="text-sm font-medium mb-2 block">Logged in as</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Manager email"
                          value={user?.email || ''}
                          disabled
                          className="pl-10 bg-muted/50"
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
                    disabled={!packageId || !newStage || !sealStatus || isSubmitting}
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
                       <span className="text-muted-foreground">Active Logins</span>
                       <div className="font-mono text-lg font-bold text-primary">
                         {activeLogins}
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
                  {recentUpdates.length > 0 ? (
                    recentUpdates.map((update, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-success animate-pulse-glow"></div>
                          <div>
                            <div className="font-mono text-sm text-primary">
                              {update.packages?.package_id || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {update.stage} - {update.seal_status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="success">
                            Confirmed
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(update.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent updates</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Manager = () => {
  return (
    <ProtectedRoute>
      <ManagerContent />
    </ProtectedRoute>
  );
};

export default Manager;