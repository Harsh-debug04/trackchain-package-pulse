export const stages = [
  "Package Created",
  "Dispatched", 
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Exception"
];

export const sealStatuses = ["Intact", "Broken", "Replaced"];

export const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent" => {
  switch (status.toLowerCase()) {
    case "delivered": return "success";
    case "in transit": return "default";
    case "dispatched": return "accent";
    case "package created": return "secondary";
    case "out for delivery": return "warning";
    default: return "secondary";
  }
};