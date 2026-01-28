export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: "ELECTRONICS" | "BOOKS" | "FOOD" | "OTHER";
  imageUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  active?: boolean;
  roles?: string;
};

export type AuthResponse = {
  token: string;
  expiresIn: number;
};

export type OrderItem = {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
};

export type Order = {
  id: number;
  userId: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: string;
  totalAmount: number;
  orderDate?: string;
  items: OrderItem[];
};
