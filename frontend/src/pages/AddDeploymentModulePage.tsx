import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Deployment } from "../types/deployment";

interface ProductModule {
  id: number;
  productId: number;
  name: string;
  description: string | null;
  status: string;
}

interface DeploymentModule {
  deploymentId: number;
  productModuleId: number;
  moduleName: string;
  moduleDescription: string | null;
  moduleStatus: string;
}

export default function AddDeploymentModulePage() {
  const { deploymentId } = useParams();
  const navigate = useNavigate();

  const [deployment, setDeployment] =
    useState<Deployment | null>(null);

  const [availableModules, setAvailableModules] =
    useState<ProductModule[]>([]);

  const [selectedModuleId, setSelectedModuleId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadPage = useCallback(async () => {
    if (!deploymentId) {
      setError("Deployment ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const deploymentData: Deployment =
        await apiFetch(
          `/deployments/${deploymentId}`
        );

      const [
        productModules,
        enabledModules,
      ] = await Promise.all([
        apiFetch(
          `/productmodules/product/${deploymentData.productId}`
        ),
        apiFetch(
          `/deployments/${deploymentId}/modules`
        ),
      ]);

      const enabledIds = new Set(
        (
          enabledModules as DeploymentModule[]
        ).map(
          (module) =>
            module.productModuleId
        )
      );

      const available =
        (
          productModules as ProductModule[]
        ).filter(
          (module) =>
            !enabledIds.has(module.id)
        );

      setDeployment(deploymentData);
      setAvailableModules(available);

      if (available.length === 1) {
        setSelectedModuleId(
          String(available[0].id)
        );
      }
    } catch {
      setError(
        "Could not load available modules."
      );
    } finally {
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    void Promise.resolve().then(loadPage);
  }, [loadPage]);

  async function handleAddModule() {
    if (
      !deploymentId ||
      !selectedModuleId
    ) {
      setError(
        "Please select a module."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/deployments/${deploymentId}/modules/${selectedModuleId}`,
        {
          method: "POST",
        }
      );

      navigate(
        `/deployments/${deploymentId}`
      );
    } catch {
      setError(
        "Could not enable module for this deployment."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p>Loading modules...</p>
    );
  }

  return (
    <div className="product-details-page">

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployment Modules
          </p>

          <h1>
            Enable Module
          </h1>

          <p className="page-subtitle">
            {deployment
              ? `Enable a ${deployment.productName} module for this deployment.`
              : "Enable a product module for this deployment."}
          </p>
        </div>
      </div>

      <div className="detail-card form-card">

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {availableModules.length === 0 ? (
          <p className="empty-text">
            All available product modules are already
            enabled for this deployment.
          </p>
        ) : (
          <div className="form-grid">

            <div className="form-group form-group-full">
              <label htmlFor="module">
                Product Module
              </label>

              <select
                id="module"
                value={selectedModuleId}
                onChange={(event) =>
                  setSelectedModuleId(
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Select module
                </option>

                {availableModules.map(
                  (module) => (
                    <option
                      key={module.id}
                      value={module.id}
                    >
                      {module.name}
                      {" — "}
                      {module.status}
                    </option>
                  )
                )}
              </select>
            </div>

            {selectedModuleId && (
              <div className="form-group form-group-full">
                <span className="info-label">
                  Description
                </span>

                <p>
                  {availableModules.find(
                    (module) =>
                      module.id ===
                      Number(selectedModuleId)
                  )?.description ??
                    "No description available."}
                </p>
              </div>
            )}

          </div>
        )}

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

          {availableModules.length > 0 && (
            <button
              type="button"
              className="primary-button"
              onClick={handleAddModule}
              disabled={
                saving ||
                !selectedModuleId
              }
            >
              {saving
                ? "Enabling..."
                : "Enable Module"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
