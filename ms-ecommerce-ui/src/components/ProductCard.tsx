import { memo } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Product } from "../api/types";
import { Badge } from "./Badge";

type Props = {
  product: Product;
  onViewDetails: (id: number) => void;
  onDelete: (id: number) => void;
};

export const ProductCard = memo(function ProductCard({ product: p, onViewDetails, onDelete }: Props) {
  return (
    <div className="card p-4 flex flex-col md:flex-row gap-4 hover:shadow-lg transition-all cursor-pointer group" onClick={() => onViewDetails(p.id)}>
      <div className="flex gap-4 flex-1">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img placeholder">{p.name?.charAt(0) ?? "?"}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-slate-50 truncate">{p.name}</h3>
            <span className="text-lg font-bold text-slate-50 whitespace-nowrap">{p.price.toFixed(2)} €</span>
          </div>
          <p className="text-sm text-muted line-clamp-2 mb-3">{p.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={p.stock < 5 ? "amber" : "green"}>
              {p.stock} en stock
            </Badge>
            <Badge>{p.category}</Badge>
            {p.active === false && <Badge color="red">Inactif</Badge>}
          </div>
        </div>
      </div>
      <div className="flex md:flex-col gap-2 md:justify-center">
        <button
          className="btn-ghost subtle flex items-center gap-2 flex-1 md:flex-initial"
          onClick={(e) => { e.stopPropagation(); onViewDetails(p.id); }}
        >
          <Eye size={16} />
          <span>Voir</span>
        </button>
        <button
          className="btn-ghost subtle flex items-center gap-2 flex-1 md:flex-initial text-red-400 hover:bg-red-500/10"
          onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
        >
          <Trash2 size={16} />
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
});
