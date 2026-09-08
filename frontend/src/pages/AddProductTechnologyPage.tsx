import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

interface Technology {
  id: number;
  name: string;
  description: string | null;
}

interface ProductTechnology {
  technologyId: number;
  technologyName: string;
  technologyDescription: string | null;
}

export default function AddProductTechnologyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [assignedTechnologies, setAssignedTechnologies] =
    useState<ProductTechnology[]>([]);

  const [technologyId, setTechnologyId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTechnologies = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [
        technologiesData,
        assignedData,
      ] = await Promise.all([
        apiFetch("/technologies"),
        apiFetch(`/products/${id}/technologies`),
      ]);

      setTechnologies(technologiesData);
      setAssignedTechnologies(assignedData);
    } catch {
      setError("Could not load technologies.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadTechnologies);
  }, [loadTechnologies]);

  const assignedIds = new Set(
    assignedTechnologies.map(
      (technology) => technology.technologyId
    )
  );

  const availableTechnologies =
    technologies.filter(
      (technology) =>
        !assignedIds.has(technology.id)
    );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id || !technologyId) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/products/${id}/technologies/${technologyId}`,
        {
          method: "POST",
        }
      );

      navigate(`/products/${id}`);
    } catch {
      setError("Could not add technology to product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading technologies...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Product Technology
          </p>

          <h1>Add Technology</h1>

          <p className="page-subtitle">
            Assign an existing technology to this product.
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
            <label>Technology</label>

            <select
              value={technologyId}
              onChange={(event) =>
                setTechnologyId(event.target.value)
              }
              required
            >
              <option value="">
                Select technology
              </option>

              {availableTechnologies.map(
                (technology) => (
                  <option
                    key={technology.id}
                    value={technology.id}
                  >
                    {technology.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {availableTechnologies.length === 0 && (
          <p className="empty-text">
            All available technologies are already assigned to this product.
          </p>
        )}

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
            disabled={
              saving ||
              availableTechnologies.length === 0
            }
          >
            {saving
              ? "Adding..."
              : "Add Technology"}
          </button>
        </div>
      </form>
    </div>
  );
}
