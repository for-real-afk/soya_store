import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Truck, Package, XCircle, FileCheck } from "lucide-react";

interface OrderStatusProps {
  status: string;
  className?: string;
}

export default function OrderStatus({ status, className }: OrderStatusProps) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: Clock,
          variant: 'outline',
          text: 'Pending',
          color: 'text-amber-500',
          description: 'Awaiting confirmation'
        };
      case 'processing':
        return {
          icon: Package,
          variant: 'outline',
          text: 'Processing',
          color: 'text-blue-500',
          description: 'Order processing'
        };
      case 'shipped':
        return {
          icon: Truck,
          variant: 'outline',
          text: 'Shipped',
          color: 'text-indigo-500',
          description: 'On the way'
        };
      case 'delivered':
        return {
          icon: CheckCircle2,
          variant: 'outline',
          text: 'Delivered',
          color: 'text-green-500',
          description: 'Completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          variant: 'outline',
          text: 'Cancelled',
          color: 'text-red-500',
          description: 'Order cancelled'
        };
      case 'completed':
        return {
          icon: FileCheck,
          variant: 'outline',
          text: 'Completed',
          color: 'text-green-500',
          description: 'Order completed'
        };
      default:
        return {
          icon: Clock,
          variant: 'outline',
          text: status,
          color: 'text-gray-500',
          description: 'Status unknown'
        };
    }
  };

  const { icon: Icon, variant, text, color, description } = getStatusConfig();

  return (
    <div className={cn("flex items-center", className)}>
      <Badge variant={variant as any} className={cn("flex items-center gap-1", color)}>
        <Icon className="h-3 w-3" />
        <span>{text}</span>
      </Badge>
    </div>
  );
}