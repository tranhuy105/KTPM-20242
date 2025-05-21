import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  AlertCircle,
  RotateCcw,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { formatDate } from "../../../lib/utils";
import type { Order } from "../../../types";

interface OrderHistoryTimelineProps {
  order: Order;
}

export const OrderHistoryTimeline = ({ order }: OrderHistoryTimelineProps) => {
  // Helper function to get the appropriate icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "processing":
        return <Package className="h-6 w-6 text-blue-500" />;
      case "shipped":
        return <Truck className="h-6 w-6 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "refunded":
      case "partially_refunded":
        return <RotateCcw className="h-6 w-6 text-orange-500" />;
      case "paid":
        return <CreditCard className="h-6 w-6 text-green-500" />;
      default:
        return <ShoppingBag className="h-6 w-6 text-gray-500" />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 bg-yellow-50";
      case "processing":
        return "border-blue-500 bg-blue-50";
      case "shipped":
        return "border-indigo-500 bg-indigo-50";
      case "delivered":
        return "border-green-500 bg-green-50";
      case "cancelled":
        return "border-red-500 bg-red-50";
      case "refunded":
      case "partially_refunded":
        return "border-orange-500 bg-orange-50";
      case "paid":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  // Sort history by timestamp (newest first)
  const sortedHistory = order.statusHistory
    ? [...order.statusHistory].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          Status changes and notes for this order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="relative ml-6 mt-3 border-l-2 border-gray-200 pb-2">
            {sortedHistory.map((history, index) => (
              <div key={index} className="relative mb-6 last:mb-0">
                <div
                  className={`absolute -left-[16px] top-0 rounded-full border-4 ${getStatusColor(
                    history.status
                  )}`}
                >
                  {getStatusIcon(history.status)}
                </div>
                <div className="ml-8 pt-2">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">
                        {history.status.charAt(0).toUpperCase() +
                          history.status.slice(1).replace(/_/g, " ")}
                      </h3>
                      <time className="text-sm text-muted-foreground">
                        {formatDate(history.timestamp)}
                      </time>
                    </div>
                    {history.comment && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {history.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No history available.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
