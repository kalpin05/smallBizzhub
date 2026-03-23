import axios from "axios";

/* Base Axios Instance */

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


/* Attach Token Automatically */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Auto-handle expired/invalid tokens */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response?.data?.error || "";
      if (msg.includes("expired") || msg.includes("Invalid token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);


/* AUTH */

export const signup = (data) => {
  return API.post("/auth/signup", data);
};

export const login = (data) => {
  return API.post("/auth/login", data);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

export const getProfile = () => {
  return API.get("/auth/profile");
};

export const updateProfile = (data) => {
  return API.put("/auth/profile", data);
};

export const forgotPassword = (data) => {
  return API.post("/auth/forgot-password", data);
};

export const verifyOtp = (data) => {
  return API.post("/auth/verify-otp", data);
};

export const resetPassword = (data) => {
  return API.post("/auth/reset-password", data);
};

export const changePassword = (data) => {
  return API.put("/auth/change-password", data);
};

export const toggle2FA = (enabled) => {
  return API.put("/auth/toggle-2fa", { enabled });
};

export const getNotificationPreferences = () => {
  return API.get("/auth/notification-preferences");
};

export const saveNotificationPreferences = (prefs) => {
  return API.put("/auth/notification-preferences", prefs);
};

export const getNotifications = () => {
  return API.get("/notifications");
};

export const markNotificationRead = (id) => {
  return API.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return API.put("/notifications/read-all");
};


/* PRODUCTS */

export const getProducts = () => {
  return API.get("/products");
};

export const getBusinessProducts = () => {
  return API.get("/products/business");
};

export const getProductsByBusinessId = (businessId) => {
  return API.get(`/products/business/${businessId}`);
};

export const addProduct = (data) => {
  return API.post("/products", data);
};

export const updateProduct = (id, data) => {
  return API.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return API.delete(`/products/${id}`);
};


/* ORDERS */

export const getOrders = () => {
  return API.get("/orders");
};

export const getBusinessOrders = () => {
  return API.get("/orders/business");
};

export const getClientOrders = () => {
  return API.get("/orders/client");
};

export const createOrder = (data) => {
  return API.post("/orders", data);
};

export const updateOrderStatus = (id, status) => {
  return API.put(`/orders/${id}/status`, { status });
};


/* ANALYTICS */

export const getAnalytics = () => {
  return API.get("/analytics");
};


/* USERS / BUSINESSES */

export const getBusinesses = () => {
  return API.get("/auth/businesses");
};


/* CART */

export const addToCart = (data) => {
  return API.post("/cart", data);
};

export const getCart = () => {
  return API.get("/cart");
};

export const removeFromCart = (id) => {
  return API.delete(`/cart/${id}`);
};

export const clearCart = () => {
  return API.delete("/cart");
};


/* CATEGORIES */

export const getCategories = () => {
  return API.get("/categories");
};

export const addCategory = (data) => {
  return API.post("/categories", data);
};

export const deleteCategory = (id) => {
  return API.delete(`/categories/${id}`);
};


/* REVIEWS */

export const getProductReviews = (productId) => {
  return API.get(`/reviews/product/${productId}`);
};

export const getProductRating = (productId) => {
  return API.get(`/reviews/product/${productId}/rating`);
};

export const addReview = (data) => {
  return API.post("/reviews", data);
};

export const deleteReview = (id) => {
  return API.delete(`/reviews/${id}`);
};


/* STOCK HISTORY */

export const getProductStockHistory = (productId) => {
  return API.get(`/stock-history/product/${productId}`);
};

export const getBusinessStockHistory = () => {
  return API.get("/stock-history/business");
};


/* ADMIN */

export const adminGetStats    = () => API.get("/admin/stats");
export const adminGetUsers    = () => API.get("/admin/users");
export const adminGetProducts = () => API.get("/admin/products");
export const adminGetOrders   = () => API.get("/admin/orders");
export const adminDeleteUser    = (id) => API.delete(`/admin/users/${id}`);
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);


export default API;

