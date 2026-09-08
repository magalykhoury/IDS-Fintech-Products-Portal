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

interface DeploymentTeamMember {
  id: number;
  deploymentId: number;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  teamMemberId: number;
  teamMemberName: string;
  responsibility: string;
  description: string | null;
}

export default function EditDeploymentTeamMemberPage() {
  const {
    deploymentId,
    responsibilityId,
  } = useParams();

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

  const loadPage = useCallback(async () => {
    if (
      !deploymentId ||
      !responsibilityId
    ) {
      setError(
        "Deployment ID or responsibility ID is missing."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        teamData,
        teamMembersData,
      ] = await Promise.all([
        apiFetch(
          `/deployments/${deploymentId}/team`
        ),
        apiFetch("/teammembers"),
      ]);

      const existingResponsibility =
        (
          teamData as DeploymentTeamMember[]
        ).find(
          (item) =>
            item.id ===
            Number(responsibilityId)
        );

      if (!existingResponsibility) {
        setError(
          "Deployment responsibility not found."
        );

        return;
      }

      setTeamMembers(
        teamMembersData
      );

      setTeamMemberId(
        String(
          existingResponsibility.teamMemberId
        )
      );

      setResponsibility(
        existingResponsibility.responsibility
      );

      setDescription(
        existingResponsibility.description ?? ""
      );
    } catch {
      setError(
        "Could not load deployment responsibility."
      );
    } finally {
      setLoading(false);
    }
  }, [deploymentId, responsibilityId]);

  useEffect(() => {
    void Promise.resolve().then(loadPage);
  }, [loadPage]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !deploymentId ||
      !responsibilityId
    ) {
      setError(
        "Deployment ID or responsibility ID is missing."
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
        `/deployments/${deploymentId}/team/${responsibilityId}`,
        {
          method: "PUT",

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
        "Could not update deployment responsibility."
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
            Deployment Team
          </p>

          <h1>
            Edit Responsibility
          </h1>

          <p className="page-subtitle">
            Update the assigned team member,
            responsibility, or description.
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
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
