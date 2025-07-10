import { useState } from "react";
import { Plus, Package, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ManagerHeader } from "@/components/manager/ManagerHeader";
import { PackageManagement } from "@/components/manager/PackageManagement";
import { PackageUpdate } from "@/components/manager/PackageUpdate";
import { SystemMonitor } from "@/components/manager/SystemMonitor";
import { useManagerData } from "@/hooks/manager/useManagerData";
import type { BlockchainStatus, DatabaseStatus } from "@/types/manager";

const ManagerContent = () => {
  const { recentUpdates, packages, activeLogins, fetchRecentUpdates, fetchPackages } = useManagerData();

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

  const handleDataRefresh = () => {
    fetchPackages();
    fetchRecentUpdates();
  };

  return (
    <div className="min-h-screen bg-background blockchain-grid">
      <ManagerHeader />

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

          <TabsContent value="packages">
            <PackageManagement 
              packages={packages} 
              onPackageCreated={handleDataRefresh}
            />
          </TabsContent>

          <TabsContent value="update">
            <PackageUpdate onUpdateComplete={handleDataRefresh} />
          </TabsContent>

          <TabsContent value="monitoring">
            <SystemMonitor 
              blockchainStatus={blockchainStatus}
              databaseStatus={databaseStatus}
              activeLogins={activeLogins}
              recentUpdates={recentUpdates}
            />
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