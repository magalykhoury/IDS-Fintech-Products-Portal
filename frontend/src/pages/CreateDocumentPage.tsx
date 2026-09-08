import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function CreateDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [urlOrFileReference, setUrlOrFileReference] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch("/documents", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(id),
          name,
          documentType,
          description: description || null,
          urlOrFileReference,
          lastUpdatedDate: lastUpdatedDate || null,
        }),
      });

      navigate(`/products/${id}`);
    } catch {
      setError("Could not create document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Documentation
          </p>

          <h1>Add Document</h1>

          <p className="page-subtitle">
            Add documentation or a file reference to this product.
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
            <label>Document Name</label>

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
            <label>Document Type</label>

            <input
              type="text"
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value)
              }
              placeholder="Technical Documentation"
              required
            />
          </div>

          <div className="form-group form-group-full">
            <label>URL or File Reference</label>

            <input
              type="text"
              value={urlOrFileReference}
              onChange={(event) =>
                setUrlOrFileReference(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Last Updated Date</label>

            <input
              type="date"
              value={lastUpdatedDate}
              onChange={(event) =>
                setLastUpdatedDate(event.target.value)
              }
            />
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
              ? "Creating..."
              : "Add Document"}
          </button>
        </div>
      </form>
    </div>
  );
}