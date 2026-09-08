import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";

interface TeamMember {
  id: number;
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  email: string | null;
  status: string;
}

export default function AssignDeploymentTeamMemberPage() {
  const { deploymentId } = useParams();
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
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!deploymentId) {
      setError(
        "Deployment ID is missing."
      );

      return;
    }

    if (!teamMemberId) {
      setError(
        "Please select a team member."
      );

      return;
    }

    if (!responsibility.trim()) {
      setError(
        "Please enter a responsibility."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/deployments/${deploymentId}/team`,
        {
          method: "POST",

          body: JSON.stringify({
            deploymentId:
              Number(deploymentId),

            teamMemberId:
              Number(teamMemberId),

            responsibility:
              responsibility.trim(),

            description:
              description.trim() || null,
          }),
        }
      );

      navigate(
        `/deployments/${deploymentId}`
      );
    } catch {
      setError(
        "Could not assign team member to deployment."
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

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployment Team
          </p>

          <h1>
            Assign Team Member
          </h1>

          <p className="page-subtitle">
            Assign a team member and responsibility
            to this deployment.
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
                    {member.jobTitle
                      ? ` — ${member.jobTitle}`
                      : ""}
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
              placeholder="Example: Technical Support"
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
              placeholder="Optional notes about this responsibility"
            />
          </div>

        </div>


        {/* ACTIONS */}

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/deployments/${deploymentId}`
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
