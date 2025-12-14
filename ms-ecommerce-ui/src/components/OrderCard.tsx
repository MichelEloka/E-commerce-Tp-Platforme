import { useState } from "react";
import { User } from "lucide-react";
import { Badge } from "./Badge";
import type { Order } from "../api/types";
import { OrderItemsList } from "./OrderItemsList";

type Props = {
  order: Order;
  userName?: string;
  onUpdateStatus: (id: number, status: Order["status"]) => void;
  onCancel: (id: number) => void;
};

export function OrderCard({ order, userName, onUpdateStatus, onCancel }: Props) {
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
    <div className="card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Commande #{order.id}</span>
            <Badge color={statusColors[order.status]}>{order.status}</Badge>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            {userName ? (
              <>
                <User size={14} />
                <span>{userName}</span>
              </>
            ) : (
              `Utilisateur #${order.userId}`
            )}
          </div>
          <div className="text-sm text-slate-200 font-semibold">{order.totalAmount.toFixed(2)} €</div>
          <div className="text-xs text-slate-400 truncate">{order.shippingAddress}</div>
          {order.orderDate && (
            <div className="text-xs text-slate-500">
              {new Date(order.orderDate).toLocaleString("fr-FR")}
            </div>
          )}
          <button
            className="text-xs text-blue-400 hover:underline"
            onClick={() => setShowItems(!showItems)}
          >
            {showItems ? "Masquer" : "Voir"} les {order.items?.length ?? 0} article(s)
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {canUpdateStatus && nextStatus && (
            <button
              className="btn-ghost subtle text-xs"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              → {nextStatus}
            </button>
          )}

          {canUpdateStatus && (
            <button
              className="btn-ghost subtle text-xs text-red-400"
              onClick={() => onCancel(order.id)}
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {showItems && order.items && order.items.length > 0 && (
        <div className="border-t border-slate-700 pt-2">
          <OrderItemsList items={order.items} />
        </div>
      )}
    </div>
  );
}
