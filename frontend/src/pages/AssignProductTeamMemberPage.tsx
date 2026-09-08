import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";
import type { TeamMember } from "../types/teamMember";

export default function AssignProductTeamMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>([]);

  const [teamMemberId, setTeamMemberId] =
    useState("");

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

  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiFetch("/teammembers");

      setTeamMembers(data);
    } catch {
      setError(
        "Could not load team members."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTeamMembers);
  }, [loadTeamMembers]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id || !teamMemberId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/products/${id}/team`,
        {
          method: "POST",

          body: JSON.stringify({
            productId: Number(id),
            teamMemberId:
              Number(teamMemberId),
            responsibility,
            description:
              description.trim() || null,
          }),
        }
      );

      navigate(`/products/${id}`);
    } catch {
      setError(
        "Could not assign team member to product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p>
        Loading team members...
      </p>
    );
  }

  return (
    <div className="product-details-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Product Team
          </p>

          <h1>
            Assign Team Member
          </h1>

          <p className="page-subtitle">
            Assign a team member and responsibility
            to this product.
          </p>
        </div>
      </div>


      {/* FORM */}

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

          {/* TEAM MEMBER */}

          <div className="form-group">
            <label htmlFor="team-member">
              Team Member
            </label>

            <select
              id="team-member"
              value={teamMemberId}
              onChange={(event) =>
                setTeamMemberId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select team member
              </option>

              {teamMembers.map(
                (member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.fullName}
                  </option>
                )
              )}
            </select>
          </div>


          {/* RESPONSIBILITY */}

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
              placeholder="Lead Developer"
              required
            />
          </div>


          {/* DESCRIPTION */}

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
              placeholder="Describe the team member's responsibilities..."
            />
          </div>

        </div>


        {/* ACTIONS */}

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/products/${id}`
              )
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Assigning..."
              : "Assign Team Member"}
          </button>
        </div>
      </form>
    </div>
  );
}
