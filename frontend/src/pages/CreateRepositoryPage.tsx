import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function CreateRepositoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [mainBranch, setMainBranch] = useState("main");
  const [description, setDescription] = useState("");

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

      await apiFetch("/repositories", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(id),
          name,
          repositoryUrl,
          mainBranch: mainBranch || null,
          description: description || null,
        }),
      });

      navigate(`/products/${id}`);
    } catch {
      setError("Could not create repository.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Repository
          </p>

          <h1>Add Repository</h1>

          <p className="page-subtitle">
            Add a source-code repository to this product.
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
            <label>Repository Name</label>

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
            <label>Main Branch</label>

            <input
              type="text"
              value={mainBranch}
              onChange={(event) =>
                setMainBranch(event.target.value)
              }
            />
          </div>

          <div className="form-group form-group-full">
            <label>Repository URL</label>

            <input
              type="url"
              value={repositoryUrl}
              onChange={(event) =>
                setRepositoryUrl(event.target.value)
              }
              required
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
              : "Add Repository"}
          </button>
        </div>
      </form>
    </div>
  );
}