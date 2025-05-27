import axiosInstance from "./axiosInstance";
import type {
  Order,
  OrderFilters,
  OrderAddress,
  OrderTransaction,
} from "../types";
import type { PaginatedOrderResponse } from "../types/Api";

const orderApi = {
  /**
   * Get all orders (admin only)
   * @param filters Optional filters to apply
   * @returns Paginated list of orders
   */
  getAllOrders: async (
    filters?: OrderFilters
  ): Promise<PaginatedOrderResponse> => {
    const response = await axiosInstance.get<PaginatedOrderResponse>(
      "/orders",
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Get an order by ID
   * @param orderId Order ID
   * @returns Order object
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get orders for the current user
   * @param options Optional parameters (page, limit, status, sortBy, sortOrder)
   * @returns Paginated list of orders
   */
  getMyOrders: async (options?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedOrderResponse> => {
    const response = await axiosInstance.get<PaginatedOrderResponse>(
      "/orders/me",
      {
        params: options,
      }
    );
    return response.data;
  },

  /**
   * Create a new order
   * @param orderData Order data
   * @returns Created order
   */
  createOrder: async (orderData: {
    products: {
      productId: string;
      quantity: number;
      variantId?: string;
    }[];
    shipping: {
      method: string;
      cost: number;
      address: OrderAddress;
    };
    billing: {
      paymentMethod: string;
      address: OrderAddress;
    };
    customerNote?: string;
    ipAddress?: string;
    taxAmount?: number;
    discountTotal?: number;
    couponCode?: string;
  }): Promise<Order> => {
    const response = await axiosInstance.post<Order>("/orders", orderData);
    return response.data;
  },

  /**
   * Update order status (admin only)
   * @param orderId Order ID
   * @param status New status
   * @param comment Optional comment
   * @returns Updated order
   */
  updateOrderStatus: async (
    orderId: string,
    status: Order["status"],
    comment?: string
  ): Promise<Order> => {
    const response = await axiosInstance.put<Order>(
      `/orders/${orderId}/status`,
      {
        status,
        comment,
      }
    );
    return response.data;
  },

  /**
   * Add a transaction to an order (admin only)
   * @param transactionData Transaction data
   * @returns Updated order
   */
  addOrderTransaction: async (transactionData: {
    orderId: string;
    type: OrderTransaction["type"];
    amount: number;
    method: OrderTransaction["method"];
    status: OrderTransaction["status"];
  }): Promise<Order> => {
    const response = await axiosInstance.post<Order>(
      "/orders/transaction",
      transactionData
    );
    return response.data;
  },

  /**
   * Add tracking information to an order (admin only)
   * @param orderId Order ID
   * @param trackingInfo Tracking information
   * @returns Updated order
   */
  addOrderTracking: async (
    orderId: string,
    trackingInfo: {
      carrier: string;
      trackingNumber: string;
      estimatedDelivery?: string;
    }
  ): Promise<Order> => {
    const response = await axiosInstance.put<Order>(
      `/orders/${orderId}/tracking`,
      trackingInfo
    );
    return response.data;
  },

  /**
   * Cancel an order
   * @param orderId Order ID
   * @param reason Cancellation reason
   * @returns Updated order
   */
  cancelOrder: async (orderId: string, reason: string): Promise<Order> => {
    const response = await axiosInstance.put<Order>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data;
  },

  /**
   * Add a note to an order (admin only)
   * @param orderId Order ID
   * @param note Note content
   * @returns Updated order
   */
  addOrderNote: async (orderId: string, note: string): Promise<Order> => {
    const response = await axiosInstance.post<Order>(
      `/orders/${orderId}/notes`,
      { note }
    );
    return response.data;
  },

  /**
   * Process a refund for an order (admin only)
   * @param refundData Refund data
   * @returns Updated order
   */
  refundOrder: async (refundData: {
    orderId: string;
    amount: number;
    reason: string;
    items?: Array<{ itemId: string; quantity: number }>;
  }): Promise<Order> => {
    const response = await axiosInstance.post<Order>(
      "/orders/refund",
      refundData
    );
    return response.data;
  },

  /**
   * Get orders dashboard data (admin only)
   * @returns Dashboard data
   */
  getOrdersDashboard: async (): Promise<{
    totalOrders: number;
    totalSales: number;
    pendingOrders: number;
    cancelledOrders: number;
    recentOrders: Order[];
  }> => {
    const response = await axiosInstance.get("/orders/dashboard");
    return response.data;
  },

  /**
   * Get sales statistics (admin only)
   * @param period Period for statistics ('daily', 'weekly', 'monthly', 'yearly')
   * @returns Sales statistics
   */
  getSalesStats: async (
    period: "daily" | "weekly" | "monthly" | "yearly"
  ): Promise<{
    labels: string[];
    data: number[];
    totalSales: number;
    percentChange: number;
  }> => {
    const response = await axiosInstance.get("/orders/stats", {
      params: { period },
    });
    return response.data;
  },
};

export default orderApi;
