import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { formatCurrency, formatDate } from "../../lib/utils";
import { OrderStatusBadge } from "../admin/orders/OrderStatusBadge";
import type { Order } from "../../types";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Function to get the first product image from the order
  const getFirstProductImage = (order: Order) => {
    if (
      order.products &&
      order.products.length > 0 &&
      order.products[0].productSnapshot?.imageUrl
    ) {
      return order.products[0].productSnapshot.imageUrl;
    }
    return "/placeholder-product.png"; // Fallback image
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t("orders.product")}</TableHead>
            <TableHead>{t("orders.orderNumber")}</TableHead>
            <TableHead>{t("orders.date")}</TableHead>
            <TableHead>{t("orders.status")}</TableHead>
            <TableHead className="text-right">{t("orders.total")}</TableHead>
            <TableHead className="text-right">{t("orders.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>
                <div className="w-[50px] h-[50px] relative">
                  <img
                    src={getFirstProductImage(order)}
                    alt={t("orders.productImage")}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = "/placeholder-product.png";
                    }}
                  />
                  {order.products && order.products.length > 1 && (
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      +{order.products.length - 1}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/profile/orders/${order._id}`)}
                >
                  <Eye className="h-6 w-6" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
