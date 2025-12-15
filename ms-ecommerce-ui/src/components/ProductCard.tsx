import { memo } from "react";
import { Product } from "../api/types";
import { Badge } from "./Badge";

type Props = {
  product: Product;
  onUpdateStock: (id: number, stock: number) => void;
  onViewDetails: (id: number) => void;
  onDelete: (id: number) => void;
};

export const ProductCard = memo(function ProductCard({ product: p, onUpdateStock, onViewDetails, onDelete }: Props) {
  return (
    <div className="card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex gap-3 items-start">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img placeholder">{p.name?.charAt(0) ?? "?"}</div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold">{p.name}</span>
            <Badge color={p.stock < 5 ? "amber" : "green"}>Stock {p.stock}</Badge>
            <Badge>{p.category}</Badge>
            {p.active === false ? <Badge color="red">Inactif</Badge> : <Badge>Actif</Badge>}
          </div>
          <div className="text-sm text-slate-400">{p.description}</div>
          <div className="text-sm text-slate-200 font-semibold">{p.price.toFixed(2)} €</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="card px-2 py-1 w-24"
          type="number"
          min={0}
          defaultValue={p.stock}
          title="Mise à jour stock"
          onBlur={e => onUpdateStock(p.id, Number(e.target.value))}
        />
        <button className="btn-ghost subtle" onClick={() => onViewDetails(p.id)}>
          Détails
        </button>
        <button className="btn-ghost" onClick={() => onDelete(p.id)}>
          Supprimer
        </button>
      </div>
    </div>
  );
});
