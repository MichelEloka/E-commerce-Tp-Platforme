import { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Sun, Moon } from "lucide-react";
import { api } from "./api/client";
import type { Order, Product, User } from "./api/types";
import {
  DashboardPage,
  ProductsPage,
  NewProductPage,
  ProductDetailPage,
  ProductEditPage,
  OrdersPage,
  NewOrderPage,
  OrderDetailPage,
  UsersPage,
  NewUserPage,
  UserDetailPage,
  UserEditPage
} from "./pages";


const categories: Product["category"][] = ["ELECTRONICS", "BOOKS", "FOOD", "OTHER"];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "ELECTRONICS"
  });
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "" });
  const [userSearch, setUserSearch] = useState("");
  const [userActiveOnly, setUserActiveOnly] = useState(false);
  const [userIdLookup, setUserIdLookup] = useState("");
  const [newOrder, setNewOrder] = useState<{ userId: number | ""; shippingAddress: string; items: Array<{ productId: number | ""; quantity: number }> }>({
    userId: "",
    shippingAddress: "",
    items: []
  });
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>("");

  const lowStock = useMemo(() => products.filter(p => p.stock < 5).length, [products]);
  const totalStock = useMemo(() => products.reduce((acc, p) => acc + (p.stock ?? 0), 0), [products]);

  const orderStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === "PENDING").length;
    const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
    return { totalRevenue, pendingOrders, deliveredOrders };
  }, [orders]);

  const usersMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach(u => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || `User #${u.id}`;
      map.set(u.id, fullName);
    });
    return map;
  }, [users]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.products.list();
      setAllProducts(data as Product[]);
      setProducts(data as Product[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.users.list();
      setUsers(data as User[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }, []);

  const loadUsersActive = useCallback(async () => {
    try {
      const data = await api.users.active();
      setUsers(data as User[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }, []);

  const searchUsers = useCallback(async () => {
    try {
      setLoading(true);
      if (!userSearch) {
        userActiveOnly ? await loadUsersActive() : await loadUsers();
        return;
      }
      const data = await api.users.search(userSearch);
      setUsers(data as User[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [userSearch, userActiveOnly, loadUsersActive, loadUsers]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.orders.list();
      setOrders(data as Order[]);
      setError(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      console.error("Error loading orders:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadUsers();
    loadOrders();
  }, []);

  useEffect(() => {
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  async function handleCreateProduct() {
    try {
      setLoading(true);
      await api.products.create({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      });
      await loadProducts();
      setNewProduct({ name: "", description: "", price: 0, stock: 0, category: "ELECTRONICS" });
      toast.success("Produit créé avec succès");
      navigate("/products");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.products.delete(id);
      await loadProducts();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleUpdateStock(id: number, stock: number) {
    try {
      await api.products.updateStock(id, stock);
      await loadProducts();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleSaveProductEdit(id: number, product: Partial<Product>) {
    try {
      setLoading(true);
      await api.products.update(id, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        active: product.active
      });
      await loadProducts();
      toast.success("Produit mis à jour avec succès");
      navigate(`/products/${id}`);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering using useMemo for instant results
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by search text
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Filter by availability (stock > 0)
    if (filterAvailable) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Filter by active status
    if (filterActive === "active") {
      filtered = filtered.filter(p => p.active !== false);
    } else if (filterActive === "inactive") {
      filtered = filtered.filter(p => p.active === false);
    }

    return filtered;
  }, [allProducts, search, filterCategory, filterAvailable, filterActive]);

  async function handleCreateUser() {
    try {
      setLoading(true);
      await api.users.create(newUser);
      setNewUser({ firstName: "", lastName: "", email: "" });
      await (userActiveOnly ? loadUsersActive() : loadUsers());
      toast.success("Utilisateur créé avec succès");
      navigate("/users");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUserEdit(id: number, user: Partial<User>) {
    try {
      setLoading(true);
      await api.users.update(id, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      });
      await (userActiveOnly ? loadUsersActive() : loadUsers());
      toast.success("Utilisateur mis à jour avec succès");
      navigate(`/users/${id}`);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id: number) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.users.delete(id);
      await (userActiveOnly ? loadUsersActive() : loadUsers());
      toast.success("Utilisateur supprimé");
      navigate("/users");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleDeactivateUser(id: number) {
    try {
      await api.users.deactivate(id);
      await (userActiveOnly ? loadUsersActive() : loadUsers());
      toast.success("Utilisateur désactivé");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleCreateOrder() {
    if (!newOrder.userId || newOrder.items.length === 0) {
      toast.error("Veuillez sélectionner un utilisateur et ajouter au moins un article");
      return;
    }
    try {
      setLoading(true);
      await api.orders.create({
        userId: Number(newOrder.userId),
        shippingAddress: newOrder.shippingAddress,
        items: newOrder.items.map(item => ({
          productId: Number(item.productId),
          quantity: item.quantity
        }))
      });
      setNewOrder({ userId: "", shippingAddress: "", items: [] });
      await loadOrders();
      toast.success("Commande créée avec succès");
      navigate("/orders");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOrderStatus(id: number, status: Order["status"]) {
    try {
      await api.orders.updateStatus(id, status);
      await loadOrders();
      toast.success(`Statut mis à jour: ${status}`);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleCancelOrder(id: number) {
    if (!confirm("Annuler cette commande ?")) return;
    try {
      await api.orders.delete(id);
      await loadOrders();
      toast.success("Commande annulée");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  const applyOrderFilters = useCallback(async () => {
    try {
      setLoading(true);
      const data = filterOrderStatus
        ? await api.orders.byStatus(filterOrderStatus)
        : await api.orders.list();
      setOrders(data as Order[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filterOrderStatus]);

  const createdByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categories) map[c] = 0;
    for (const p of products) {
      if (p.category) {
        map[p.category] = (map[p.category] ?? 0) + 1;
      }
    }
    return map;
  }, [products]);

  return (
    <div className="app-shell">
      <ToastContainer position="bottom-right" theme={theme === "dark" ? "dark" : "light"} transition={Slide} />
      <header className="app-header sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">E-commerce Manager</h1>
            <p className="text-sm text-muted">Pilotage des services Membership, Product, Order</p>
          </div>
          <div className="flex items-center gap-2">
            {location.pathname.startsWith("/products") && !location.pathname.includes("/new") && (
              <button className="btn-primary" onClick={() => navigate("/products/new")}>
                + Nouveau produit
              </button>
            )}
            {location.pathname.startsWith("/users") && !location.pathname.includes("/new") && (
              <button className="btn-primary" onClick={() => navigate("/users/new")}>
                + Nouvel utilisateur
              </button>
            )}
            {location.pathname.startsWith("/orders") && !location.pathname.includes("/new") && (
              <button className="btn-primary" onClick={() => navigate("/orders/new")}>
                + Nouvelle commande
              </button>
            )}
            <button className="btn-ghost theme-toggle" onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="view-toggle card p-2 flex gap-2 flex-wrap">
          <NavLink to="/" end className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            orders
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            users
          </NavLink>
        </div>

        <Routes>
          <Route path="/" element={
            <DashboardPage
              orders={orders}
              products={products}
              users={users}
              usersMap={usersMap}
              orderStats={orderStats}
              lowStock={lowStock}
            />
          } />
          <Route path="/products" element={
            <ProductsPage
              search={search}
              setSearch={setSearch}
              filteredProducts={filteredProducts}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
            />
          } />
          <Route path="/products/new" element={
            <NewProductPage
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              loading={loading}
              onCreateProduct={handleCreateProduct}
            />
          } />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={
            <ProductEditPage
              loading={loading}
              onSaveProductEdit={handleSaveProductEdit}
            />
          } />
          <Route path="/orders" element={
            <OrdersPage
              filterOrderStatus={filterOrderStatus}
              setFilterOrderStatus={setFilterOrderStatus}
              orders={orders}
              usersMap={usersMap}
              onApplyOrderFilters={applyOrderFilters}
              onLoadOrders={loadOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCancelOrder={handleCancelOrder}
            />
          } />
          <Route path="/orders/new" element={
            <NewOrderPage
              newOrder={newOrder}
              setNewOrder={setNewOrder}
              users={users}
              products={products}
              loading={loading}
              onCreateOrder={handleCreateOrder}
            />
          } />
          <Route path="/orders/:id" element={
            <OrderDetailPage
              usersMap={usersMap}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCancelOrder={handleCancelOrder}
            />
          } />
          <Route path="/users" element={
            <UsersPage
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userActiveOnly={userActiveOnly}
              setUserActiveOnly={setUserActiveOnly}
              userIdLookup={userIdLookup}
              setUserIdLookup={setUserIdLookup}
              users={users}
              onSearchUsers={searchUsers}
              onLoadUsersActive={loadUsersActive}
              onLoadUsers={loadUsers}
              onDeleteUser={handleDeleteUser}
              onDeactivateUser={handleDeactivateUser}
            />
          } />
          <Route path="/users/new" element={
            <NewUserPage
              newUser={newUser}
              setNewUser={setNewUser}
              loading={loading}
              onCreateUser={handleCreateUser}
            />
          } />
          <Route path="/users/:id" element={
            <UserDetailPage
              onDeactivateUser={handleDeactivateUser}
              onDeleteUser={handleDeleteUser}
            />
          } />
          <Route path="/users/:id/edit" element={
            <UserEditPage
              loading={loading}
              onSaveUserEdit={handleSaveUserEdit}
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
