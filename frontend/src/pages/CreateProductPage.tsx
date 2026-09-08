import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function CreateProductPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState("Active");
  const [currentVersion, setCurrentVersion] = useState("");
  const [supportedMarkets, setSupportedMarkets] = useState("");
  const [criticality, setCriticality] = useState("Medium");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const product = await apiFetch("/products", {
        method: "POST",
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

      navigate(`/products/${product.id}`);
    } catch {
      setError("Could not create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Products
          </p>

          <h1>Create Product</h1>

          <p className="page-subtitle">
            Add a new IDS Fintech product to the portal.
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
              type="text"
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
              type="text"
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
          </div>

          <div className="form-group">
            <label>Criticality</label>

            <select
              value={criticality}
              onChange={(event) =>
                setCriticality(event.target.value)
              }
            >
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
          </div>

          <div className="form-group">
            <label>Supported Markets</label>

            <input
              type="text"
              value={supportedMarkets}
              onChange={(event) =>
                setSupportedMarkets(event.target.value)
              }
            />
          </div>

          <div className="form-group form-group-full">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={3}
            />
          </div>

          <div className="form-group form-group-full">
            <label>Business Purpose</label>

            <textarea
              value={businessPurpose}
              onChange={(event) =>
                setBusinessPurpose(event.target.value)
              }
              rows={3}
            />
          </div>

          <div className="form-group form-group-full">
            <label>Notes</label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}