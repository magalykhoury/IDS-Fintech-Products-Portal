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

interface Environment {
  id: number;
  deploymentId: number;
  name: string;
  type: string;
}

interface Server {
  id: number;
  environmentId: number;
  environmentName: string;
  deploymentId: number;
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

export default function EditServerPage() {
  const {
    deploymentId,
    serverId,
  } = useParams();

  const navigate = useNavigate();

  const [environments, setEnvironments] =
    useState<Environment[]>([]);

  const [environmentId, setEnvironmentId] =
    useState("");

  const [serverName, setServerName] =
    useState("");

  const [hostname, setHostname] =
    useState("");

  const [ipAddress, setIpAddress] =
    useState("");

  const [serverType, setServerType] =
    useState("");

  const [operatingSystem, setOperatingSystem] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  const [accessMethod, setAccessMethod] =
    useState("");

  const [accessReference, setAccessReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadPage = useCallback(async () => {
    if (!deploymentId || !serverId) {
      setError(
        "Deployment ID or Server ID is missing."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        server,
        environmentData,
      ] = await Promise.all([
        apiFetch(`/servers/${serverId}`),
        apiFetch("/environments"),
      ]);

      const deploymentEnvironments =
        environmentData.filter(
          (environment: Environment) =>
            environment.deploymentId ===
            Number(deploymentId)
        );

      setEnvironments(
        deploymentEnvironments
      );

      const serverData =
        server as Server;

      setEnvironmentId(
        String(serverData.environmentId)
      );

      setServerName(
        serverData.serverName
      );

      setHostname(
        serverData.hostname ?? ""
      );

      setIpAddress(
        serverData.ipAddress ?? ""
      );

      setServerType(
        serverData.serverType ?? ""
      );

      setOperatingSystem(
        serverData.operatingSystem ?? ""
      );

      setPurpose(
        serverData.purpose ?? ""
      );

      setAccessMethod(
        serverData.accessMethod ?? ""
      );

      setAccessReference(
        serverData.accessReference ?? ""
      );

      setNotes(
        serverData.notes ?? ""
      );

      setIsActive(
        serverData.isActive
      );
    } catch {
      setError(
        "Could not load server."
      );
    } finally {
      setLoading(false);
    }
  }, [deploymentId, serverId]);

  useEffect(() => {
    void Promise.resolve().then(loadPage);
  }, [loadPage]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !deploymentId ||
      !serverId
    ) {
      setError(
        "Deployment ID or Server ID is missing."
      );

      return;
    }

    if (!environmentId) {
      setError(
        "Please select an environment."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(
        `/servers/${serverId}`,
        {
          method: "PUT",

          body: JSON.stringify({
            environmentId:
              Number(environmentId),

            serverName,

            hostname:
              hostname.trim() || null,

            ipAddress:
              ipAddress.trim() || null,

            serverType:
              serverType.trim() || null,

            operatingSystem:
              operatingSystem.trim() || null,

            purpose:
              purpose.trim() || null,

            accessMethod:
              accessMethod.trim() || null,

            accessReference:
              accessReference.trim() || null,

            notes:
              notes.trim() || null,

            isActive,
          }),
        }
      );

      navigate(
        `/deployments/${deploymentId}`
      );
    } catch {
      setError(
        "Could not update server."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p>
        Loading server...
      </p>
    );
  }

  return (
    <div className="product-details-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployment Server
          </p>

          <h1>
            Edit Server
          </h1>

          <p className="page-subtitle">
            Update server information and
            environment assignment.
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

          {/* ENVIRONMENT */}

          <div className="form-group">
            <label htmlFor="environment">
              Environment
            </label>

            <select
              id="environment"
              value={environmentId}
              onChange={(event) =>
                setEnvironmentId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select environment
              </option>

              {environments.map(
                (environment) => (
                  <option
                    key={environment.id}
                    value={environment.id}
                  >
                    {environment.name}
                    {" — "}
                    {environment.type}
                  </option>
                )
              )}
            </select>
          </div>


          {/* SERVER NAME */}

          <div className="form-group">
            <label htmlFor="server-name">
              Server Name
            </label>

            <input
              id="server-name"
              type="text"
              value={serverName}
              onChange={(event) =>
                setServerName(
                  event.target.value
                )
              }
              maxLength={150}
              required
            />
          </div>


          {/* HOSTNAME */}

          <div className="form-group">
            <label htmlFor="hostname">
              Hostname
            </label>

            <input
              id="hostname"
              type="text"
              value={hostname}
              onChange={(event) =>
                setHostname(
                  event.target.value
                )
              }
              maxLength={255}
            />
          </div>


          {/* IP ADDRESS */}

          <div className="form-group">
            <label htmlFor="ip-address">
              IP Address
            </label>

            <input
              id="ip-address"
              type="text"
              value={ipAddress}
              onChange={(event) =>
                setIpAddress(
                  event.target.value
                )
              }
              maxLength={45}
            />
          </div>


          {/* SERVER TYPE */}

          <div className="form-group">
            <label htmlFor="server-type">
              Server Type
            </label>

            <input
              id="server-type"
              type="text"
              value={serverType}
              onChange={(event) =>
                setServerType(
                  event.target.value
                )
              }
              maxLength={100}
            />
          </div>


          {/* OPERATING SYSTEM */}

          <div className="form-group">
            <label htmlFor="operating-system">
              Operating System
            </label>

            <input
              id="operating-system"
              type="text"
              value={operatingSystem}
              onChange={(event) =>
                setOperatingSystem(
                  event.target.value
                )
              }
              maxLength={150}
            />
          </div>


          {/* PURPOSE */}

          <div className="form-group form-group-full">
            <label htmlFor="purpose">
              Purpose
            </label>

            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(event) =>
                setPurpose(
                  event.target.value
                )
              }
              maxLength={500}
            />
          </div>


          {/* ACCESS METHOD */}

          <div className="form-group">
            <label htmlFor="access-method">
              Access Method
            </label>

            <input
              id="access-method"
              type="text"
              value={accessMethod}
              onChange={(event) =>
                setAccessMethod(
                  event.target.value
                )
              }
              maxLength={100}
            />
          </div>


          {/* ACCESS REFERENCE */}

          <div className="form-group">
            <label htmlFor="access-reference">
              Access Reference
            </label>

            <input
              id="access-reference"
              type="text"
              value={accessReference}
              onChange={(event) =>
                setAccessReference(
                  event.target.value
                )
              }
              maxLength={500}
            />
          </div>


          {/* NOTES */}

          <div className="form-group form-group-full">
            <label htmlFor="server-notes">
              Notes
            </label>

            <textarea
              id="server-notes"
              rows={4}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
            />
          </div>


          {/* ACTIVE */}

          <div className="form-group form-group-full">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked
                  )
                }
              />

              {" "}
              Active Server
            </label>
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
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
