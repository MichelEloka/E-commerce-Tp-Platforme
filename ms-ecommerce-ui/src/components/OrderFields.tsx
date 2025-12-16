import { AlertTriangle, Zap } from "lucide-react";
import type { User, Product, OrderItem } from "../api/types";

type OrderFormData = {
  userId: number | "";
  shippingAddress: string;
  items: Array<{ productId: number | ""; quantity: number }>;
};

type Props = {
  value: OrderFormData;
  onChange: (value: OrderFormData) => void;
  users: User[];
  products: Product[];
};

export function OrderFields({ value, onChange, users, products }: Props) {
  const addItem = () => {
    onChange({
      ...value,
      items: [...value.items, { productId: "", quantity: 1 }]
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...value,
      items: value.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: "productId" | "quantity", newValue: number | "") => {
    const newItems = [...value.items];
    newItems[index] = { ...newItems[index], [field]: newValue };
    onChange({ ...value, items: newItems });
  };

  const calculateTotal = () => {
    return value.items.reduce((total, item) => {
      if (item.productId === "") return total;
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;




















    }, 0);
  };

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="field">
          <span>Utilisateur *</span>
          <select
            className="card px-3 py-2"
            value={value.userId}
            onChange={e => onChange({ ...value, userId: e.target.value ? Number(e.target.value) : "" })}
          >
            <option value="">Sélectionner un utilisateur</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                #{u.id} - {u.firstName} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Adresse de livraison *</span>
          <input
            className="card px-3 py-2"
            placeholder="123 Rue de la Paix, Paris 75001"
            value={value.shippingAddress}
            onChange={e => onChange({ ...value, shippingAddress: e.target.value })}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Articles</span>
          <button className="btn-ghost subtle text-xs" onClick={addItem}>
            + Ajouter un article
          </button>
        </div>

        {value.items.length === 0 && (
          <div className="text-xs text-slate-400 italic">Aucun article. Cliquez sur "Ajouter un article".</div>
        )}

        {value.items.map((item, index) => {
          const selectedProduct = item.productId ? products.find(p => p.id === item.productId) : null;
          const stockError = selectedProduct && item.quantity > selectedProduct.stock;
          const lowStock = selectedProduct && selectedProduct.stock < 10;

          return (
            <div key={index} className="space-y-1">
              <div className="card p-2 flex gap-2 items-center">
                <label className="field flex-1 mb-0">
                  <span className="text-xs">Produit</span>
                  <select
                    className="card px-3 py-2 text-sm"
                    value={item.productId}
                    onChange={e => updateItem(index, "productId", e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">Sélectionner</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.name} - {p.price.toFixed(2)}€ ({p.stock === 0 ? 'Rupture' : `stock: ${p.stock}`})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field w-24 mb-0">
                  <span className="text-xs">Qté</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.stock || 999}
                    className="card px-3 py-2 text-sm"
                    value={item.quantity}
                    onChange={e => {
                      const qty = Number(e.target.value) || 1;
                      const maxQty = selectedProduct?.stock || 999;
                      updateItem(index, "quantity", Math.min(qty, maxQty));
                    }}
                  />
                </label>

                <button
                  className="btn-ghost subtle text-xs mt-5"
                  onClick={() => removeItem(index)}
                >
                  ✕
                </button>
              </div>
              {stockError && (
                <div className="text-xs text-red-400 px-2 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  <span>Stock insuffisant ({selectedProduct.stock} disponible)</span>
                </div>
              )}
              {!stockError && lowStock && selectedProduct && (
                <div className="text-xs text-amber-400 px-2 flex items-center gap-1">
                  <Zap size={14} />
                  <span>Stock faible ({selectedProduct.stock} restant)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {value.items.length > 0 && (
        <div className="card p-3 bg-slate-800/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total estimé</span>
            <span className="text-lg font-bold text-green-400">{calculateTotal().toFixed(2)} €</span>
          </div>
        </div>
      )}
    </div>
  );
}
