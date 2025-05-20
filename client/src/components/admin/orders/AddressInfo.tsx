import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { Order } from "../../../types";

interface AddressInfoProps {
  order: Order;
}

export const AddressInfo = ({ order }: AddressInfoProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>{order.shipping.address.fullName}</p>
            <p>{order.shipping.address.addressLine1}</p>
            {order.shipping.address.addressLine2 && (
              <p>{order.shipping.address.addressLine2}</p>
            )}
            <p>
              {order.shipping.address.city}, {order.shipping.address.state}{" "}
              {order.shipping.address.postalCode}
            </p>
            <p>{order.shipping.address.country}</p>
            {order.shipping.address.phone && (
              <p>Phone: {order.shipping.address.phone}</p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">
              Shipping Method
            </p>
            <p className="mt-1">{order.shipping.method}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>{order.billing.address.fullName}</p>
            <p>{order.billing.address.addressLine1}</p>
            {order.billing.address.addressLine2 && (
              <p>{order.billing.address.addressLine2}</p>
            )}
            <p>
              {order.billing.address.city}, {order.billing.address.state}{" "}
              {order.billing.address.postalCode}
            </p>
            <p>{order.billing.address.country}</p>
            {order.billing.address.phone && (
              <p>Phone: {order.billing.address.phone}</p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">
              Payment Method
            </p>
            <p className="mt-1">{order.billing.paymentMethod}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
