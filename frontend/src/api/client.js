const BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "storefront.token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // auth
  register: (data) =>
    request("/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) =>
    request("/auth/login", { method: "POST", body: data, auth: false }),
  me: () => request("/auth/me"),

  // catalog
  categories: () => request("/categories", { auth: false }),
  products: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "" && v !== null,
      ),
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`, { auth: false });
  },
  product: (slug) => request(`/products/${slug}`, { auth: false }),
  createProduct: (data) => request("/products", { method: "POST", body: data }),
  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: "PATCH", body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // cart
  cart: () => request("/cart"),
  addToCart: (product_id, quantity = 1) =>
    request("/cart/items", { method: "POST", body: { product_id, quantity } }),
  updateCartItem: (id, product_id, quantity) =>
    request(`/cart/items/${id}`, {
      method: "PATCH",
      body: { product_id, quantity },
    }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: "DELETE" }),

  // orders
  orders: () => request("/orders"),
  order: (id) => request(`/orders/${id}`),
  checkout: (shipping_address) =>
    request("/orders/checkout", { method: "POST", body: { shipping_address } }),

  // admin
  adminOrders: (status) =>
    request(`/admin/orders${status ? `?status=${status}` : ""}`),
  adminOrder: (id) => request(`/admin/orders/${id}`),
  adminOrderStats: () => request("/admin/orders/stats"),
  adminUpdateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}`, { method: "PATCH", body: { status } }),
};
