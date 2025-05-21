import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { formatCurrencyVND, formatDate } from "../../lib/utils";
import { OrderStatusBadge } from "../admin/orders/OrderStatusBadge";
import type { Order } from "../../types";

interface OrderTableProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
}

export function OrderTable({ orders, onCancelOrder }: OrderTableProps) {
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
                {formatCurrencyVND(order.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">{t("orders.viewOrder")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/profile/orders/${order._id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("orders.viewDetails")}
                    </DropdownMenuItem>

                    {/* Show cancel option only for orders that can be cancelled */}
                    {["pending", "processing", "payment_pending"].includes(
                      order.status
                    ) && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onCancelOrder(order._id)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("orders.cancelOrder")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
