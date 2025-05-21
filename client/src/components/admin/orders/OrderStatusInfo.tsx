import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { formatDate } from "../../../lib/utils";
import type { Order } from "../../../types";

interface OrderStatusInfoProps {
  order: Order;
}

export const OrderStatusInfo = ({ order }: OrderStatusInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Order Status
            </p>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Payment Status
            </p>
            <div className="mt-1">
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Fulfillment Status
            </p>
            <div className="mt-1">
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                {order.fulfillmentStatus}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Order Date
            </p>
            <p className="mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
