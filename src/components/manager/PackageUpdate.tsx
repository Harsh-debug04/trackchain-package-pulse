import { useState } from "react";
import { QrCode, Send, Package, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { stages, sealStatuses } from "@/utils/manager";
import type { PackageFormData } from "@/types/manager";

interface PackageUpdateProps {
  onUpdateComplete: () => void;
}

export const PackageUpdate = ({ onUpdateComplete }: PackageUpdateProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<PackageFormData>({
    packageId: "",
    newStage: "",
    sealStatus: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleSubmit = async () => {
    const { packageId, newStage, sealStatus } = formData;
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
      const qrCodeData = JSON.stringify({
        packageId,
        stage: newStage,
        sealStatus,
        timestamp: new Date().toISOString(),
        updatedBy: user?.email
      });
      setQrData(qrCodeData);

      toast({
        title: "Package updated successfully",
        description: `Package ${packageId} has been updated to ${newStage}.`,
      });

      // Reset form
      setFormData({
        packageId: "",
        newStage: "",
        sealStatus: ""
      });
      
      // Notify parent to refresh data
      onUpdateComplete();

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

  const updateFormData = (field: keyof PackageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { packageId, newStage, sealStatus } = formData;

  return (
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
                  onChange={(e) => updateFormData('packageId', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Stage</label>
              <Select value={newStage} onValueChange={(value) => updateFormData('newStage', value)}>
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
              <Select value={sealStatus} onValueChange={(value) => updateFormData('sealStatus', value)}>
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
  );
};