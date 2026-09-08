import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { canManageProducts } from "../services/permissions";
import type { Product } from "../types/product";

interface Technology {
  id: number;
  name: string;
}

interface ProductTechnology {
  technologyId: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [productTechnologyIds, setProductTechnologyIds] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [criticalityFilter, setCriticalityFilter] = useState("All");
  const [technologyFilter, setTechnologyFilter] = useState("All");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data: Product[] = await apiFetch("/products");
      const technologyData: Technology[] = await apiFetch("/technologies");
      const productTechnologyData = await Promise.all(
        data.map(async (product) => {
          const assigned: ProductTechnology[] = await apiFetch(
            `/products/${product.id}/technologies`
          );
          return [product.id, assigned.map((technology) => technology.technologyId)] as const;
        })
      );

      setProducts(data);
      setTechnologies(technologyData);
      setProductTechnologyIds(Object.fromEntries(productTechnologyData));
    } catch {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadProducts);
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.currentVersion
          ?.toLowerCase()
          .includes(searchValue) ||
        product.supportedMarkets
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        product.lifecycleStatus === statusFilter;

      const matchesCriticality =
        criticalityFilter === "All" ||
        product.criticality === criticalityFilter;

      const matchesTechnology =
        technologyFilter === "All" ||
        productTechnologyIds[product.id]?.includes(Number(technologyFilter));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCriticality &&
        matchesTechnology
      );
    });
  }, [
    products,
    search,
    statusFilter,
    criticalityFilter,
    technologyFilter,
    productTechnologyIds,
  ]);

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Products
          </p>

          <h1>Products</h1>

          <p className="page-subtitle">
            Browse IDS Fintech products, versions, status, and technologies.
          </p>
        </div>

        {canManageProducts() && (
          <Link to="/products/new" className="primary-button">
            Create Product
          </Link>
        )}
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Maintenance">
            Maintenance
          </option>

          <option value="Planned">
            Planned
          </option>

          <option value="Deprecated">
            Deprecated
          </option>
        </select>

        <select
          value={criticalityFilter}
          onChange={(event) =>
            setCriticalityFilter(event.target.value)
          }
        >
          <option value="All">
            All criticalities
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

          <option value="Critical">
            Critical
          </option>
        </select>

        <select
          value={technologyFilter}
          onChange={(event) => setTechnologyFilter(event.target.value)}
        >
          <option value="All">All technologies</option>
          {technologies.map((technology) => (
            <option key={technology.id} value={technology.id}>
              {technology.name}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="detail-card">
          <p className="empty-text">
            No products match your search or filters.
          </p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Status</th>
              <th>Criticality</th>
              <th>Markets</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link
                    to={`/products/${product.id}`}
                    className="table-link"
                  >
                    {product.name}
                  </Link>
                </td>

                <td>
                  {product.currentVersion ?? "-"}
                </td>

                <td>
                  <span className="small-badge">
                    {product.lifecycleStatus}
                  </span>
                </td>

                <td>
                  {product.criticality ?? "-"}
                </td>

                <td>
                  {product.supportedMarkets ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
