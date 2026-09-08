import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Client } from "../types/client";

export default function EditClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClient = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const client: Client =
        await apiFetch(`/clients/${id}`);

      setCompanyName(client.companyName);
      setCountry(client.country ?? "");
      setContactName(client.contactName ?? "");
      setContactEmail(client.contactEmail ?? "");
      setContactPhone(client.contactPhone ?? "");
      setStatus(client.status);
      setNotes(client.notes ?? "");
    } catch {
      setError("Could not load client.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadClient);
  }, [loadClient]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/clients/${id}`, {
        method: "PUT",
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

      navigate(`/clients/${id}`);
    } catch {
      setError("Could not update client.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading client...</p>;
  }

  return (
    <div className="product-details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Clients
          </p>

          <h1>Edit Client</h1>

          <p className="page-subtitle">
            Update client organization information.
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
              value={country}
              onChange={(event) =>
                setCountry(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Contact Name</label>

            <input
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
              navigate(`/clients/${id}`)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
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
