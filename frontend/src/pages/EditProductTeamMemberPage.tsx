import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";

interface ProductTeamMember {
  id: number;
  teamMemberId: number;
  teamMemberName: string;
  responsibility: string;
  description: string | null;
}

export default function EditProductTeamMemberPage() {
  const {
    productId,
    responsibilityId,
  } = useParams();

  const navigate = useNavigate();

  const [member, setMember] =
    useState<ProductTeamMember | null>(null);

  const [responsibility, setResponsibility] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadResponsibility = useCallback(async () => {
    if (!productId || !responsibilityId) {
      setError("Responsibility information is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const teamData: ProductTeamMember[] =
        await apiFetch(
          `/products/${productId}/team`
        );

      const foundMember =
        teamData.find(
          (item) =>
            item.id ===
            Number(responsibilityId)
        );

      if (!foundMember) {
        setError(
          "Product team responsibility was not found."
        );

        return;
      }

      setMember(foundMember);

      setResponsibility(
        foundMember.responsibility
      );

      setDescription(
        foundMember.description ?? ""
      );
    } catch {
      setError(
        "Could not load product team responsibility."
      );
    } finally {
      setLoading(false);
    }
  }, [productId, responsibilityId]);

  useEffect(() => {
    void Promise.resolve().then(loadResponsibility);
  }, [loadResponsibility]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !productId ||
      !responsibilityId ||
      !member
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/products/${productId}/team/${responsibilityId}`,
        {
          method: "PUT",

          body: JSON.stringify({
            productId: Number(productId),
            teamMemberId:
              member.teamMemberId,
            responsibility,
            description:
              description.trim() || null,
          }),
        }
      );

      navigate(
        `/products/${productId}`
      );
    } catch {
      setError(
        "Could not update product team responsibility."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p>
        Loading responsibility...
      </p>
    );
  }

  return (
    <div className="product-details-page">

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Product Team
          </p>

          <h1>
            Edit Responsibility
          </h1>

          <p className="page-subtitle">
            Update this team member's responsibility
            for the product.
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

        {member && (
          <div className="form-grid">

            <div className="form-group">
              <label>
                Team Member
              </label>

              <input
                type="text"
                value={member.teamMemberName}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsibility">
                Responsibility
              </label>

              <input
                id="responsibility"
                type="text"
                value={responsibility}
                onChange={(event) =>
                  setResponsibility(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />
            </div>

          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/products/${productId}`
              )
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={
              saving ||
              !member
            }
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
