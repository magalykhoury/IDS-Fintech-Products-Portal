import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { TeamMember } from "../types/teamMember";

export default function EditTeamMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTeamMember = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const member: TeamMember =
        await apiFetch(`/teammembers/${id}`);

      setFullName(member.fullName);
      setJobTitle(member.jobTitle ?? "");
      setDepartment(member.department ?? "");
      setEmail(member.email ?? "");
      setStatus(member.status);
    } catch {
      setError("Could not load team member.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadTeamMember);
  }, [loadTeamMember]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/teammembers/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          jobTitle: jobTitle || null,
          department: department || null,
          email: email || null,
          status,
        }),
      });

      navigate("/team");
    } catch {
      setError("Could not update team member.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading team member...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Team
          </p>

          <h1>Edit Team Member</h1>

          <p className="page-subtitle">
            Update team member information.
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
            <label>Full Name</label>

            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Job Title</label>

            <input
              type="text"
              value={jobTitle}
              onChange={(event) =>
                setJobTitle(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Department</label>

            <input
              type="text"
              value={department}
              onChange={(event) =>
                setDepartment(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
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
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/team")
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
