import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import { canWritePortalData } from "../services/permissions";
import type { Client } from "../types/client";
import type { Deployment } from "../types/deployment";

interface Environment {
  deploymentId: number;
  name: string;
  type: string;
}

interface DeploymentModule {
  productModuleId: number;
  moduleName: string;
}

interface DeploymentTeamMember {
  id: number;
  teamMemberName: string;
  responsibility: string;
}

interface ClientDeployment extends Deployment {
  environments: Environment[];
  modules: DeploymentModule[];
  team: DeploymentTeamMember[];
}

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [deployments, setDeployments] = useState<ClientDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const loadClient = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [clientData, deploymentsData, environmentsData] = await Promise.all([
        apiFetch(`/clients/${id}`),
        apiFetch("/deployments"),
        apiFetch("/environments"),
      ]);

      const clientDeployments = deploymentsData.filter(
        (deployment: Deployment) => deployment.clientId === Number(id)
      );

      const deploymentDetails = await Promise.all(
        clientDeployments.map(async (deployment: Deployment) => {
          const [modules, team] = await Promise.all([
            apiFetch(`/deployments/${deployment.id}/modules`),
            apiFetch(`/deployments/${deployment.id}/team`),
          ]);

          return {
            ...deployment,
            modules,
            team,
            environments: environmentsData.filter(
              (environment: Environment) => environment.deploymentId === deployment.id
            ),
          };
        })
      );

      setClient(clientData);
      setDeployments(deploymentDetails);
    } catch {
      setError("Could not load client details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadClient);
  }, [loadClient]);

  async function handleDelete() {
    if (!client || !window.confirm(`Are you sure you want to delete "${client.companyName}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await apiFetch(`/clients/${client.id}`, { method: "DELETE" });
      navigate("/clients");
    } catch {
      setError("Could not delete client. It may still be referenced by deployments.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p>Loading client...</p>;
  if (error && !client) return <p>{error}</p>;
  if (!client) return <p>Client not found.</p>;

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Client</p>
          <h1>{client.companyName}</h1>
          <p className="page-subtitle">{client.notes ?? "No client notes available."}</p>
        </div>

        <div className="product-status-group">
          <span className="status-badge">{client.status}</span>
          {canWritePortalData() && (
            <>
              <Link to={`/clients/${client.id}/edit`} className="primary-button">Edit Client</Link>
              <button type="button" className="danger-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Client"}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="details-grid">
        <section className="detail-card">
          <h2>Client Information</h2>
          <div className="info-grid">
            <div><span className="info-label">Country</span><p>{client.country ?? "-"}</p></div>
            <div><span className="info-label">Status</span><p>{client.status}</p></div>
            <div><span className="info-label">Contact Name</span><p>{client.contactName ?? "-"}</p></div>
            <div><span className="info-label">Email</span><p>{client.contactEmail ?? "-"}</p></div>
            <div><span className="info-label">Phone</span><p>{client.contactPhone ?? "-"}</p></div>
          </div>
        </section>

        <section className="detail-card detail-card-wide">
          <div className="card-header-row">
            <div>
              <h2>Client Deployments</h2>
              <p className="section-description">
                Products, environments, enabled modules, and responsible team members.
              </p>
            </div>
          </div>

          {deployments.length === 0 ? (
            <p className="empty-text">No deployments found.</p>
          ) : (
            <div className="deployment-intelligence-list">
              {deployments.map((deployment) => (
                <article key={deployment.id} className="deployment-intelligence-item">
                  <div className="deployment-intelligence-header">
                    <div>
                      <Link to={`/products/${deployment.productId}`} className="detail-link">
                        {deployment.productName}
                      </Link>
                      <p>Version {deployment.productVersion} · {deployment.supportTier ?? "No support tier"}</p>
                    </div>

                    <div className="relationship-row-meta">
                      <span className="small-badge">{deployment.status}</span>
                      {deployment.goLiveDate && (
                        <span className="relationship-date">Live {new Date(deployment.goLiveDate).toLocaleDateString()}</span>
                      )}
                      <Link to={`/deployments/${deployment.id}`} className="secondary-button">View Deployment</Link>
                    </div>
                  </div>

                  <dl className="deployment-intelligence-details">
                    <div>
                      <dt>Enabled Modules</dt>
                      <dd>{deployment.modules.length === 0 ? "None recorded" : deployment.modules.map((module) => module.moduleName).join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Environments</dt>
                      <dd>{deployment.environments.length === 0 ? "None recorded" : deployment.environments.map((environment) => `${environment.name} (${environment.type})`).join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Responsible Team</dt>
                      <dd>{deployment.team.length === 0 ? "No deployment team assigned" : deployment.team.map((member) => `${member.teamMemberName} (${member.responsibility})`).join(", ")}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
