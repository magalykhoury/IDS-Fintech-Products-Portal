import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";
import { canManageProducts } from "../services/permissions";
import type { Deployment } from "../types/deployment";
import type { Product } from "../types/product";

interface ProductModule {
  id: number;
  productId: number;
  name: string;
  description: string | null;
  status: string;
}

interface ProductTechnology {
  technologyId: number;
  technologyName: string;
  technologyDescription: string | null;
}

interface Repository {
  id: number;
  name: string;
  repositoryUrl: string;
  mainBranch: string | null;
  description: string | null;
}

interface Document {
  id: number;
  name: string;
  documentType: string;
  description: string | null;
  urlOrFileReference: string;
}

interface ProductTeamMember {
  id: number;
  teamMemberId: number;
  teamMemberName: string;
  responsibility: string;
  description: string | null;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [modules, setModules] =
    useState<ProductModule[]>([]);

  const [technologies, setTechnologies] =
    useState<ProductTechnology[]>([]);

  const [repositories, setRepositories] =
    useState<Repository[]>([]);

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [team, setTeam] =
    useState<ProductTeamMember[]>([]);

  const [deployments, setDeployments] =
    useState<Deployment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadProductDetails = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        productData,
        modulesData,
        technologiesData,
        repositoriesData,
        documentsData,
        teamData,
        deploymentsData,
      ] = await Promise.all([
        apiFetch(`/products/${id}`),
        apiFetch(`/productmodules/product/${id}`),
        apiFetch(`/products/${id}/technologies`),
        apiFetch(`/repositories/product/${id}`),
        apiFetch(`/documents/product/${id}`),
        apiFetch(`/products/${id}/team`),
        apiFetch("/deployments"),
      ]);

      setProduct(productData);
      setModules(modulesData);
      setTechnologies(technologiesData);
      setRepositories(repositoriesData);
      setDocuments(documentsData);
      setTeam(teamData);
      setDeployments(
        deploymentsData.filter(
          (deployment: Deployment) =>
            deployment.productId === Number(id)
        )
      );
    } catch {
      setError(
        "Could not load product details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadProductDetails);
  }, [loadProductDetails]);

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  async function handleDelete() {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await apiFetch(
        `/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      navigate("/products");
    } catch {
      setError(
        "Could not delete product. It may still be referenced by other records."
      );
    } finally {
      setDeleting(false);
    }
  }

  // --------------------------------------------------
  // DELETE MODULE
  // --------------------------------------------------

  async function handleDeleteModule(
    module: ProductModule
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete module "${module.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/productmodules/${module.id}`,
        {
          method: "DELETE",
        }
      );

      await loadProductDetails();
    } catch {
      setError(
        "Could not delete module. It may still be enabled in one or more deployments."
      );
    }
  }

  // --------------------------------------------------
  // REMOVE TECHNOLOGY
  // --------------------------------------------------

  async function handleRemoveTechnology(
    technology: ProductTechnology
  ) {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${technology.technologyName}" from this product?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/products/${product.id}/technologies/${technology.technologyId}`,
        {
          method: "DELETE",
        }
      );

      await loadProductDetails();
    } catch {
      setError(
        "Could not remove technology from product."
      );
    }
  }

  // --------------------------------------------------
  // REMOVE PRODUCT TEAM MEMBER
  // --------------------------------------------------

  async function handleRemoveTeamMember(
    member: ProductTeamMember
  ) {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${member.teamMemberName}" from this product?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/products/${product.id}/team/${member.id}`,
        {
          method: "DELETE",
        }
      );

      await loadProductDetails();
    } catch {
      setError(
        "Could not remove team member from product."
      );
    }
  }

  // --------------------------------------------------
  // DELETE REPOSITORY
  // --------------------------------------------------

  async function handleDeleteRepository(
    repository: Repository
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete repository "${repository.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/repositories/${repository.id}`,
        {
          method: "DELETE",
        }
      );

      await loadProductDetails();
    } catch {
      setError(
        "Could not delete repository."
      );
    }
  }

  // --------------------------------------------------
  // DELETE DOCUMENT
  // --------------------------------------------------

  async function handleDeleteDocument(
    document: Document
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete document "${document.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/documents/${document.id}`,
        {
          method: "DELETE",
        }
      );

      await loadProductDetails();
    } catch {
      setError(
        "Could not delete document."
      );
    }
  }

  // --------------------------------------------------
  // LOADING / ERROR
  // --------------------------------------------------

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error && !product) {
    return <p>{error}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="product-details-page">

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Product
          </p>

          <h1>
            {product.name}
          </h1>

          <p className="page-subtitle">
            {product.description ??
              "No description available."}
          </p>
        </div>

        <div className="product-status-group">
          <span className="status-badge">
            {product.lifecycleStatus}
          </span>

          <span className="version-badge">
            Version{" "}
            {product.currentVersion ?? "-"}
          </span>

          {canManageProducts() && (
            <>
              <Link to={`/products/${product.id}/edit`} className="primary-button">
                Edit Product
              </Link>

              <button type="button" className="danger-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="details-grid">

        {/* --------------------------------------------------
            PRODUCT INFORMATION
        -------------------------------------------------- */}

        <section className="detail-card">
          <h2>
            Product Information
          </h2>

          <div className="info-grid">
            <div>
              <span className="info-label">
                Business Purpose
              </span>

              <p>
                {product.businessPurpose ??
                  "-"}
              </p>
            </div>

            <div>
              <span className="info-label">
                Criticality
              </span>

              <p>
                {product.criticality ??
                  "-"}
              </p>
            </div>

            <div>
              <span className="info-label">
                Supported Markets
              </span>

              <p>
                {product.supportedMarkets ??
                  "-"}
              </p>
            </div>

            <div>
              <span className="info-label">
                Lifecycle Status
              </span>

              <p>
                {product.lifecycleStatus}
              </p>
            </div>

            <div>
              <span className="info-label">
                Current Version
              </span>

              <p>
                {product.currentVersion ??
                  "-"}
              </p>
            </div>

            <div>
              <span className="info-label">
                Notes
              </span>

              <p>
                {product.notes ?? "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="detail-card detail-card-wide">
          <div className="card-header-row">
            <div>
              <h2>Clients Using This Product</h2>
              <p className="section-description">
                {deployments.length} active deployment{deployments.length === 1 ? "" : "s"} recorded.
              </p>
            </div>
          </div>

          {deployments.length === 0 ? (
            <p className="empty-text">
              No client deployments are recorded for this product.
            </p>
          ) : (
            <div className="relationship-list">
              {deployments.map((deployment) => (
                <div className="relationship-row" key={deployment.id}>
                  <div>
                    <Link to={`/clients/${deployment.clientId}`} className="detail-link">
                      {deployment.clientName}
                    </Link>
                    <p>
                      Version {deployment.productVersion} · {deployment.supportTier ?? "No support tier"}
                    </p>
                  </div>

                  <div className="relationship-row-meta">
                    <span className="small-badge">{deployment.status}</span>
                    {deployment.goLiveDate && (
                      <span className="relationship-date">
                        Live {new Date(deployment.goLiveDate).toLocaleDateString()}
                      </span>
                    )}
                    <Link to={`/deployments/${deployment.id}`} className="secondary-button">
                      View Deployment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* --------------------------------------------------
            TECHNOLOGIES
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">
            <h2>
              Technologies
            </h2>

            {canManageProducts() && <Link to={`/products/${product.id}/technologies/add`} className="secondary-button">Add Technology</Link>}
          </div>

          {technologies.length === 0 ? (
            <p className="empty-text">
              No technologies assigned.
            </p>
          ) : (
            <div className="technology-list">
              {technologies.map(
                (technology) => (
                  <div
                    key={
                      technology.technologyId
                    }
                    className="technology-item"
                  >
                    <div>
                      <strong>
                        {
                          technology.technologyName
                        }
                      </strong>

                      {technology.technologyDescription && (
                        <p>
                          {
                            technology.technologyDescription
                          }
                        </p>
                      )}
                    </div>

                    {canManageProducts() && <button type="button" className="danger-button-small" onClick={() => handleRemoveTechnology(technology)}>Remove</button>}
                  </div>
                )
              )}
            </div>
          )}
        </section>


        {/* --------------------------------------------------
            MODULES
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">
            <h2>
              Modules
            </h2>

            {canManageProducts() && <Link to={`/products/${product.id}/modules/new`} className="secondary-button">Add Module</Link>}
          </div>

          {modules.length === 0 ? (
            <p className="empty-text">
              No modules available.
            </p>
          ) : (
            <div className="detail-list">
              {modules.map(
                (module) => (
                  <div
                    className="detail-list-item"
                    key={module.id}
                  >
                    <div>
                      <strong>
                        {module.name}
                      </strong>

                      <p>
                        {module.description ??
                          "No description available."}
                      </p>
                    </div>

                    <div className="table-actions">
                      <span className="small-badge">
                        {module.status}
                      </span>

                      {canManageProducts() && <>
                        <Link to={`/products/${product.id}/modules/${module.id}/edit`} className="secondary-button">Edit</Link>
                        <button type="button" className="danger-button-small" onClick={() => handleDeleteModule(module)}>Delete</button>
                      </>}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>


        {/* --------------------------------------------------
            TEAM
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">
            <h2>
              Team
            </h2>

            {canManageProducts() && <Link to={`/products/${product.id}/team/assign`} className="secondary-button">Assign Team Member</Link>}
          </div>

          {team.length === 0 ? (
            <p className="empty-text">
              No team members assigned.
            </p>
          ) : (
            <div className="detail-list">
              {team.map(
                (member) => (
                  <div
                    className="detail-list-item"
                    key={member.id}
                  >
                    <div>
                      <strong>
                        {
                          member.teamMemberName
                        }
                      </strong>

                      <p>
                        {member.description ??
                          "No description available."}
                      </p>
                    </div>

                    <div className="table-actions">
                      <span className="small-badge">
                        {
                          member.responsibility
                        }
                      </span>

                      {canManageProducts() && <>
                        <Link to={`/products/${product.id}/team/${member.id}/edit`} className="secondary-button">Edit</Link>
                        <button type="button" className="danger-button-small" onClick={() => handleRemoveTeamMember(member)}>Remove</button>
                      </>}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>


        {/* --------------------------------------------------
            REPOSITORIES
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">
            <h2>
              Repositories
            </h2>

            {canManageProducts() && <Link to={`/products/${product.id}/repositories/new`} className="secondary-button">Add Repository</Link>}
          </div>

          {repositories.length === 0 ? (
            <p className="empty-text">
              No repositories available.
            </p>
          ) : (
            <div className="detail-list">
              {repositories.map(
                (repository) => (
                  <div
                    className="detail-list-item"
                    key={repository.id}
                  >
                    <div>
                      <a
                        href={
                          repository.repositoryUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="detail-link"
                      >
                        {repository.name}
                      </a>

                      <p>
                        {repository.description ??
                          "No description available."}
                      </p>
                    </div>

                    <div className="table-actions">
                      <span className="small-badge">
                        {repository.mainBranch ??
                          "-"}
                      </span>

                      {canManageProducts() && <>
                        <Link to={`/products/${product.id}/repositories/${repository.id}/edit`} className="secondary-button">Edit</Link>
                        <button type="button" className="danger-button-small" onClick={() => handleDeleteRepository(repository)}>Delete</button>
                      </>}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>


        {/* --------------------------------------------------
            DOCUMENTATION
        -------------------------------------------------- */}

        <section className="detail-card">
          <div className="card-header-row">
            <h2>
              Documentation
            </h2>

            {canManageProducts() && <Link to={`/products/${product.id}/documents/new`} className="secondary-button">Add Document</Link>}
          </div>

          {documents.length === 0 ? (
            <p className="empty-text">
              No documents available.
            </p>
          ) : (
            <div className="detail-list">
              {documents.map(
                (document) => (
                  <div
                    className="detail-list-item"
                    key={document.id}
                  >
                    <div>
                      <a
                        href={
                          document.urlOrFileReference
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="detail-link"
                      >
                        {document.name}
                      </a>

                      <p>
                        {document.description ??
                          "No description available."}
                      </p>
                    </div>

                    <div className="table-actions">
                      <span className="small-badge">
                        {
                          document.documentType
                        }
                      </span>

                      {canManageProducts() && <>
                        <Link to={`/products/${product.id}/documents/${document.id}/edit`} className="secondary-button">Edit</Link>
                        <button type="button" className="danger-button-small" onClick={() => handleDeleteDocument(document)}>Delete</button>
                      </>}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
