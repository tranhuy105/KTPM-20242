import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { OrderDetails } from "./OrderDetails";
import { CancelOrderDialog } from "./CancelOrderDialog";
import orderApi from "../../api/orderApi";
import toast from "react-hot-toast";
import type { Order } from "../../types";

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    isLoading: false,
  });

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        navigate("/profile/orders");
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

  // Open cancel dialog
  const handleCancelOrder = () => {
    if (!id) return;

    setCancelDialog({
      isOpen: true,
      isLoading: false,
    });
  };

  // Process order cancellation
  const processCancelOrder = async (orderId: string, reason: string) => {
    setCancelDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      const updatedOrder = await orderApi.cancelOrder(orderId, reason);
      setOrder(updatedOrder);
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancelDialog({
        isOpen: false,
        isLoading: false,
      });
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  return (
    <div>
      <OrderDetails
        order={order}
        isLoading={cancelDialog.isLoading}
        onNavigateBack={() => navigate("/profile/orders")}
        onCancelOrder={handleCancelOrder}
      />

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
          onConfirm={processCancelOrder}
        />
      )}
    </div>
  );
}
