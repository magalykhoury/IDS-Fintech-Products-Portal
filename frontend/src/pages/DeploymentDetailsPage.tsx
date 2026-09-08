import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";
import { canManageDeployments } from "../services/permissions";
import type { Deployment } from "../types/deployment";

interface Environment {
  id: number;
  deploymentId: number;
  name: string;
  type: string;
  purpose: string | null;
  applicationUrl: string | null;
  databaseInformation: string | null;
  monitoringUrl: string | null;
  accessInstructions: string | null;
  notes: string | null;
}

interface Server {
  id: number;
  environmentId: number;
  environmentName: string;
  deploymentId: number;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  serverName: string;
  hostname: string | null;
  ipAddress: string | null;
  serverType: string | null;
  operatingSystem: string | null;
  purpose: string | null;
  accessMethod: string | null;
  accessReference: string | null;
  notes: string | null;
  isActive: boolean;
}

interface DeploymentModule {
  deploymentId: number;
  productModuleId: number;
  moduleName: string;
  moduleDescription: string | null;
  moduleStatus: string;
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

export default function DeploymentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deployment, setDeployment] =
    useState<Deployment | null>(null);

  const [environments, setEnvironments] =
    useState<Environment[]>([]);

  const [servers, setServers] =
    useState<Server[]>([]);

  const [modules, setModules] =
    useState<DeploymentModule[]>([]);

  const [team, setTeam] =
    useState<DeploymentTeamMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadDeploymentDetails = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        deploymentData,
        environmentsData,
        serversData,
        modulesData,
        teamData,
      ] = await Promise.all([
        apiFetch(`/deployments/${id}`),
        apiFetch("/environments"),
        apiFetch("/servers"),
        apiFetch(`/deployments/${id}/modules`),
        apiFetch(`/deployments/${id}/team`),
      ]);

      setDeployment(deploymentData);

      setEnvironments(
        environmentsData.filter(
          (environment: Environment) =>
            environment.deploymentId ===
            Number(id)
        )
      );

      setServers(
        serversData.filter(
          (server: Server) =>
            server.deploymentId ===
            Number(id)
        )
      );

      setModules(modulesData);
      setTeam(teamData);
    } catch {
      setError(
        "Could not load deployment details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadDeploymentDetails);
  }, [loadDeploymentDetails]);

  // --------------------------------------------------
  // DELETE DEPLOYMENT
  // --------------------------------------------------

  async function handleDelete() {
    if (!deployment) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the deployment "${deployment.clientName} / ${deployment.productName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await apiFetch(
        `/deployments/${deployment.id}`,
        {
          method: "DELETE",
        }
      );

      navigate("/deployments");
    } catch {
      setError(
        "Could not delete deployment. It may still be referenced by environments, servers, modules, or responsibilities."
      );
    } finally {
      setDeleting(false);
    }
  }

  // --------------------------------------------------
  // DELETE ENVIRONMENT
  // --------------------------------------------------

  async function handleDeleteEnvironment(
    environment: Environment
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete environment "${environment.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/environments/${environment.id}`,
        {
          method: "DELETE",
        }
      );

      await loadDeploymentDetails();
    } catch {
      setError(
        "Could not delete environment. It may still contain servers."
      );
    }
  }

  // --------------------------------------------------
  // DELETE SERVER
  // --------------------------------------------------

  async function handleDeleteServer(
    server: Server
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete server "${server.serverName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/servers/${server.id}`,
        {
          method: "DELETE",
        }
      );

      await loadDeploymentDetails();
    } catch {
      setError(
        "Could not delete server."
      );
    }
  }

  // --------------------------------------------------
  // REMOVE MODULE
  // --------------------------------------------------

  async function handleRemoveModule(
    module: DeploymentModule
  ) {
    if (!deployment) {
      return;
    }

    const confirmed = window.confirm(
      `Remove module "${module.moduleName}" from this deployment?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/deployments/${deployment.id}/modules/${module.productModuleId}`,
        {
          method: "DELETE",
        }
      );

      await loadDeploymentDetails();
    } catch {
      setError(
        "Could not remove module from deployment."
      );
    }
  }

  // --------------------------------------------------
  // REMOVE TEAM MEMBER
  // --------------------------------------------------

  async function handleRemoveTeamMember(
    member: DeploymentTeamMember
  ) {
    if (!deployment) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${member.teamMemberName}" from this deployment?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/deployments/${deployment.id}/team/${member.id}`,
        {
          method: "DELETE",
        }
      );

      await loadDeploymentDetails();
    } catch {
      setError(
        "Could not remove team member from deployment."
      );
    }
  }

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------

  if (loading) {
    return (
      <p>
        Loading deployment...
      </p>
    );
  }

  if (error && !deployment) {
    return <p>{error}</p>;
  }

  if (!deployment) {
    return (
      <p>
        Deployment not found.
      </p>
    );
  }

  return (
    <div className="product-details-page">

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployment
          </p>

          <h1>
            {deployment.clientName}
            {" / "}
            {deployment.productName}
          </h1>

          <p className="page-subtitle">
            {deployment.clientSpecificNotes ??
              "No deployment notes available."}
          </p>
        </div>

        <div className="product-status-group">
          <span className="status-badge">
            {deployment.status}
          </span>

          <span className="version-badge">
            Version {deployment.productVersion}
          </span>

          {canManageDeployments() && <>
            <Link to={`/deployments/${deployment.id}/edit`} className="primary-button">Edit Deployment</Link>
            <button type="button" className="danger-button" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete Deployment"}</button>
          </>}
        </div>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="details-grid">

        {/* --------------------------------------------------
            DEPLOYMENT INFORMATION
        -------------------------------------------------- */}

        <section className="detail-card">
          <h2>
            Deployment Information
          </h2>

          <div className="info-grid">

            <div>
              <span className="info-label">
                Client
              </span>

              <p>
                <Link
                  to={`/clients/${deployment.clientId}`}
                  className="detail-link"
                >
                  {deployment.clientName}
                </Link>
              </p>
            </div>

            <div>
              <span className="info-label">
                Product
              </span>

              <p>
                <Link
                  to={`/products/${deployment.productId}`}
                  className="detail-link"
                >
                  {deployment.productName}
                </Link>
              </p>
            </div>

            <div>
              <span className="info-label">
                Version
              </span>

              <p>
                {deployment.productVersion}
              </p>
            </div>

            <div>
              <span className="info-label">
                Support Tier
              </span>

              <p>
                {deployment.supportTier ?? "-"}
              </p>
            </div>

            <div>
              <span className="info-label">
                Status
              </span>

              <p>
                {deployment.status}
              </p>
            </div>

            <div>
              <span className="info-label">
                Go Live Date
              </span>

              <p>
                {deployment.goLiveDate
                  ? new Date(
                      deployment.goLiveDate
                    ).toLocaleDateString()
                  : "-"}
              </p>
            </div>

          </div>
        </section>


        {/* --------------------------------------------------
            ENABLED MODULES
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">

            <h2>
              Enabled Modules
            </h2>

            {canManageDeployments() && <Link to={`/deployments/${deployment.id}/modules/add`} className="secondary-button">Enable Module</Link>}

          </div>

          {modules.length === 0 ? (
            <p className="empty-text">
              No modules enabled.
            </p>
          ) : (
            <div className="detail-list">

              {modules.map((module) => (
                <div
                  key={module.productModuleId}
                  className="detail-list-item"
                >
                  <div>
                    <strong>
                      {module.moduleName}
                    </strong>

                    <p>
                      {module.moduleDescription ??
                        "No description available."}
                    </p>
                  </div>

                  <div className="table-actions">

                    <span className="small-badge">
                      {module.moduleStatus}
                    </span>

                    {canManageDeployments() && <button type="button" className="danger-button-small" onClick={() => handleRemoveModule(module)}>Remove</button>}

                  </div>
                </div>
              ))}

            </div>
          )}
        </section>


        {/* --------------------------------------------------
            ENVIRONMENTS
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">

            <h2>
              Environments
            </h2>

            {canManageDeployments() && <Link to={`/deployments/${deployment.id}/environments/new`} className="secondary-button">Add Environment</Link>}

          </div>

          {environments.length === 0 ? (
            <p className="empty-text">
              No environments found.
            </p>
          ) : (
            <div className="detail-list">

              {environments.map(
                (environment) => (
                  <div
                    key={environment.id}
                    className="detail-list-item"
                  >

                    <div>
                      <strong>
                        {environment.name}
                      </strong>

                      <p>
                        {environment.purpose ??
                          "No purpose specified."}
                      </p>

                      {environment.applicationUrl && (
                        <p>
                          <a
                            href={
                              environment.applicationUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="detail-link"
                          >
                            Application
                          </a>
                        </p>
                      )}

                      {environment.monitoringUrl && (
                        <p>
                          <a
                            href={
                              environment.monitoringUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="detail-link"
                          >
                            Monitoring
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="table-actions">

                      <span className="small-badge">
                        {environment.type}
                      </span>

                      {canManageDeployments() && <>
                        <Link to={`/deployments/${deployment.id}/environments/${environment.id}/edit`} className="secondary-button">Edit</Link>
                        <button type="button" className="danger-button-small" onClick={() => handleDeleteEnvironment(environment)}>Delete</button>
                      </>}

                    </div>
                  </div>
                )
              )}

            </div>
          )}
        </section>


        {/* --------------------------------------------------
            SERVERS
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">

            <h2>
              Servers
            </h2>

            {canManageDeployments() && <Link to={`/deployments/${deployment.id}/servers/new`} className="secondary-button">Add Server</Link>}

          </div>

          {servers.length === 0 ? (
            <p className="empty-text">
              No servers found.
            </p>
          ) : (
            <div className="detail-list">

              {servers.map((server) => (
                <div
                  key={server.id}
                  className="detail-list-item"
                >

                  <div>
                    <strong>
                      {server.serverName}
                    </strong>

                    <p>
                      {server.hostname ??
                        "No hostname"}
                      {" · "}
                      {server.operatingSystem ??
                        "Unknown OS"}
                    </p>

                    <p>
                      Environment:{" "}
                      {server.environmentName}
                    </p>

                    {server.ipAddress && (
                      <p>
                        IP: {server.ipAddress}
                      </p>
                    )}
                  </div>

                  <div className="table-actions">

                    <span className="small-badge">
                      {server.serverType ??
                        "Server"}
                    </span>

                    {!server.isActive && (
                      <span className="small-badge">
                        Inactive
                      </span>
                    )}

                    {canManageDeployments() && <>
                      <Link to={`/deployments/${deployment.id}/servers/${server.id}/edit`} className="secondary-button">Edit</Link>
                      <button type="button" className="danger-button-small" onClick={() => handleDeleteServer(server)}>Delete</button>
                    </>}

                  </div>
                </div>
              ))}

            </div>
          )}
        </section>


        {/* --------------------------------------------------
            DEPLOYMENT TEAM
        -------------------------------------------------- */}

        <section className="detail-card">

          <div className="card-header-row">
            <h2>
              Deployment Team
            </h2>

            {canManageDeployments() && <Link to={`/deployments/${deployment.id}/team/assign`} className="secondary-button">Assign Team Member</Link>}
          </div>

          {team.length === 0 ? (
            <p className="empty-text">
              No team members assigned.
            </p>
          ) : (
            <div className="detail-list">

              {team.map((member) => (
                <div
                  key={member.id}
                  className="detail-list-item"
                >

                  <div>
                    <strong>
                      {member.teamMemberName}
                    </strong>

                    <p>
                      {member.description ??
                        "No description available."}
                    </p>
                  </div>

                  <div className="table-actions">

                    <span className="small-badge">
                      {member.responsibility}
                    </span>

                    {canManageDeployments() && <>
                      <Link to={`/deployments/${deployment.id}/team/${member.id}/edit`} className="secondary-button">Edit</Link>
                      <button type="button" className="danger-button-small" onClick={() => handleRemoveTeamMember(member)}>Remove</button>
                    </>}

                  </div>
                </div>
              ))}

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
