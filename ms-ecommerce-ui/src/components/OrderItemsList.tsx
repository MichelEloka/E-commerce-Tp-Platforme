import type { OrderItem } from "../api/types";

type Props = {
  items: OrderItem[];
};

export function OrderItemsList({ items }: Props) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-slate-400 italic">Aucun article dans cette commande.</div>;
  }

  const total = items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-300">Articles commandés</div>

      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="card p-2 flex justify-between items-center text-sm">
            <div className="flex-1">
              <div className="font-medium text-slate-200">
                {item.productName || `Produit #${item.productId}`}
              </div>
              <div className="text-xs text-slate-400">
                {item.quantity} × {item.unitPrice.toFixed(2)} €
              </div>
            </div>
            <div className="font-semibold text-slate-100">
              {item.subtotal?.toFixed(2) ?? (item.quantity * item.unitPrice).toFixed(2)} €
            </div>
          </div>
        ))}
      </div>

      <div className="card p-3 bg-slate-800/50 flex justify-between items-center">
        <span className="font-semibold text-slate-200">Total</span>
        <span className="text-lg font-bold text-green-400">{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}
