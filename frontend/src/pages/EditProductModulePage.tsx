import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

interface ProductModule {
  id: number;
  productId: number;
  name: string;
  description: string | null;
  status: string;
}

export default function EditProductModulePage() {
  const { productId, moduleId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadModule = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError("");

      const module: ProductModule =
        await apiFetch(`/productmodules/${moduleId}`);

      setName(module.name);
      setDescription(module.description ?? "");
      setStatus(module.status);
    } catch {
      setError("Could not load product module.");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void Promise.resolve().then(loadModule);
  }, [loadModule]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!moduleId || !productId) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/productmodules/${moduleId}`, {
        method: "PUT",
        body: JSON.stringify({
          productId: Number(productId),
          name,
          description: description || null,
          status,
        }),
      });

      navigate(`/products/${productId}`);
    } catch {
      setError("Could not update product module.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading module...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Product Module
          </p>

          <h1>Edit Module</h1>

          <p className="page-subtitle">
            Update module information.
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
            <label>Module Name</label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
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
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label>Description</label>

            <textarea
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(`/products/${productId}`)
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
