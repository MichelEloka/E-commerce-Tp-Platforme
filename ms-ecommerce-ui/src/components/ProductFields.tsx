import { Product } from "../api/types";
import { useState, memo } from "react";

type Props = {
  value: Partial<Product>;
  categories: Product["category"][];
  onChange: (next: Partial<Product>) => void;
  includeActive?: boolean;
};

type ValidationErrors = {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
};

export const ProductFields = memo(function ProductFields({ value, categories, onChange, includeActive = false }: Props) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: keyof ValidationErrors, val: any): string | undefined => {
    switch (field) {
      case "name":
        if (!val || val.trim().length < 3) return "Le nom doit contenir au moins 3 caractères";
        if (val.trim().length > 100) return "Le nom ne peut pas dépasser 100 caractères";
        break;
      case "description":
        if (!val || val.trim().length < 10) return "La description doit contenir au moins 10 caractères";
        if (val.trim().length > 500) return "La description ne peut pas dépasser 500 caractères";
        break;
      case "price":
        const price = Number(val);
        if (isNaN(price) || price <= 0) return "Le prix doit être supérieur à 0";
        if (price > 999999) return "Le prix est trop élevé";
        break;
      case "stock":
        const stock = Number(val);
        if (isNaN(stock) || stock < 0) return "Le stock ne peut pas être négatif";
        if (!Number.isInteger(stock)) return "Le stock doit être un nombre entier";
        break;
    }
    return undefined;
  };

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validate(field, value[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof Partial<Product>, val: any) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      const error = validate(field as keyof ValidationErrors, val);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <label className="field">
        <span>Nom <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.name && touched.name ? 'border-red-400 border' : ''}`}
          placeholder="Ex: Wireless Keyboard"
          value={value.name ?? ""}
          onChange={e => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          required
          minLength={3}
          maxLength={100}
        />
        {errors.name && touched.name && (
          <span className="text-xs text-red-400 mt-1">{errors.name}</span>
        )}
      </label>
      <label className="field">
        <span>Prix <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.price && touched.price ? 'border-red-400 border' : ''}`}
          placeholder="79.99"
          type="number"
          min="0.01"
          max="999999"
          step="0.01"
          value={value.price ?? ""}
          onChange={e => handleChange("price", e.target.value ? Number(e.target.value) : "")}
          onBlur={() => handleBlur("price")}
          required
        />
        {errors.price && touched.price && (
          <span className="text-xs text-red-400 mt-1">{errors.price}</span>
        )}
      </label>
      <label className="field">
        <span>Stock <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.stock && touched.stock ? 'border-red-400 border' : ''}`}
          placeholder="50"
          type="number"
          min="0"
          step="1"
          value={value.stock ?? ""}
          onChange={e => handleChange("stock", e.target.value ? Number(e.target.value) : "")}
          onBlur={() => handleBlur("stock")}
          required
        />
        {errors.stock && touched.stock && (
          <span className="text-xs text-red-400 mt-1">{errors.stock}</span>
        )}
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
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value.imageUrl ?? ""}
          onChange={e => handleChange("imageUrl", e.target.value)}
        />
      </label>
      <label className="field md:col-span-2">
        <span>Description <span className="text-red-400">*</span></span>
        <textarea
          className={`card px-3 py-2 ${errors.description && touched.description ? 'border-red-400 border' : ''}`}
          placeholder="Description détaillée du produit (minimum 10 caractères)"
          rows={3}
          value={value.description ?? ""}
          onChange={e => handleChange("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          required
          minLength={10}
          maxLength={500}
        />
        {errors.description && touched.description && (
          <span className="text-xs text-red-400 mt-1">{errors.description}</span>
        )}
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
});
