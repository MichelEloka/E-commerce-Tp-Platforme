const MEMBERSHIP_API = import.meta.env.VITE_MEMBERSHIP_API ?? "http://localhost:8081";
const PRODUCT_API = import.meta.env.VITE_PRODUCT_API ?? "http://localhost:8082";
const ORDER_API = import.meta.env.VITE_ORDER_API ?? "http://localhost:8083";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(base: string, path: string, method: HttpMethod = "GET", body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new Error("Impossible de contacter le service. Vérifiez le réseau ou l'URL.");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        if (typeof json.message === "string") {
          message = json.message;
        } else if (typeof json.error === "string") {
          message = json.error;
        }
      } catch {
        // ignore parse error and keep fallback message
      }
    } else {
      const text = await res.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

export const api = {
  products: {
    list: () => request<any[]>(PRODUCT_API, "/api/v1/products"),
    search: (name: string) => request<any[]>(PRODUCT_API, `/api/v1/products/search?name=${encodeURIComponent(name)}`),
    get: (id: number) => request<any>(PRODUCT_API, `/api/v1/products/${id}`),
    byCategory: (category: string) => request<any[]>(PRODUCT_API, `/api/v1/products/category/${category}`),
    available: () => request<any[]>(PRODUCT_API, `/api/v1/products/available`),
    create: (payload: any) => request(PRODUCT_API, "/api/v1/products", "POST", payload),
    update: (id: number, payload: any) => request(PRODUCT_API, `/api/v1/products/${id}`, "PUT", payload),
    delete: (id: number) => request<void>(PRODUCT_API, `/api/v1/products/${id}`, "DELETE"),
    updateStock: (id: number, stock: number) =>
      request(PRODUCT_API, `/api/v1/products/${id}/stock`, "PATCH", { stock })
  },
  users: {
    list: () => request<any[]>(MEMBERSHIP_API, "/api/v1/users"),
    get: (id: number) => request<any>(MEMBERSHIP_API, `/api/v1/users/${id}`),
    create: (payload: any) => request(MEMBERSHIP_API, "/api/v1/users", "POST", payload),
    update: (id: number, payload: any) => request(MEMBERSHIP_API, `/api/v1/users/${id}`, "PUT", payload),
    delete: (id: number) => request<void>(MEMBERSHIP_API, `/api/v1/users/${id}`, "DELETE"),
    search: (lastName: string) => request<any[]>(MEMBERSHIP_API, `/api/v1/users/search?lastName=${encodeURIComponent(lastName)}`),
    active: () => request<any[]>(MEMBERSHIP_API, "/api/v1/users/active"),
    deactivate: (id: number) => request<any>(MEMBERSHIP_API, `/api/v1/users/${id}/deactivate`, "PATCH")
  },
  orders: {
    list: () => request<any[]>(ORDER_API, "/api/v1/orders"),
    byStatus: (status: string) => request<any[]>(ORDER_API, `/api/v1/orders/status/${status}`),
    create: (payload: any) => request(ORDER_API, "/api/v1/orders", "POST", payload),
    updateStatus: (id: number, status: string) =>
      request(ORDER_API, `/api/v1/orders/${id}/status`, "PUT", { status }),
    delete: (id: number) => request<void>(ORDER_API, `/api/v1/orders/${id}`, "DELETE")
  }
};
