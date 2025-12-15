import { useState, memo } from "react";
import { User, MapPin, Calendar, Package, Eye, XCircle, ChevronRight } from "lucide-react";
import { Badge } from "./Badge";
import type { Order } from "../api/types";
import { OrderItemsList } from "./OrderItemsList";

type Props = {
  order: Order;
  userName?: string;
  onUpdateStatus: (id: number, status: Order["status"]) => void;
  onCancel: (id: number) => void;
  onViewDetails?: (id: number) => void;
};

export const OrderCard = memo(function OrderCard({ order, userName, onUpdateStatus, onCancel, onViewDetails }: Props) {
  const [showItems, setShowItems] = useState(false);

  const statusColors: Record<Order["status"], "green" | "amber" | "sky" | "red"> = {
    PENDING: "amber",
    CONFIRMED: "sky",
    SHIPPED: "sky",
    DELIVERED: "green",
    CANCELLED: "red"
  };

  const canUpdateStatus = order.status !== "DELIVERED" && order.status !== "CANCELLED";

  const getNextStatus = (): Order["status"] | null => {
    if (order.status === "PENDING") return "CONFIRMED";
    if (order.status === "CONFIRMED") return "SHIPPED";
    if (order.status === "SHIPPED") return "DELIVERED";
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="card p-4 hover:shadow-lg transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-50">Commande #{order.id}</h3>
              <Badge color={statusColors[order.status]}>{order.status}</Badge>
            </div>
            <span className="text-xl font-bold text-slate-50">{order.totalAmount.toFixed(2)} €</span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <User size={16} className="flex-shrink-0" />
              <span className="truncate">{userName || `Utilisateur #${order.userId}`}</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">{order.shippingAddress}</span>
            </div>
            {order.orderDate && (
              <div className="flex items-center gap-2 text-muted">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{new Date(order.orderDate).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted">
              <Package size={16} className="flex-shrink-0" />
              <span>{order.items?.length ?? 0} article(s)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-ghost subtle flex items-center gap-2"
              onClick={() => setShowItems(!showItems)}
            >
              <Package size={16} />
              <span>{showItems ? "Masquer" : "Voir"} les articles</span>
            </button>
            {onViewDetails && (
              <button
                className="btn-ghost subtle flex items-center gap-2"
                onClick={() => onViewDetails(order.id)}
              >
                <Eye size={16} />
                <span>Détails</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex lg:flex-col gap-2">
          {canUpdateStatus && nextStatus && (
            <button
              className="btn-primary flex items-center gap-2 flex-1 lg:flex-initial"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              <span>{nextStatus}</span>
              <ChevronRight size={16} />
            </button>
          )}

          {canUpdateStatus && (
            <button
              className="btn-ghost subtle flex items-center gap-2 text-red-400 hover:bg-red-500/10 flex-1 lg:flex-initial"
              onClick={() => onCancel(order.id)}
            >
              <XCircle size={16} />
              <span>Annuler</span>
            </button>
          )}
        </div>
      </div>

      {showItems && order.items && order.items.length > 0 && (
        <div className="border-t border-slate-700 mt-4 pt-4">
          <OrderItemsList items={order.items} />
        </div>
      )}
    </div>
  );
});
