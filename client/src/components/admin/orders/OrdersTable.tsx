import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Badge } from "../../ui/badge";
import {
  Edit,
  MoreHorizontal,
  Truck,
  CheckCircle,
  Ban,
  FileText,
} from "lucide-react";
import type { Order } from "../../../types";
import { formatCurrencyVND, formatDate } from "../../../lib/utils";

interface OrdersTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

export function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
  const navigate = useNavigate();

  // Helper function to render order status badge
  const renderStatusBadge = (status: Order["status"]) => {
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

  // Helper function to render payment status badge
  const renderPaymentStatusBadge = (status: Order["paymentStatus"]) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">
                <div className="font-medium">{order.orderNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {order.products.length} items
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{order.userSnapshot.name}</div>
                <div className="text-sm text-muted-foreground">
                  {order.userSnapshot.email}
                </div>
              </TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrencyVND(order.totalAmount)}
              </TableCell>
              <TableCell>{renderStatusBadge(order.status)}</TableCell>
              <TableCell>
                {renderPaymentStatusBadge(order.paymentStatus)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/admin/orders/details/${order._id}`)
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {order.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order._id, "processing")}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Mark as Processing
                      </DropdownMenuItem>
                    )}
                    {order.status === "processing" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order._id, "shipped")}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Shipped
                      </DropdownMenuItem>
                    )}
                    {order.status === "shipped" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order._id, "delivered")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </DropdownMenuItem>
                    )}
                    {["pending", "processing"].includes(order.status) && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onUpdateStatus(order._id, "cancelled")}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancel Order
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
