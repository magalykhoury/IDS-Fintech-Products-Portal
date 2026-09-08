import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Client } from "../types/client";
import type { Product } from "../types/product";
import type { Deployment } from "../types/deployment";

export default function EditDeploymentPage() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDeployment = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [
        deployment,
        clientsData,
        productsData,
      ] = await Promise.all([
        apiFetch(`/deployments/${id}`),
        apiFetch("/clients"),
        apiFetch("/products"),
      ]);

      const deploymentData =
        deployment as Deployment;

      setClients(clientsData);
      setProducts(productsData);

      setClientId(
        deploymentData.clientId.toString()
      );

      setProductId(
        deploymentData.productId.toString()
      );

      setProductVersion(
        deploymentData.productVersion ?? ""
      );

      setGoLiveDate(
        deploymentData.goLiveDate
          ? deploymentData.goLiveDate.substring(0, 10)
          : ""
      );

      setStatus(deploymentData.status);

      setSupportTier(
        deploymentData.supportTier ?? ""
      );

      setClientSpecificNotes(
        deploymentData.clientSpecificNotes ?? ""
      );
    } catch {
      setError("Could not load deployment.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadDeployment);
  }, [loadDeployment]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/deployments/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          clientId: Number(clientId),
          productId: Number(productId),
          productVersion,
          goLiveDate: goLiveDate || null,
          status,
          supportTier: supportTier || null,
          clientSpecificNotes:
            clientSpecificNotes || null,
        }),
      });

      navigate(`/deployments/${id}`);
    } catch {
      setError("Could not update deployment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading deployment...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployments
          </p>

          <h1>Edit Deployment</h1>

          <p className="page-subtitle">
            Update deployment information.
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
                const selectedId =
                  event.target.value;

                setProductId(selectedId);

                const selectedProduct =
                  products.find(
                    (product) =>
                      product.id ===
                      Number(selectedId)
                  );

                if (
                  selectedProduct?.currentVersion
                ) {
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
              value={productVersion}
              onChange={(event) =>
                setProductVersion(
                  event.target.value
                )
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
                setGoLiveDate(
                  event.target.value
                )
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
                setSupportTier(
                  event.target.value
                )
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
            <label>
              Client Specific Notes
            </label>

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
              navigate(`/deployments/${id}`)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
