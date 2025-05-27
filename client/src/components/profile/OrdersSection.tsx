import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { OrderTable } from "../order/OrderTable";
import { OrderFilters } from "../order/OrderFilters";
import { CancelOrderDialog } from "../order/CancelOrderDialog";
import orderApi from "../../api/orderApi";
import toast from "react-hot-toast";
import type { Order } from "../../types";

const OrdersSection = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    sort: "newest",
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
        // Convert filters to API format
        const apiFilters = {
          page: filters.page,
          limit: filters.limit,
          status: filters.status !== "all" ? filters.status : undefined,
          sortBy:
            filters.sort === "newest" || filters.sort === "oldest"
              ? "createdAt"
              : "totalAmount",
          sortOrder:
            filters.sort === "newest" || filters.sort === "totalHighest"
              ? "desc"
              : "asc",
        };

        const response = await orderApi.getMyOrders(apiFilters);
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
        toast.error(t("orders.fetchError") || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filters, t]);

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status, page: 1 });
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort, page: 1 });
  };

  // Process order cancellation
  const processCancelOrder = async (orderId: string, reason: string) => {
    setCancelDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      await orderApi.cancelOrder(orderId, reason);

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      toast.success(
        t("orders.cancelSuccess") || "Order cancelled successfully"
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(t("orders.cancelError") || "Failed to cancel order");
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
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-6">
        {t("orders.title") || "My Orders"}
      </h2>

      {/* Always show filters regardless of order existence */}
      <div className="space-y-4">
        <OrderFilters
          status={filters.status}
          onStatusChange={handleStatusChange}
          sortBy={filters.sort}
          onSortChange={handleSortChange}
        />

        {isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t("orders.loading")}</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <OrderTable orders={orders} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {t("orders.showing", {
                    showing: orders.length,
                    total: pagination.totalCount,
                  }) ||
                    `Showing ${orders.length} of ${pagination.totalCount} orders`}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-md border ${
                      pagination.hasPrevPage
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!pagination.hasPrevPage}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page - 1 })
                    }
                  >
                    {t("common.previous")}
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md border ${
                      pagination.hasNextPage
                        ? "hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page + 1 })
                    }
                  >
                    {t("common.next")}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {t("orders.noOrders") || "No Orders Found"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {t("orders.noOrdersDescription") ||
                "You haven't placed any orders yet. Start shopping to place your first order."}
            </p>
          </div>
        )}
      </div>

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
        onConfirm={processCancelOrder}
      />
    </div>
  );
};

export default OrdersSection;
