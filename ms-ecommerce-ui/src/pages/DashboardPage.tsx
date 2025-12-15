import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { Order, Product, User } from "../api/types";
import { Panel } from "../components/Panel";
import { Badge } from "../components/Badge";

type DashboardPageProps = {
  orders: Order[];
  products: Product[];
  users: User[];
  usersMap: Map<number, string>;
  orderStats: {
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
  };
  lowStock: number;
};

export function DashboardPage({ orders, products, users, usersMap, orderStats, lowStock }: DashboardPageProps) {
  const navigate = useNavigate();

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  const criticalProducts = useMemo(() =>
    products.filter(p => p.stock < 5 && p.active !== false).sort((a, b) => a.stock - b.stock),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-slate-50 mb-2">Tableau de bord</h2>
        <p className="text-slate-400">Vue d'ensemble de votre plateforme e-commerce</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="card p-4 hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-blue-400" />
            <span className="text-sm text-slate-400">Commandes en attente</span>
          </div>
          <div className="text-3xl font-bold text-slate-50">{orderStats.pendingOrders}</div>
          <div className="text-xs text-blue-400 mt-1">Voir les commandes →</div>
        </button>

        <button
          onClick={() => navigate("/products")}
          className="card p-4 hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <span className="text-sm text-slate-400">Stock critique</span>
          </div>
          <div className="text-3xl font-bold text-slate-50">{lowStock}</div>
          <div className="text-xs text-amber-400 mt-1">Voir les produits →</div>
        </button>

        <button
          onClick={() => navigate("/users")}
          className="card p-4 hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-green-400" />
            <span className="text-sm text-slate-400">Clients actifs</span>
          </div>
          <div className="text-3xl font-bold text-slate-50">{users.filter(u => u.active !== false).length}</div>
          <div className="text-xs text-slate-500 mt-1">Sur {users.length} total</div>
        </button>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-sm text-slate-400">Revenu total</span>
          </div>
          <div className="text-3xl font-bold text-slate-50">{orderStats.totalRevenue.toFixed(0)} €</div>
          <div className="text-xs text-slate-500 mt-1">{orders.length} commandes</div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold text-slate-50 mb-3">Actions rapides</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate("/products/new")} className="btn-primary">
            + Nouveau produit
          </button>
          <button onClick={() => navigate("/orders/new")} className="btn-primary">
            + Nouvelle commande
          </button>
          <button onClick={() => navigate("/users/new")} className="btn-primary">
            + Nouvel utilisateur
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Commandes récentes" className="lg:col-span-2">
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <div className="text-slate-400 text-sm py-4 text-center">Aucune commande</div>
            )}
            {recentOrders.map(order => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="card p-3 hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">Commande #{order.id}</span>
                    <Badge color={
                      order.status === "CANCELLED" ? "red" :
                      order.status === "PENDING" ? "amber" :
                      order.status === "DELIVERED" ? "green" : "blue"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-slate-50 font-semibold">{order.totalAmount.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{usersMap.get(order.userId) || `User #${order.userId}`}</span>
                  <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {recentOrders.length > 0 && (
              <button onClick={() => navigate("/orders")} className="btn-ghost subtle w-full">
                Voir toutes les commandes →
              </button>
            )}
          </div>
        </Panel>

        <Panel title="Statuts des commandes">
          <div className="space-y-2">
            {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map(status => {
              const count = orders.filter(o => o.status === status).length;
              const percentage = orders.length > 0 ? ((count / orders.length) * 100).toFixed(0) : 0;
              const color = status === "CANCELLED" ? "red" : status === "PENDING" ? "amber" : status === "DELIVERED" ? "green" : "blue";
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge color={color}>{status}</Badge>
                    <span className="text-slate-300 font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${color}-400`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {criticalProducts.length > 0 && (
          <Panel title="⚠️ Alerte stock critique">
            <div className="space-y-2">
              {criticalProducts.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="flex items-center justify-between text-sm p-2 hover:bg-slate-700/50 rounded cursor-pointer transition-colors"
                >
                  <span className="text-slate-300 truncate flex-1">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge color={p.stock === 0 ? "red" : "amber"}>
                      Stock: {p.stock}
                    </Badge>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate("/products")} className="btn-ghost subtle w-full mt-2">
                Voir tous les produits →
              </button>
            </div>
          </Panel>
        )}

        <Panel title="Produits les mieux approvisionnés">
          <div className="space-y-2">
            {products
              .filter(p => p.active !== false)
              .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
              .slice(0, 5)
              .map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="flex items-center justify-between text-sm p-2 hover:bg-slate-700/50 rounded cursor-pointer transition-colors"
                >
                  <span className="text-slate-300 truncate flex-1">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge color="green">
                      {p.stock}
                    </Badge>
                    <span className="text-slate-400 text-xs">{p.price.toFixed(0)}€</span>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
