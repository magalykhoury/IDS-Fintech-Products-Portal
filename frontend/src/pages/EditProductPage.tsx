import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Product } from "../types/product";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState("Active");
  const [currentVersion, setCurrentVersion] = useState("");
  const [supportedMarkets, setSupportedMarkets] = useState("");
  const [criticality, setCriticality] = useState("Medium");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const product: Product =
        await apiFetch(`/products/${id}`);

      setName(product.name);
      setDescription(product.description ?? "");
      setBusinessPurpose(product.businessPurpose ?? "");
      setLifecycleStatus(product.lifecycleStatus);
      setCurrentVersion(product.currentVersion ?? "");
      setSupportedMarkets(product.supportedMarkets ?? "");
      setCriticality(product.criticality ?? "Medium");
      setNotes(product.notes ?? "");
    } catch {
      setError("Could not load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadProduct);
  }, [loadProduct]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          description: description || null,
          businessPurpose: businessPurpose || null,
          lifecycleStatus,
          currentVersion: currentVersion || null,
          supportedMarkets: supportedMarkets || null,
          criticality,
          notes: notes || null,
        }),
      });

      navigate(`/products/${id}`);
    } catch {
      setError("Could not update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Products
          </p>

          <h1>Edit Product</h1>

          <p className="page-subtitle">
            Update product information.
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
            <label>Product Name</label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Current Version</label>

            <input
              value={currentVersion}
              onChange={(event) =>
                setCurrentVersion(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Lifecycle Status</label>

            <select
              value={lifecycleStatus}
              onChange={(event) =>
                setLifecycleStatus(event.target.value)
              }
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Planned">Planned</option>
              <option value="Deprecated">Deprecated</option>
            </select>
          </div>

          <div className="form-group">
            <label>Criticality</label>

            <select
              value={criticality}
              onChange={(event) =>
                setCriticality(event.target.value)
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Supported Markets</label>

            <input
              value={supportedMarkets}
              onChange={(event) =>
                setSupportedMarkets(event.target.value)
              }
            />
          </div>

          <div className="form-group form-group-full">
            <label>Description</label>

            <textarea
              rows={3}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <div className="form-group form-group-full">
            <label>Business Purpose</label>

            <textarea
              rows={3}
              value={businessPurpose}
              onChange={(event) =>
                setBusinessPurpose(event.target.value)
              }
            />
          </div>

          <div className="form-group form-group-full">
            <label>Notes</label>

            <textarea
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(`/products/${id}`)
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
