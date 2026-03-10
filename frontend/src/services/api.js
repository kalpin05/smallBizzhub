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

export const resetPassword = (data) => {
  return API.post("/auth/reset-password", data);
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


export default API;
