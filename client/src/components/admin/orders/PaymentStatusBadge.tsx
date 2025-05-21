import { Badge } from "../../ui/badge";
import type { Order } from "../../../types";

interface PaymentStatusBadgeProps {
  status: Order["paymentStatus"];
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Paid
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Refunded
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Failed
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
