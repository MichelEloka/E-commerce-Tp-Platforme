import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "./api/client";
import type { Order, Product, User } from "./api/types";
import { Panel } from "./components/Panel";
import { Badge } from "./components/Badge";
import { StatCard } from "./components/StatCard";
import { ProductFields } from "./components/ProductFields";
import { UserFields } from "./components/UserFields";
import { ProductCard } from "./components/ProductCard";
import { UserCard } from "./components/UserCard";

type View = "dashboard" | "products" | "orders" | "users";

const categories: Product["category"][] = ["ELECTRONICS", "BOOKS", "FOOD", "OTHER"];

function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<View>("products");
  const [products, setProducts] = useState<Product[]>([]);
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
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userActiveOnly, setUserActiveOnly] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [userIdLookup, setUserIdLookup] = useState("");

  const lowStock = useMemo(() => products.filter(p => p.stock < 5).length, [products]);
  const totalStock = useMemo(() => products.reduce((acc, p) => acc + (p.stock ?? 0), 0), [products]);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = search ? await api.products.search(search) : await api.products.list();
      setProducts(data as Product[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const data = await api.users.list();
      setUsers(data as User[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function loadUsersActive() {
    try {
      const data = await api.users.active();
      setUsers(data as User[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function searchUsers() {
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
  }

  async function loadOrders() {
    try {
      const data = await api.orders.list();
      setOrders(data as Order[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

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

  async function handleViewDetails(id: number) {
    try {
      const data = await api.products.get(id);
      setDetailProduct(data as Product);
      setEditProduct(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleSaveEdit() {
    if (!editProduct || !editProduct.id) return;
    try {
      setLoading(true);
      await api.products.update(editProduct.id, {
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price,
        stock: editProduct.stock,
        category: editProduct.category,
        imageUrl: editProduct.imageUrl,
        active: editProduct.active
      });
      await loadProducts();
      await handleViewDetails(editProduct.id);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters() {
    try {
      setLoading(true);
      let data: Product[] = [];
      if (filterAvailable) {
        data = (await api.products.available()) as Product[];
        if (filterCategory) {
          data = data.filter(p => p.category === filterCategory);
        }
      } else if (filterCategory) {
        data = (await api.products.byCategory(filterCategory)) as Product[];
      } else if (search) {
        data = (await api.products.search(search)) as Product[];
      } else {
        data = (await api.products.list()) as Product[];
      }
      if (filterActive === "active") {
        data = data.filter(p => p.active !== false);
      } else if (filterActive === "inactive") {
        data = data.filter(p => p.active === false);
      }
      setProducts(data);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    try {
      setLoading(true);
      await api.users.create(newUser);
      setNewUser({ firstName: "", lastName: "", email: "" });
      await (userActiveOnly ? loadUsersActive() : loadUsers());
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewUser(id: number) {
    try {
      const data = await api.users.get(id);
      setDetailUser(data as User);
      setEditUser(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleSaveUserEdit() {
    if (!editUser || !editUser.id) return;
    try {
      setLoading(true);
      await api.users.update(editUser.id, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phoneNumber: editUser.phoneNumber
      });
      await (userActiveOnly ? loadUsersActive() : loadUsers());
      await handleViewUser(editUser.id);
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
      if (detailUser?.id === id) {
        setDetailUser(null);
        setEditUser(null);
      }
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
      if (detailUser?.id === id) {
        await handleViewUser(id);
      }
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    }
  }

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
            <button className="btn-ghost" onClick={() => { setView("products"); setShowNewProduct(s => !s); }}>
              {showNewProduct ? "Masquer produit" : "Add product"}
            </button>
            <button className="btn-ghost" onClick={() => { setView("users"); setShowNewUser(s => !s); }}>
              {showNewUser ? "Masquer user" : "Add user"}
            </button>
            <button className="btn-ghost theme-toggle" onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="view-toggle card p-2 flex gap-2 flex-wrap">
          {(["dashboard", "products", "orders", "users"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`tab ${view === v ? "active" : ""}`}>
              {v}
            </button>
          ))}
        </div>

        {view === "dashboard" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard label="Produits" value={products.length} hint={`${lowStock} à stock bas (<5)`} />
              <StatCard label="Utilisateurs" value={users.length} />
              <StatCard label="Stock total" value={totalStock} />
            </div>

            <Panel title="Produits par catégorie">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <div key={cat} className="card p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">{cat}</div>
                    <div className="text-xl font-bold text-slate-50">{createdByCategory[cat] ?? 0}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {view === "products" && (
          <div className="space-y-4">
            {showNewProduct && (
              <Panel
                title="Nouveau produit"
                actions={<span className="text-xs text-slate-400">{loading ? "Chargement..." : ""}</span>}
              >
                <ProductFields
                  value={newProduct}
                  categories={categories}
                  onChange={setNewProduct}
                  includeActive
                />
                <div className="flex justify-end mt-3">
                  <button className="btn-primary" onClick={handleCreateProduct} disabled={loading}>
                    Créer
                  </button>
                </div>
              </Panel>
            )}

            <Panel
              title="Catalogue produits"
              actions={
                <div className="flex gap-2">
                  <input
                    className="card px-3 py-2"
                    placeholder="Rechercher par nom"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button className="btn-primary" onClick={loadProducts}>
                    Rechercher
                  </button>
                  <button className="btn-ghost" onClick={() => setShowFilters(s => !s)}>
                    {showFilters ? "Fermer filtres" : "Filtrer"}
                  </button>
                </div>
              }
              >
              {showFilters && (
                <div className="card p-2 mb-3 flex flex-wrap gap-2 items-center text-sm shadow-none border-dashed">
                  <label className="field w-48">
                    <span>Catégorie</span>
                    <select
                      className="card px-3 py-2"
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                    >
                      <option value="">Toutes</option>
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field flex-row items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterAvailable}
                      onChange={e => setFilterAvailable(e.target.checked)}
                    />
                    <span>En stock uniquement</span>
                  </label>
                  <label className="field w-40">
                    <span>Statut</span>
                    <select
                      className="card px-3 py-2"
                      value={filterActive}
                      onChange={e => setFilterActive(e.target.value as "all" | "active" | "inactive")}
                    >
                      <option value="all">Tous</option>
                      <option value="active">Actifs</option>
                      <option value="inactive">Inactifs</option>
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button
                      className="btn-ghost subtle"
                      onClick={() => { setFilterCategory(""); setFilterAvailable(false); setFilterActive("all"); applyFilters(); }}
                    >
                      Réinitialiser
                    </button>
                    <button className="btn-primary" onClick={applyFilters}>
                      Appliquer
                    </button>
                  </div>
                </div>
              )}
                <div className="grid gap-3">
                  {products.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onUpdateStock={handleUpdateStock}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              </Panel>
            </div>
        )}

        {view === "orders" && (
          <Panel title="Commandes">
            <div className="grid gap-3">
              {orders.length === 0 && <div className="text-slate-400">Aucune commande pour le moment.</div>}
              {orders.map(o => (
                <div key={o.id} className="card p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Commande #{o.id}</div>
                    <Badge color={o.status === "CANCELLED" ? "red" : o.status === "PENDING" ? "amber" : "green"}>
                      {o.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">Utilisateur #{o.userId}</div>
                  <div className="text-sm text-slate-200 font-semibold">Total : {o.totalAmount} €</div>
                  <div className="text-xs text-slate-400">Livraison : {o.shippingAddress}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {view === "users" && (
          <div className="space-y-4">
            <div className="card p-3 flex flex-wrap gap-3 items-center">
              <input
                className="card px-3 py-2"
                placeholder="Rechercher par nom"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  className="card px-3 py-2 w-32"
                  placeholder="ID utilisateur"
                  value={userIdLookup}
                  onChange={e => setUserIdLookup(e.target.value)}
                />
                <button className="btn-ghost subtle" onClick={() => userIdLookup && handleViewUser(Number(userIdLookup))}>
                  Charger ID
                </button>
              </div>
              <label className="field flex-row items-center gap-2">
                <input
                  type="checkbox"
                  checked={userActiveOnly}
                  onChange={e => {
                    setUserActiveOnly(e.target.checked);
                    if (e.target.checked) loadUsersActive(); else loadUsers();
                  }}
                />
                <span>Actifs seulement</span>
              </label>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={searchUsers}>Rechercher</button>
                <button className="btn-ghost subtle" onClick={() => { setUserSearch(""); setUserActiveOnly(false); loadUsers(); }}>
                  Réinitialiser
                </button>
              </div>
            </div>
            {showNewUser && (
              <Panel title="Nouvel utilisateur">
                <UserFields value={newUser} onChange={setNewUser} />
                <div className="flex justify-end mt-3">
                  <button className="btn-primary" onClick={handleCreateUser} disabled={loading}>
                    Créer l'utilisateur
                  </button>
                </div>
              </Panel>
            )}

            <Panel title="Utilisateurs">
              <div className="grid gap-3">
                {users.map(u => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onView={handleViewUser}
                    onDelete={handleDeleteUser}
                    onToggleActive={(id, active) => {
                      if (active) {
                        handleDeactivateUser(id);
                      } else {
                        handleViewUser(id); // fallback to edit since no activate endpoint
                      }
                    }}
                  />
                ))}
              </div>
            </Panel>
          </div>
        )}
      </main>

      {detailProduct && (
        <div className="modal-backdrop" onClick={() => { setDetailProduct(null); setEditProduct(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">
                {editProduct ? "Modifier le produit" : detailProduct.name}
              </h3>
              <div className="flex gap-2">
                {editProduct && (
                  <button className="btn-ghost subtle" onClick={() => setEditProduct(null)}>
                    Back
                  </button>
                )}
                {!editProduct && (
                  <button className="btn-ghost subtle" onClick={() => setEditProduct(detailProduct)}>
                    Modifier
                  </button>
                )}
                <button className="btn-ghost subtle" onClick={() => { setDetailProduct(null); setEditProduct(null); }}>
                  Fermer
                </button>
              </div>
            </div>

            {!editProduct && (
              <div className="flex flex-col md:flex-row gap-4">
                {detailProduct.imageUrl ? (
                  <img src={detailProduct.imageUrl} alt={detailProduct.name} className="product-img large" loading="lazy" />
                ) : (
                  <div className="product-img large placeholder">{detailProduct.name?.charAt(0) ?? "?"}</div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="text-base font-semibold">{detailProduct.name}</div>
                  <div className="text-muted">{detailProduct.description}</div>
                  <div className="flex gap-2 items-center">
                    <Badge color={detailProduct.stock < 5 ? "amber" : "green"}>Stock {detailProduct.stock}</Badge>
                    <Badge>{detailProduct.category}</Badge>
                    {detailProduct.active === false && <Badge color="red">Inactif</Badge>}
                  </div>
                  <div className="text-base font-bold">{detailProduct.price.toFixed(2)} €</div>
                  <div className="text-xs text-muted">
                    Créé le {detailProduct.createdAt ? new Date(detailProduct.createdAt).toLocaleString() : "N/A"}
                  </div>
                </div>
              </div>
            )}

            {editProduct && (
              <div className="space-y-3">
                <ProductFields
                  value={editProduct}
                  categories={categories}
                  onChange={setEditProduct}
                  includeActive
                />
                <div className="flex justify-end gap-2">
                  <button className="btn-ghost subtle" onClick={() => setEditProduct(null)}>
                    Annuler
                  </button>
                  <button className="btn-primary" onClick={handleSaveEdit} disabled={loading}>
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detailUser && (
        <div className="modal-backdrop" onClick={() => { setDetailUser(null); setEditUser(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">
                {editUser ? "Modifier l'utilisateur" : detailUser.firstName ? `${detailUser.firstName} ${detailUser.lastName ?? ""}` : `Utilisateur #${detailUser.id}`}
              </h3>
              <div className="flex gap-2">
                {editUser && (
                  <button className="btn-ghost subtle" onClick={() => setEditUser(null)}>Back</button>
                )}
                {!editUser && (
                  <button className="btn-ghost subtle" onClick={() => setEditUser(detailUser)}>Modifier</button>
                )}
                <button className="btn-ghost subtle" onClick={() => { setDetailUser(null); setEditUser(null); }}>Fermer</button>
              </div>
            </div>

            {!editUser && (
              <div className="space-y-2 text-sm">
                <div className="text-base font-semibold">{detailUser.firstName ? `${detailUser.firstName} ${detailUser.lastName ?? ""}` : `ID ${detailUser.id}`}</div>
                <div className="text-muted">{detailUser.email}</div>
                {detailUser.phoneNumber && <div className="text-muted">{detailUser.phoneNumber}</div>}
              </div>
            )}

            {editUser && (
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <label className="field">
                    <span>Prénom</span>
                    <input
                      className="card px-3 py-2"
                      value={editUser.firstName ?? ""}
                      onChange={e => setEditUser(u => ({ ...u, firstName: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Nom</span>
                    <input
                      className="card px-3 py-2"
                      value={editUser.lastName ?? ""}
                      onChange={e => setEditUser(u => ({ ...u, lastName: e.target.value }))}
                    />
                  </label>
                  <label className="field md:col-span-3 md:col-span-1">
                    <span>Email</span>
                    <input
                      className="card px-3 py-2"
                      value={editUser.email ?? ""}
                      onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))}
                    />
                  </label>
                  <label className="field md:col-span-3 md:col-span-1">
                    <span>Téléphone</span>
                    <input
                      className="card px-3 py-2"
                      value={editUser.phoneNumber ?? ""}
                      onChange={e => setEditUser(u => ({ ...u, phoneNumber: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="btn-ghost subtle" onClick={() => setEditUser(null)}>Annuler</button>
                  <button className="btn-primary" onClick={handleSaveUserEdit} disabled={loading}>Sauvegarder</button>
                </div>
              </div>
            )}

            {!editUser && (
              <div className="flex gap-2 mt-3">
                <button className="btn-ghost subtle" onClick={() => handleDeactivateUser(detailUser.id)}>Désactiver</button>
                <button className="btn-ghost subtle" onClick={() => handleDeleteUser(detailUser.id)}>Supprimer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
