import { useState } from "react";
import { Plus, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStatusColor } from "@/utils/manager";
import type { NewPackageData } from "@/types/manager";

interface PackageManagementProps {
  packages: any[];
  onPackageCreated: () => void;
}

export const PackageManagement = ({ packages, onPackageCreated }: PackageManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<NewPackageData>({
    newPackageId: "",
    senderName: "",
    senderAddress: "",
    recipientName: "",
    recipientAddress: ""
  });
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);

  const handleCreatePackage = async () => {
    const { newPackageId, senderName, senderAddress, recipientName, recipientAddress } = formData;
    
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
      setFormData({
        newPackageId: "",
        senderName: "",
        senderAddress: "",
        recipientName: "",
        recipientAddress: ""
      });
      
      // Notify parent to refresh data
      onPackageCreated();

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

  const updateFormData = (field: keyof NewPackageData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { newPackageId, senderName, senderAddress, recipientName, recipientAddress } = formData;

  return (
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
                onChange={(e) => updateFormData('newPackageId', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sender Name</label>
              <Input
                placeholder="Enter sender name"
                value={senderName}
                onChange={(e) => updateFormData('senderName', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sender Address</label>
              <Input
                placeholder="Enter sender address"
                value={senderAddress}
                onChange={(e) => updateFormData('senderAddress', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recipient Name</label>
              <Input
                placeholder="Enter recipient name"
                value={recipientName}
                onChange={(e) => updateFormData('recipientName', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recipient Address</label>
              <Input
                placeholder="Enter recipient address"
                value={recipientAddress}
                onChange={(e) => updateFormData('recipientAddress', e.target.value)}
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
  );
};