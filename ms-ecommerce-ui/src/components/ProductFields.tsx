import { Product } from "../api/types";

type Props = {
  value: Partial<Product>;
  categories: Product["category"][];
  onChange: (next: Partial<Product>) => void;
  includeActive?: boolean;
};

export function ProductFields({ value, categories, onChange, includeActive = false }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <label className="field">
        <span>Nom</span>
        <input
          className="card px-3 py-2"
          placeholder="Ex: Wireless Keyboard"
          value={value.name ?? ""}
          onChange={e => onChange({ ...value, name: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Prix</span>
        <input
          className="card px-3 py-2"
          placeholder="79.99"
          type="number"
          min={0}
          step="0.01"
          value={value.price ?? 0}
          onChange={e => onChange({ ...value, price: Number(e.target.value) })}
        />
      </label>
      <label className="field">
        <span>Stock</span>
        <input
          className="card px-3 py-2"
          placeholder="50"
          type="number"
          min={0}
          value={value.stock ?? 0}
          onChange={e => onChange({ ...value, stock: Number(e.target.value) })}
        />
      </label>
      <label className="field">
        <span>Catégorie</span>
        <select
          className="card px-3 py-2"
          value={value.category}
          onChange={e => onChange({ ...value, category: e.target.value as Product["category"] })}
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="field md:col-span-2">
        <span>Image (URL)</span>
        <input
          className="card px-3 py-2"
          placeholder="https://example.com/image.jpg"
          value={value.imageUrl ?? ""}
          onChange={e => onChange({ ...value, imageUrl: e.target.value })}
        />
      </label>
      <label className="field md:col-span-2">
        <span>Description</span>
        <input
          className="card px-3 py-2"
          placeholder="Description du produit"
          value={value.description ?? ""}
          onChange={e => onChange({ ...value, description: e.target.value })}
        />
      </label>
      {includeActive && (
        <label className="field md:col-span-2 flex-row items-center gap-2">
          <input
            id="product-active-toggle"
            type="checkbox"
            checked={value.active ?? true}
            onChange={e => onChange({ ...value, active: e.target.checked })}
          />
          <span>Actif</span>
        </label>
      )}
    </div>
  );
}
