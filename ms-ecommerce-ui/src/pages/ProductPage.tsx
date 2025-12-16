import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Product } from "../api/types";
import { Panel } from "../components/Panel";
import { ProductFields } from "../components/ProductFields";
import { ProductCard } from "../components/ProductCard";
import { Badge } from "../components/Badge";
import { api } from "../api/client";

const categories: Product["category"][] = ["ELECTRONICS", "BOOKS", "FOOD", "OTHER"];

type ProductsPageProps = {
  search: string;
  setSearch: (value: string) => void;
  filteredProducts: Product[];
  onDeleteProduct: (id: number) => void;
};

export function ProductsPage({
  search,
  setSearch,
  filteredProducts,
  onDeleteProduct
}: ProductsPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Catalogue produits</h2>
          <p className="text-sm text-muted mt-1">{filteredProducts.length} produit(s) disponible(s)</p>
        </div>
        <input
          className="card px-4 py-2.5 w-full sm:w-80"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredProducts.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-slate-400">Aucun produit trouvé</p>
          </div>
        )}
        {filteredProducts.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onViewDetails={(id) => navigate(`/products/${id}`)}
            onDelete={onDeleteProduct}
          />
        ))}
      </div>
    </div>
  );
}

// ===== NewProductPage =====
type NewProductPageProps = {
  newProduct: Partial<Product>;
  setNewProduct: (value: Partial<Product>) => void;
  loading: boolean;
  onCreateProduct: () => void;
};

export function NewProductPage({ newProduct, setNewProduct, loading, onCreateProduct }: NewProductPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Panel
        title="Nouveau produit"
        actions={<span className="text-xs text-slate-400">{loading ? "Chargement..." : ""}</span>}
      >
        <ProductFields
          value={newProduct}
          categories={categories}
          onChange={setNewProduct}
          includeActive
        />
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-ghost" onClick={() => navigate("/products")}>
            Annuler
          </button>
          <button className="btn-primary" onClick={onCreateProduct} disabled={loading}>
            Créer
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ===== ProductDetailPage =====
export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      api.products.get(Number(id))
        .then(data => setProduct(data as Product))
        .catch(e => {
          toast.error((e as Error).message);
          navigate("/products");
        });
    }
  }, [id, navigate]);

  if (!product) return <div className="text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <Panel
        title={product.name}
        actions={
          <div className="flex gap-2">
            <button className="btn-ghost subtle" onClick={() => navigate(`/products/${id}/edit`)}>
              Modifier
            </button>
            <button className="btn-ghost subtle" onClick={() => navigate("/products")}>
              Retour
            </button>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row gap-4">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="product-img large" loading="lazy" />
          ) : (
            <div className="product-img large placeholder">{product.name?.charAt(0) ?? "?"}</div>
          )}
          <div className="space-y-2 text-sm">
            <div className="text-base font-semibold">{product.name}</div>
            <div className="text-muted">{product.description}</div>
            <div className="flex gap-2 items-center">
              <Badge color={product.stock < 5 ? "amber" : "green"}>Stock {product.stock}</Badge>
              <Badge>{product.category}</Badge>
              {product.active === false && <Badge color="red">Inactif</Badge>}
            </div>
            <div className="text-base font-bold">{product.price.toFixed(2)} €</div>
            <div className="text-xs text-muted">
              Créé le {product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ===== ProductEditPage =====
type ProductEditPageProps = {
  loading: boolean;
  onSaveProductEdit: (id: number, product: Partial<Product>) => void;
};

export function ProductEditPage({ loading, onSaveProductEdit }: ProductEditPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (id) {
      api.products.get(Number(id))
        .then(data => setEditProduct(data as Product))
        .catch(e => {
          toast.error((e as Error).message);
          navigate("/products");
        });
    }
  }, [id, navigate]);

  if (!editProduct) return <div className="text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <Panel title="Modifier le produit">
        <ProductFields
          value={editProduct}
          categories={categories}
          onChange={setEditProduct}
          includeActive
        />
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-ghost subtle" onClick={() => navigate(`/products/${id}`)}>
            Annuler
          </button>
          <button className="btn-primary" onClick={() => onSaveProductEdit(Number(id), editProduct)} disabled={loading}>
            Sauvegarder
          </button>
        </div>
      </Panel>
    </div>
  );
}
