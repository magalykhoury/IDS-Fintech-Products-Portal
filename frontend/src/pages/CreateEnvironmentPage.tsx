import {
  type FormEvent,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";

export default function CreateEnvironmentPage() {
  const { deploymentId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [applicationUrl, setApplicationUrl] =
    useState("");
  const [
    databaseInformation,
    setDatabaseInformation,
  ] = useState("");
  const [monitoringUrl, setMonitoringUrl] =
    useState("");
  const [
    accessInstructions,
    setAccessInstructions,
  ] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!deploymentId) {
      setError("Deployment ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch("/environments", {
        method: "POST",

        body: JSON.stringify({
          deploymentId: Number(deploymentId),
          name,
          type,
          purpose: purpose.trim() || null,
          applicationUrl:
            applicationUrl.trim() || null,
          databaseInformation:
            databaseInformation.trim() || null,
          monitoringUrl:
            monitoringUrl.trim() || null,
          accessInstructions:
            accessInstructions.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      navigate(
        `/deployments/${deploymentId}`
      );
    } catch {
      setError(
        "Could not create environment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-details-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Deployment Environment
          </p>

          <h1>Add Environment</h1>

          <p className="page-subtitle">
            Add an environment to this deployment.
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

          {/* NAME */}

          <div className="form-group">
            <label htmlFor="environment-name">
              Environment Name
            </label>

            <input
              id="environment-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Production"
              maxLength={100}
              required
            />
          </div>


          {/* TYPE */}

          <div className="form-group">
            <label htmlFor="environment-type">
              Type
            </label>

            <input
              id="environment-type"
              type="text"
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              placeholder="Production"
              maxLength={50}
              required
            />
          </div>


          {/* PURPOSE */}

          <div className="form-group form-group-full">
            <label htmlFor="environment-purpose">
              Purpose
            </label>

            <textarea
              id="environment-purpose"
              rows={3}
              value={purpose}
              onChange={(event) =>
                setPurpose(event.target.value)
              }
              placeholder="Describe what this environment is used for..."
              maxLength={500}
            />
          </div>


          {/* APPLICATION URL */}

          <div className="form-group">
            <label htmlFor="application-url">
              Application URL
            </label>

            <input
              id="application-url"
              type="text"
              value={applicationUrl}
              onChange={(event) =>
                setApplicationUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
              maxLength={500}
            />
          </div>


          {/* MONITORING URL */}

          <div className="form-group">
            <label htmlFor="monitoring-url">
              Monitoring URL
            </label>

            <input
              id="monitoring-url"
              type="text"
              value={monitoringUrl}
              onChange={(event) =>
                setMonitoringUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
              maxLength={500}
            />
          </div>


          {/* DATABASE INFORMATION */}

          <div className="form-group form-group-full">
            <label htmlFor="database-information">
              Database Information
            </label>

            <textarea
              id="database-information"
              rows={3}
              value={databaseInformation}
              onChange={(event) =>
                setDatabaseInformation(
                  event.target.value
                )
              }
              placeholder="Database server, database name, or other relevant information..."
              maxLength={500}
            />
          </div>


          {/* ACCESS INSTRUCTIONS */}

          <div className="form-group form-group-full">
            <label htmlFor="access-instructions">
              Access Instructions
            </label>

            <textarea
              id="access-instructions"
              rows={4}
              value={accessInstructions}
              onChange={(event) =>
                setAccessInstructions(
                  event.target.value
                )
              }
              placeholder="VPN requirements, access procedure, credentials location, etc."
              maxLength={1000}
            />
          </div>


          {/* NOTES */}

          <div className="form-group form-group-full">
            <label htmlFor="environment-notes">
              Notes
            </label>

            <textarea
              id="environment-notes"
              rows={4}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Additional notes..."
            />
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
              ? "Creating..."
              : "Add Environment"}
          </button>
        </div>
      </form>
    </div>
  );
}