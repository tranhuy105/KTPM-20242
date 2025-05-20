import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { Order } from "../../../types";

interface CustomerInfoProps {
  order: Order;
}

export const CustomerInfo = ({ order }: CustomerInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Customer Name
            </p>
            <p className="mt-1">{order.userSnapshot.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1">{order.userSnapshot.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
