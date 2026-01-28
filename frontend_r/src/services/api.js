// API service for connecting to Django backend

const API_BASE_URL = 'http://localhost:8000/home';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout/', {
      method: 'POST',
    });
  }

  // Client methods
  async discoverBusinesses() {
    return this.request('/clients/discover-businesses/');
  }

  async discoverProducts(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/clients/discover-products/${params}`);
  }

  async getCategories() {
    return this.request('/categories/');
  }

  async createOrder(orderData) {
    return this.request('/clients/create-order/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Business methods
  async getBusinessProfile() {
    return this.request('/business/profile/');
  }

  async updateBusinessProfile(profileData) {
    return this.request('/business/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getBusinessProducts() {
    return this.request('/business/products/');
  }

  async createProduct(productData) {
    return this.request('/business/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getBusinessOrders() {
    return this.request('/business/orders/');
  }

  async getBusinessAnalytics() {
    return this.request('/business/analytics/');
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/business/orders/${orderId}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications/');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read/`, {
      method: 'PUT',
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
