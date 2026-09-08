import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Client } from "../types/client";
import type { Product } from "../types/product";

export default function CreateDeploymentPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [productVersion, setProductVersion] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [status, setStatus] = useState("Production");
  const [supportTier, setSupportTier] = useState("");
  const [clientSpecificNotes, setClientSpecificNotes] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError("");

      const [clientsData, productsData] = await Promise.all([
        apiFetch("/clients"),
        apiFetch("/products"),
      ]);

      setClients(clientsData);
      setProducts(productsData);
    } catch {
      setError("Could not load clients or products.");
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadOptions);
  }, [loadOptions]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const deployment = await apiFetch("/deployments", {
        method: "POST",
        body: JSON.stringify({
          clientId: Number(clientId),
          productId: Number(productId),
          productVersion,
          goLiveDate: goLiveDate || null,
          status,
          supportTier: supportTier || null,
          clientSpecificNotes: clientSpecificNotes || null,
        }),
      });

      navigate(`/deployments/${deployment.id}`);
    } catch {
      setError("Could not create deployment.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return <p>Loading deployment form...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployments
          </p>

          <h1>Create Deployment</h1>

          <p className="page-subtitle">
            Deploy a product to a client organization.
          </p>
        </div>
      </div>

      <form
        className="detail-card form-card"
        onSubmit={handleSubmit}
      >
        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Client</label>

            <select
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
              }
              required
            >
              <option value="">
                Select client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product</label>

            <select
              value={productId}
              onChange={(event) => {
                const selectedId = event.target.value;

                setProductId(selectedId);

                const selectedProduct = products.find(
                  (product) =>
                    product.id === Number(selectedId)
                );

                if (selectedProduct?.currentVersion) {
                  setProductVersion(
                    selectedProduct.currentVersion
                  );
                }
              }}
              required
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Version</label>

            <input
              type="text"
              value={productVersion}
              onChange={(event) =>
                setProductVersion(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Go Live Date</label>

            <input
              type="date"
              value={goLiveDate}
              onChange={(event) =>
                setGoLiveDate(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="Planned">
                Planned
              </option>

              <option value="UAT">
                UAT
              </option>

              <option value="Production">
                Production
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Support Tier</label>

            <select
              value={supportTier}
              onChange={(event) =>
                setSupportTier(event.target.value)
              }
            >
              <option value="">
                No support tier
              </option>

              <option value="Standard">
                Standard
              </option>

              <option value="Premium">
                Premium
              </option>

              <option value="Critical">
                Critical
              </option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label>Client Specific Notes</label>

            <textarea
              rows={4}
              value={clientSpecificNotes}
              onChange={(event) =>
                setClientSpecificNotes(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/deployments")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Deployment"}
          </button>
        </div>
      </form>
    </div>
  );
}
