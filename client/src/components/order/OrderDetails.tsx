import { useTranslation } from "react-i18next";
import { ArrowLeft, Ban, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDate, formatCurrency } from "../../lib/utils";
import { OrderStatusBadge } from "../admin/orders/OrderStatusBadge";
import { OrderItems } from "../admin/orders/OrderItems";
import { AddressInfo } from "../admin/orders/AddressInfo";
import { OrderHistoryTimeline } from "../admin/orders/OrderHistoryTimeline";
import type { Order } from "../../types";

interface OrderDetailsProps {
  order: Order;
  isLoading: boolean;
  onNavigateBack: () => void;
  onCancelOrder: () => void;
}

export function OrderDetails({
  order,
  isLoading,
  onNavigateBack,
  onCancelOrder,
}: OrderDetailsProps) {
  const { t } = useTranslation();

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onNavigateBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("orders.backToOrders")}
        </Button>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {t("orders.notFound")}
        </div>
      </div>
    );
  }

  // Check if the order can be cancelled
  const canCancel = ["pending", "processing", "payment_pending"].includes(
    order.status
  );

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onNavigateBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("orders.backToOrders")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {t("orders.orderNumber")}: {order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              {t("orders.placedOn")} {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Cancel button (if order can be cancelled) */}
        {canCancel && (
          <Button onClick={onCancelOrder} variant="destructive">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            {t("orders.cancelOrder")}
          </Button>
        )}
      </div>

      {/* Order Status Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-medium mb-4">{t("orders.orderStatus")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("orders.status")}
              </p>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("orders.paymentStatus")}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("orders.orderDate")}
              </p>
              <p className="mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("orders.total")}
              </p>
              <p className="mt-1 font-medium">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-medium mb-4">{t("orders.orderSummary")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("orders.subtotal")}
              </span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("orders.shipping")}
              </span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("orders.tax")}</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("orders.discount")}
                </span>
                <span>-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>{t("orders.total")}</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Items, Shipping & History */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">{t("orders.items")}</TabsTrigger>
          <TabsTrigger value="shipping">
            {t("orders.shippingBilling")}
          </TabsTrigger>
          <TabsTrigger value="history">{t("orders.orderHistory")}</TabsTrigger>
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
    </div>
  );
}
