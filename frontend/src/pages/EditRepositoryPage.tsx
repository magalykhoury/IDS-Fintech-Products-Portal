import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

interface Repository {
  id: number;
  productId: number;
  name: string;
  repositoryUrl: string;
  mainBranch: string | null;
  description: string | null;
}

export default function EditRepositoryPage() {
  const { productId, repositoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [mainBranch, setMainBranch] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRepository = useCallback(async () => {
    if (!repositoryId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const repository: Repository =
        await apiFetch(`/repositories/${repositoryId}`);

      setName(repository.name);
      setRepositoryUrl(repository.repositoryUrl);
      setMainBranch(repository.mainBranch ?? "");
      setDescription(repository.description ?? "");
    } catch {
      setError("Could not load repository.");
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    void Promise.resolve().then(loadRepository);
  }, [loadRepository]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!repositoryId || !productId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/repositories/${repositoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          productId: Number(productId),
          name,
          repositoryUrl,
          mainBranch: mainBranch || null,
          description: description || null,
        }),
      });

      navigate(`/products/${productId}`);
    } catch {
      setError("Could not update repository.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading repository...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Repository
          </p>

          <h1>Edit Repository</h1>

          <p className="page-subtitle">
            Update repository information.
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
