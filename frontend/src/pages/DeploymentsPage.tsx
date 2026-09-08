import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { canManageDeployments } from "../services/permissions";
import type { Deployment } from "../types/deployment";

interface DeploymentEnvironment {
  deploymentId: number;
  name: string;
  type: string;
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [supportFilter, setSupportFilter] = useState("All");
  const [environmentFilter, setEnvironmentFilter] = useState("All");

  const loadDeployments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [data, environmentData] = await Promise.all([
        apiFetch("/deployments"),
        apiFetch("/environments"),
      ]);

      setDeployments(data);
      setEnvironments(environmentData);
    } catch {
      setError("Could not load deployments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadDeployments);
  }, [loadDeployments]);

  const statusOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          deployments
            .map((deployment) => deployment.status)
            .filter(Boolean)
        )
      ),
    ];
  }, [deployments]);

  const supportOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          deployments
            .map((deployment) => deployment.supportTier)
            .filter((value): value is string => Boolean(value))
        )
      ),
    ];
  }, [deployments]);

  const filteredDeployments = useMemo(() => {
    return deployments.filter((deployment) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        deployment.clientName
          .toLowerCase()
          .includes(searchValue) ||
        deployment.productName
          .toLowerCase()
          .includes(searchValue) ||
        deployment.productVersion
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        deployment.status === statusFilter;

      const matchesSupport =
        supportFilter === "All" ||
        deployment.supportTier === supportFilter;

      const matchesEnvironment =
        environmentFilter === "All" ||
        environments.some(
          (environment) =>
            environment.deploymentId === deployment.id &&
            environment.name === environmentFilter
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSupport &&
        matchesEnvironment
      );
    });
  }, [
    deployments,
    search,
    statusFilter,
    supportFilter,
    environmentFilter,
    environments,
  ]);

  const environmentOptions = useMemo(() => {
    const options = new Map<string, string>();
    environments.forEach((environment) => {
      options.set(environment.name, `${environment.name} (${environment.type})`);
    });
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [environments]);

  if (loading) {
    return <p>Loading deployments...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployments
          </p>

          <h1>Deployments</h1>

          <p className="page-subtitle">
            Search client product deployments, versions, status, and support information.
          </p>
        </div>

        {canManageDeployments() && (
          <Link to="/deployments/new" className="primary-button">
            Create Deployment
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
          placeholder="Search client, product or version..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          {statusOptions.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status === "All"
                ? "All statuses"
                : status}
            </option>
          ))}
        </select>

        <select
          value={supportFilter}
          onChange={(event) =>
            setSupportFilter(event.target.value)
          }
        >
          {supportOptions.map((tier) => (
            <option
              key={tier}
              value={tier}
            >
              {tier === "All"
                ? "All support tiers"
                : tier}
            </option>
          ))}
        </select>

        <select
          value={environmentFilter}
          onChange={(event) => setEnvironmentFilter(event.target.value)}
        >
          <option value="All">All environments</option>
          {environmentOptions.map((environment) => (
            <option key={environment.value} value={environment.value}>
              {environment.label}
            </option>
          ))}
        </select>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="detail-card">
          <p className="empty-text">
            No deployments match your search or filters.
          </p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Product</th>
              <th>Version</th>
              <th>Status</th>
              <th>Support Tier</th>
              <th>Go Live</th>
            </tr>
          </thead>

          <tbody>
            {filteredDeployments.map((deployment) => (
              <tr key={deployment.id}>
                <td>
                  <Link
                    to={`/deployments/${deployment.id}`}
                    className="table-link"
                  >
                    {deployment.clientName}
                  </Link>
                </td>

                <td>
                  {deployment.productName}
                </td>

                <td>
                  {deployment.productVersion}
                </td>

                <td>
                  <span className="small-badge">
                    {deployment.status}
                  </span>
                </td>

                <td>
                  {deployment.supportTier ?? "-"}
                </td>

                <td>
                  {deployment.goLiveDate
                    ? new Date(
                        deployment.goLiveDate
                      ).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
