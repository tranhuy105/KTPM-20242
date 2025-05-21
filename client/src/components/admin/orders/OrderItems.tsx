import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { formatCurrency } from "../../../lib/utils";
import type { Order } from "../../../types";

interface OrderItemsProps {
  order: Order;
}

export const OrderItems = ({ order }: OrderItemsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
        <CardDescription>Items included in this order.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.productSnapshot.imageUrl && (
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-50">
                        <img
                          src={item.productSnapshot.imageUrl}
                          alt={item.productSnapshot.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {item.productSnapshot.name}
                      </div>
                      {item.variantAttributes && (
                        <div className="text-sm text-muted-foreground">
                          {Object.entries(item.variantAttributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.itemTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
