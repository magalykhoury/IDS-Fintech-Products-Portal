import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function CreateClientPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const client = await apiFetch("/clients", {
        method: "POST",
        body: JSON.stringify({
          companyName,
          country: country || null,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          status,
          notes: notes || null,
        }),
      });

      navigate(`/clients/${client.id}`);
    } catch {
      setError("Could not create client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Clients
          </p>

          <h1>Create Client</h1>

          <p className="page-subtitle">
            Add a new client organization to the portal.
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
            <label>Company Name</label>

            <input
              type="text"
              value={companyName}
              onChange={(event) =>
                setCompanyName(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Country</label>

            <input
              type="text"
              value={country}
              onChange={(event) =>
                setCountry(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Contact Name</label>

            <input
              type="text"
              value={contactName}
              onChange={(event) =>
                setContactName(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Contact Email</label>

            <input
              type="email"
              value={contactEmail}
              onChange={(event) =>
                setContactEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>

            <input
              type="text"
              value={contactPhone}
              onChange={(event) =>
                setContactPhone(event.target.value)
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

          <div className="form-group form-group-full">
            <label>Notes</label>

            <textarea
              rows={4}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/clients")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  );
}