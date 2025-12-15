import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Order, Product, User } from "../api/types";
import { Panel } from "../components/Panel";
import { OrderFields } from "../components/OrderFields";
import { OrderCard } from "../components/OrderCard";
import { Badge } from "../components/Badge";
import { api } from "../api/client";

// ===== OrdersPage (Liste) =====
type OrdersPageProps = {
  filterOrderStatus: string;
  setFilterOrderStatus: (value: string) => void;
  orders: Order[];
  usersMap: Map<number, string>;
  onApplyOrderFilters: () => void;
  onLoadOrders: () => void;
  onUpdateOrderStatus: (id: number, status: Order["status"]) => void;
  onCancelOrder: (id: number) => void;
};

export function OrdersPage({
  filterOrderStatus,
  setFilterOrderStatus,
  orders,
  usersMap,
  onApplyOrderFilters,
  onLoadOrders,
  onUpdateOrderStatus,
  onCancelOrder
}: OrdersPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam !== null) setFilterOrderStatus(statusParam);
  }, []);

  useEffect(() => {
    if (filterOrderStatus) {
      onApplyOrderFilters();
    }
  }, [filterOrderStatus, onApplyOrderFilters]);

  return (
    <div className="space-y-4">
      <Panel
        title="Commandes"
        actions={
          <div className="flex gap-2 items-center">
            <select
              className="card px-3 py-2 text-sm"
              value={filterOrderStatus}
              onChange={e => setFilterOrderStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button className="btn-ghost subtle" onClick={() => { setFilterOrderStatus(""); onLoadOrders(); }}>
              Réinitialiser
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          {orders.length === 0 && <div className="text-slate-400">Aucune commande pour le moment.</div>}
          {orders.map(o => (
            <OrderCard
              key={o.id}
              order={o}
              userName={usersMap.get(o.userId)}
              onUpdateStatus={onUpdateOrderStatus}
              onCancel={onCancelOrder}
              onViewDetails={(id) => navigate(`/orders/${id}`)}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ===== NewOrderPage =====
type NewOrderPageProps = {
  newOrder: {
    userId: number | "";
    shippingAddress: string;
    items: Array<{ productId: number | ""; quantity: number }>;
  };
  setNewOrder: (value: any) => void;
  users: User[];
  products: Product[];
  loading: boolean;
  onCreateOrder: () => void;
};

export function NewOrderPage({ newOrder, setNewOrder, users, products, loading, onCreateOrder }: NewOrderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Panel
        title="Nouvelle commande"
        actions={<span className="text-xs text-slate-400">{loading ? "Chargement..." : ""}</span>}
      >
        <OrderFields
          value={newOrder}
          onChange={setNewOrder}
          users={users}
          products={products}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-ghost" onClick={() => navigate("/orders")}>
            Annuler
          </button>
          <button className="btn-primary" onClick={onCreateOrder} disabled={loading}>
            Créer la commande
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ===== OrderDetailPage =====
type OrderDetailPageProps = {
  usersMap: Map<number, string>;
  onUpdateOrderStatus: (id: number, status: Order["status"]) => void;
  onCancelOrder: (id: number) => void;
};

export function OrderDetailPage({ usersMap, onUpdateOrderStatus, onCancelOrder }: OrderDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      api.orders.get(Number(id))
        .then(data => setOrder(data as Order))
        .catch(e => {
          toast.error((e as Error).message);
          navigate("/orders");
        });
    }
  }, [id, navigate]);

  if (!order) return <div className="text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <Panel
        title={`Commande #${order.id}`}
        actions={
          <button className="btn-ghost subtle" onClick={() => navigate("/orders")}>
            Retour
          </button>
        }
      >
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted">Client</div>
              <div className="font-semibold">{usersMap.get(order.userId) || `User #${order.userId}`}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Statut</div>
              <div>
                <Badge color={order.status === "CANCELLED" ? "red" : order.status === "PENDING" ? "amber" : order.status === "DELIVERED" ? "green" : "blue"}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">Montant total</div>
              <div className="font-bold">{order.totalAmount.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-sm text-muted">Adresse de livraison</div>
              <div>{order.shippingAddress}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Articles</div>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="card p-2 flex justify-between items-center">
                  <span>Produit #{item.productId}</span>
                  <span className="text-sm">Quantité: {item.quantity} × {item.price?.toFixed(2) || "0.00"}€</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="card px-3 py-2 text-sm"
              value={order.status}
              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order["status"])}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button className="btn-ghost subtle" onClick={() => onCancelOrder(order.id)}>
              Annuler la commande
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
