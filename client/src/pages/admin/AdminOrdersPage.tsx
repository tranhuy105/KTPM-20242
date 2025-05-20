import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { OrdersTable } from "../../components/admin/orders/OrdersTable";
import { OrderFilters } from "../../components/admin/orders/OrderFilters";
import { CancelOrderDialog } from "../../components/admin/orders/CancelOrderDialog";
import orderApi from "../../api/orderApi";
import toast from "react-hot-toast";
import type { Order, OrderFilters as OrderFiltersType } from "../../types";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFiltersType>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    orderId: "",
    isLoading: false,
  });

  // Fetch orders with current filters
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderApi.getAllOrders(filters);
        setOrders(response.orders);
        setPagination({
          totalCount: response.pagination.totalCount,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage,
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: OrderFiltersType) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Handle order status update
  const handleUpdateStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    // If trying to cancel, open the dialog instead of updating directly
    if (status === "cancelled") {
      setCancelDialog({
        isOpen: true,
        orderId,
        isLoading: false,
      });
      return;
    }

    try {
      const comment = `Status updated to ${status} by admin`;
      await orderApi.updateOrderStatus(orderId, status, comment);

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Handle order cancellation with reason
  const handleCancelOrder = async (orderId: string, reason: string) => {
    setCancelDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      // Use the dedicated cancelOrder API instead of updateOrderStatus
      await orderApi.cancelOrder(orderId, reason);

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      // Close the dialog
      setCancelDialog({
        isOpen: false,
        orderId: "",
        isLoading: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage your customer orders, update status, and view order details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <OrderFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders && orders.length > 0 ? (
              <OrdersTable
                orders={orders}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders found. Try adjusting your filters.
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} of {pagination.totalCount} orders
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page! - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page! + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        orderId={cancelDialog.orderId}
        isOpen={cancelDialog.isOpen}
        isLoading={cancelDialog.isLoading}
        onClose={() =>
          setCancelDialog({
            isOpen: false,
            orderId: "",
            isLoading: false,
          })
        }
        onConfirm={handleCancelOrder}
      />
    </div>
  );
};

export default AdminOrdersPage;
