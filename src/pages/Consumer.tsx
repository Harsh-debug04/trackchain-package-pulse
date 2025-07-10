import { useState } from "react";
import { Search, Package, Clock, Shield, MapPin, User, Zap, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrackingData {
  packageId: string;
  status: string;
  timeline: {
    stage: string;
    managerId: string;
    timestamp: string;
    sealStatus: string;
    location?: string;
  }[];
}

const Consumer = () => {
  const [packageId, setPackageId] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockTrackingData: TrackingData = {
    packageId: "PKG-2024-001337",
    status: "In Transit",
    timeline: [
      {
        stage: "Package Created",
        managerId: "MGR-001",
        timestamp: "2024-01-15T08:00:00Z",
        sealStatus: "Intact",
        location: "Warehouse A"
      },
      {
        stage: "Dispatched",
        managerId: "MGR-002",
        timestamp: "2024-01-15T10:30:00Z",
        sealStatus: "Intact",
        location: "Distribution Center"
      },
      {
        stage: "In Transit",
        managerId: "MGR-003",
        timestamp: "2024-01-15T14:45:00Z",
        sealStatus: "Intact",
        location: "Route Hub B"
      }
    ]
  };

const handleTrack = async () => {
    if (!packageId.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Query the database for the package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('package_id', packageId)
        .single();

      if (packageError || !packageData) {
        setTrackingData(null);
        setIsLoading(false);
        return;
      }

      // Get package updates/timeline
      const { data: updatesData, error: updatesError } = await supabase
        .from('package_updates')
        .select('*')
        .eq('package_id', packageData.id)
        .order('created_at', { ascending: true });

      if (updatesError) {
        console.error('Error fetching updates:', updatesError);
        setTrackingData(null);
        setIsLoading(false);
        return;
      }

      // Format the data to match the expected structure
      const formattedData: TrackingData = {
        packageId: packageData.package_id,
        status: packageData.current_stage,
        timeline: updatesData?.map(update => ({
          stage: update.stage,
          managerId: update.updated_by,
          timestamp: update.created_at,
          sealStatus: update.seal_status,
          location: "Distribution Center" // You can add location field to DB later
        })) || []
      };

      setTrackingData(formattedData);
    } catch (error) {
      console.error('Error tracking package:', error);
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent" => {
    switch (status.toLowerCase()) {
      case "delivered": return "success";
      case "in transit": return "default";
      case "dispatched": return "accent";
      case "package created": return "secondary";
      default: return "secondary";
    }
  };

  const getSealStatusColor = (status: string): "success" | "destructive" => {
    return status.toLowerCase() === "intact" ? "success" : "destructive";
  };

  return (
    <div className="min-h-screen bg-background blockchain-grid">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-blockchain opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 gradient-text">
              Blockchain Package Tracking
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track your packages securely on the Ethereum blockchain. 
              Every update is immutable and transparent.
            </p>
            
            {/* Search Section */}
            <div className="max-w-md mx-auto">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter Package ID or scan QR code"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-primary transition-all duration-300"
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  />
                </div>
                <Button 
                  onClick={handleTrack}
                  variant="blockchain"
                  size="lg"
                  disabled={isLoading || !packageId.trim()}
                  className="h-12"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              
              {/* QR Scanner Button */}
              <div className="text-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // For demo purposes, we'll simulate QR scanning with a sample package ID
                    const sampleQRData = JSON.stringify({
                      packageId: "PKG-2024-001337"
                    });
                    try {
                      const parsed = JSON.parse(sampleQRData);
                      setPackageId(parsed.packageId);
                    } catch (e) {
                      console.error('Invalid QR data');
                    }
                  }}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to simulate QR code scanning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Results */}
      {trackingData && (
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Package Info Card */}
            <Card className="blockchain-card mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Package className="w-8 h-8 text-primary animate-float" />
                      Package {trackingData.packageId}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Real-time blockchain tracking
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={getStatusColor(trackingData.status) as any}
                    className="text-lg px-4 py-2 animate-pulse-glow"
                  >
                    {trackingData.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Timeline */}
            <Card className="blockchain-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Clock className="w-6 h-6 text-accent" />
                  Package Timeline
                </CardTitle>
                <CardDescription>
                  All updates are recorded immutably on the Ethereum blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingData.timeline.map((event, index) => (
                    <div key={index} className="relative flex items-start gap-6">
                      {/* Timeline Connector */}
                      {index < trackingData.timeline.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 timeline-connector"></div>
                      )}
                      
                      {/* Timeline Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center neon-glow">
                        {event.stage.toLowerCase().includes('dispatch') && <Zap className="w-6 h-6 text-primary-foreground" />}
                        {event.stage.toLowerCase().includes('transit') && <MapPin className="w-6 h-6 text-primary-foreground" />}
                        {event.stage.toLowerCase().includes('created') && <Package className="w-6 h-6 text-primary-foreground" />}
                        {event.stage.toLowerCase().includes('delivered') && <Shield className="w-6 h-6 text-primary-foreground" />}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 blockchain-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-foreground">
                            {event.stage}
                          </h3>
                          <Badge 
                            variant={getSealStatusColor(event.sealStatus) as any}
                            className="status-pulse"
                          >
                            Seal: {event.sealStatus}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-accent" />
                            <span className="text-muted-foreground">Manager:</span>
                            <span className="font-mono text-primary">{event.managerId}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-mono">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="w-4 h-4 text-accent" />
                              <span className="text-muted-foreground">Location:</span>
                              <span className="font-medium">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Features Section */}
      {!trackingData && (
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="blockchain-card text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
                <CardTitle className="text-xl">Tamper-Proof</CardTitle>
                <CardDescription>
                  All data stored immutably on Ethereum blockchain
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="blockchain-card text-center">
              <CardHeader>
                <Zap className="w-12 h-12 text-accent mx-auto mb-4 animate-float" />
                <CardTitle className="text-xl">Real-Time Updates</CardTitle>
                <CardDescription>
                  Live tracking with instant blockchain confirmations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="blockchain-card text-center">
              <CardHeader>
                <Package className="w-12 h-12 text-success mx-auto mb-4 animate-float" />
                <CardTitle className="text-xl">Full Transparency</CardTitle>
                <CardDescription>
                  Complete audit trail from dispatch to delivery
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consumer;