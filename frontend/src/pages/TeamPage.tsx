import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { canWritePortalData } from "../services/permissions";
import type { TeamMember } from "../types/teamMember";

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/teammembers");

      setTeamMembers(data);
    } catch {
      setError("Could not load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTeamMembers);
  }, [loadTeamMembers]);

  async function handleDelete(member: TeamMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${member.fullName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/teammembers/${member.id}`, {
        method: "DELETE",
      });

      await loadTeamMembers();
    } catch {
      setError(
        "Could not delete team member. They may still be assigned to product or deployment responsibilities."
      );
    }
  }

  const departmentOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          teamMembers
            .map((member) => member.department)
            .filter((value): value is string => Boolean(value))
        )
      ),
    ];
  }, [teamMembers]);

  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        member.fullName
          .toLowerCase()
          .includes(searchValue) ||
        member.jobTitle
          ?.toLowerCase()
          .includes(searchValue) ||
        member.department
          ?.toLowerCase()
          .includes(searchValue) ||
        member.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesDepartment =
        departmentFilter === "All" ||
        member.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    teamMembers,
    search,
    departmentFilter,
    statusFilter,
  ]);

  if (loading) {
    return <p>Loading team members...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Organization
          </p>

          <h1>Team</h1>

          <p className="page-subtitle">
            Search IDS Fintech team members, departments, and responsibilities.
          </p>
        </div>

        {canWritePortalData() && (
          <Link to="/team/new" className="primary-button">
            Create Team Member
          </Link>
        )}
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={departmentFilter}
          onChange={(event) =>
            setDepartmentFilter(event.target.value)
          }
        >
          {departmentOptions.map((department) => (
            <option
              key={department}
              value={department}
            >
              {department === "All"
                ? "All departments"
                : department}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>
      </div>

      {filteredTeamMembers.length === 0 ? (
        <div className="detail-card">
          <p className="empty-text">
            No team members match your search or filters.
          </p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
              {canWritePortalData() && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredTeamMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <strong>
                    {member.fullName}
                  </strong>
                </td>

                <td>
                  {member.jobTitle ?? "-"}
                </td>

                <td>
                  {member.department ?? "-"}
                </td>

                <td>
                  {member.email ?? "-"}
                </td>

                <td>
                  <span className="small-badge">
                    {member.status}
                  </span>
                </td>

                {canWritePortalData() && (
                  <td>
                    <div className="table-actions">
                      <Link to={`/team/${member.id}/edit`} className="secondary-button">
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="danger-button-small"
                        onClick={() => handleDelete(member)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
