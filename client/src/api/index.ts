import axiosInstance from "./axiosInstance";
import authApi from "./authApi";
import userApi from "./userApi";
import productApi from "./productApi";
import categoryApi from "./categoryApi";
import orderApi from "./orderApi";

export { axiosInstance, authApi, userApi, productApi, categoryApi, orderApi };

// Export default as a combined API object
export default {
  auth: authApi,
  users: userApi,
  products: productApi,
  categories: categoryApi,
  orders: orderApi,
};
