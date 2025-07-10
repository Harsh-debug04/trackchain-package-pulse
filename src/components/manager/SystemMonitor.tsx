import { Database, Wifi, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlockchainStatus, DatabaseStatus } from "@/types/manager";

interface SystemMonitorProps {
  blockchainStatus: BlockchainStatus;
  databaseStatus: DatabaseStatus;
  activeLogins: number;
  recentUpdates: any[];
}

export const SystemMonitor = ({ 
  blockchainStatus, 
  databaseStatus, 
  activeLogins, 
  recentUpdates 
}: SystemMonitorProps) => {
  return (
    <div className="space-y-8">
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
    </div>
  );
};