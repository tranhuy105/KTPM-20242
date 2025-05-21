import {
  ArrowLeft,
  CheckCircle,
  Truck,
  Ban,
  Loader2,
  Edit,
  Package,
  RefreshCw,
  Clock,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { formatDate } from "../../../lib/utils";
import type { Order } from "../../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface OrderHeaderProps {
  order: Order;
  isUpdating: boolean;
  onNavigateBack: () => void;
  onUpdateStatus: (status: Order["status"]) => void;
}

// Define supported button variants
type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type StatusButtonConfig = {
  [key in Order["status"]]?: {
    icon: LucideIcon;
    label: string;
    variant: ButtonVariant;
  };
};

// Status button configuration with icons and labels
const STATUS_BUTTONS: StatusButtonConfig = {
  processing: { icon: Edit, label: "Mark as Processing", variant: "default" },
  shipped: { icon: Truck, label: "Mark as Shipped", variant: "default" },
  delivered: {
    icon: CheckCircle,
    label: "Mark as Delivered",
    variant: "default",
  },
  cancelled: { icon: Ban, label: "Cancel Order", variant: "destructive" },
  on_hold: { icon: Clock, label: "Put on Hold", variant: "outline" },
  pending: { icon: RefreshCw, label: "Mark as Pending", variant: "outline" },
  payment_pending: {
    icon: AlertTriangle,
    label: "Mark Payment Pending",
    variant: "outline",
  },
  paid: { icon: CheckCircle, label: "Mark as Paid", variant: "secondary" },
  refunded: {
    icon: RefreshCw,
    label: "Mark as Refunded",
    variant: "secondary",
  },
  partially_refunded: {
    icon: RefreshCw,
    label: "Mark as Partially Refunded",
    variant: "secondary",
  },
};

export const OrderHeader = ({
  order,
  isUpdating,
  onNavigateBack,
  onUpdateStatus,
}: OrderHeaderProps) => {
  // Get valid next statuses from the order (or fallback to empty array)
  const validNextStatuses = order.validNextStatuses || [];

  // Helper to get icon component based on status
  const getStatusIcon = (status: Order["status"]) => {
    return STATUS_BUTTONS[status]?.icon || Package;
  };

  // Helper to get button variant based on status
  const getButtonVariant = (status: Order["status"]): ButtonVariant => {
    return STATUS_BUTTONS[status]?.variant || "default";
  };

  // Helper to get button label based on status
  const getStatusLabel = (status: Order["status"]) => {
    return (
      STATUS_BUTTONS[status]?.label || `Mark as ${status.replace("_", " ")}`
    );
  };

  // Determine primary status action (or default to first valid status)
  const primaryStatus = validNextStatuses.find((status) =>
    ["processing", "shipped", "delivered"].includes(status)
  ) as Order["status"] | undefined;

  // Special case: always prioritize "cancelled" for the destructive button
  const showCancelButton = validNextStatuses.includes("cancelled");

  // Remaining status options (excluding primary and cancel)
  const remainingStatuses = validNextStatuses.filter(
    (status) => status !== primaryStatus && status !== "cancelled"
  ) as Order["status"][];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onNavigateBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Primary status button */}
        {primaryStatus && (
          <Button
            onClick={() => onUpdateStatus(primaryStatus)}
            disabled={isUpdating}
            variant={getButtonVariant(primaryStatus)}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              (() => {
                const Icon = getStatusIcon(primaryStatus);
                return <Icon className="mr-2 h-4 w-4" />;
              })()
            )}
            {getStatusLabel(primaryStatus)}
          </Button>
        )}

        {/* Cancel order button (if available) */}
        {showCancelButton && (
          <Button
            onClick={() => onUpdateStatus("cancelled")}
            disabled={isUpdating}
            variant="destructive"
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel Order
          </Button>
        )}

        {/* Dropdown for additional actions */}
        {remainingStatuses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {remainingStatuses.map((status) => {
                const StatusIcon = getStatusIcon(status);
                return (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onUpdateStatus(status)}
                  >
                    <StatusIcon className="mr-2 h-4 w-4" />
                    {getStatusLabel(status)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
