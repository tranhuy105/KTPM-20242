import { Badge } from "../../ui/badge";
import type { Order } from "../../../types";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
          Shipped
        </Badge>
      );
    case "delivered":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Cancelled
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          {status}
        </Badge>
      );
  }
};
