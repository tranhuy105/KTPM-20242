import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import orderApi from "../../api/orderApi";
import toast from "react-hot-toast";
import type { Order } from "../../types";

// Import new components
import { OrderHeader } from "../../components/admin/orders/OrderHeader";
import { OrderStatusInfo } from "../../components/admin/orders/OrderStatusInfo";
import { CustomerInfo } from "../../components/admin/orders/CustomerInfo";
import { OrderItems } from "../../components/admin/orders/OrderItems";
import { AddressInfo } from "../../components/admin/orders/AddressInfo";
import { OrderHistoryTimeline } from "../../components/admin/orders/OrderHistoryTimeline";
import { CancelOrderDialog } from "../../components/admin/orders/CancelOrderDialog";

const AdminOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        navigate("/admin/orders");
        return;
      }

      try {
        setIsLoading(true);
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  // Handle status update
  const handleUpdateStatus = async (status: Order["status"]) => {
    if (!order || !id) return;

    // If trying to cancel, open the dialog instead of updating directly
    if (status === "cancelled") {
      setCancelDialog({
        isOpen: true,
        isLoading: false,
      });
      return;
    }

    try {
      setIsUpdating(true);
      const comment = `Status updated to ${status} by admin`;

      const updatedOrder = await orderApi.updateOrderStatus(
        id,
        status,
        comment
      );

      setOrder(updatedOrder);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle order cancellation with reason
  const handleCancelOrder = async (orderId: string, reason: string) => {
    setCancelDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      // Use the dedicated cancelOrder API instead of updateOrderStatus
      const updatedOrder = await orderApi.cancelOrder(orderId, reason);

      // Update order state
      setOrder(updatedOrder);

      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      // Close the dialog
      setCancelDialog({
        isOpen: false,
        isLoading: false,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/orders")}
          className="mb-4"
        >
          <Loader2 className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          Order not found or you don't have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderHeader
        order={order}
        isUpdating={isUpdating}
        onNavigateBack={() => navigate("/admin/orders")}
        onUpdateStatus={handleUpdateStatus}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <OrderStatusInfo order={order} />
        <CustomerInfo order={order} />
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Billing</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <OrderItems order={order} />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <AddressInfo order={order} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <OrderHistoryTimeline order={order} />
        </TabsContent>
      </Tabs>

      {/* Cancel Order Dialog */}
      {id && (
        <CancelOrderDialog
          orderId={id}
          isOpen={cancelDialog.isOpen}
          isLoading={cancelDialog.isLoading}
          onClose={() =>
            setCancelDialog({
              isOpen: false,
              isLoading: false,
            })
          }
          onConfirm={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default AdminOrderDetailsPage;
