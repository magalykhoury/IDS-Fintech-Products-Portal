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

export default function CreateServerPage() {
  const { deploymentId } = useParams();
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

  const loadEnvironments = useCallback(async () => {
    if (!deploymentId) {
      setError("Deployment ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data: Environment[] =
        await apiFetch("/environments");

      const deploymentEnvironments =
        data.filter(
          (environment) =>
            environment.deploymentId ===
            Number(deploymentId)
        );

      setEnvironments(
        deploymentEnvironments
      );

      if (
        deploymentEnvironments.length === 1
      ) {
        setEnvironmentId(
          String(
            deploymentEnvironments[0].id
          )
        );
      }
    } catch {
      setError(
        "Could not load deployment environments."
      );
    } finally {
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    void Promise.resolve().then(loadEnvironments);
  }, [loadEnvironments]);

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

    if (!environmentId) {
      setError(
        "Please select an environment."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch("/servers", {
        method: "POST",

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
      });

      navigate(
        `/deployments/${deploymentId}`
      );
    } catch {
      setError(
        "Could not create server."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p>Loading environments...</p>
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

          <h1>Add Server</h1>

          <p className="page-subtitle">
            Add a server to one of this
            deployment's environments.
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

            {environments.length === 0 && (
              <p className="empty-text">
                This deployment does not
                have any environments yet.
              </p>
            )}
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
              placeholder="PROD-APP01"
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
              placeholder="prod-app01"
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
              placeholder="192.168.1.10"
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
              placeholder="Application"
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
              placeholder="Windows Server 2025"
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
              placeholder="Describe the purpose of this server..."
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
              placeholder="RDP"
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
              placeholder="VPN / credential reference"
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
              placeholder="Additional server notes..."
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
            disabled={
              saving ||
              environments.length === 0
            }
          >
            {saving
              ? "Creating..."
              : "Add Server"}
          </button>
        </div>
      </form>
    </div>
  );
}
