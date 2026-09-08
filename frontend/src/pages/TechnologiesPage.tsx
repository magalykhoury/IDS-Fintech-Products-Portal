import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../services/api";

interface Technology {
  id: number;
  name: string;
  description: string | null;
}

const emptyForm = { name: "", description: "" };

export default function TechnologiesPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTechnologies() {
    try {
      setLoading(true);
      setError("");
      setTechnologies(await apiFetch("/technologies"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load technologies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    apiFetch("/technologies")
      .then((data) => {
        if (isCurrent) setTechnologies(data as Technology[]);
      })
      .catch((caught) => {
        if (isCurrent) {
          setError(caught instanceof Error ? caught.message : "Could not load technologies.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await apiFetch(editingId ? `/technologies/${editingId}` : "/technologies", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      resetForm();
      await loadTechnologies();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save technology.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(technology: Technology) {
    if (!window.confirm(`Delete "${technology.name}"? Products using it may need to be updated first.`)) return;
    try {
      setError("");
      await apiFetch(`/technologies/${technology.id}`, { method: "DELETE" });
      await loadTechnologies();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete technology.");
    }
  }

  if (loading) return <p className="empty-text">Loading technologies...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Catalogue</p>
          <h1>Technologies</h1>
          <p className="page-subtitle">Maintain the shared technology catalogue used across product records.</p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="management-layout">
        <section className="detail-card form-card">
          <div className="card-header-row">
            <h2>{editingId ? "Edit technology" : "Add technology"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="technology-name">Name</label>
              <input id="technology-name" value={form.name} maxLength={100} required onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="technology-description">Description</label>
              <textarea id="technology-description" value={form.description} maxLength={500} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="form-actions form-group-full">
              {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
              <button className="primary-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Add technology"}</button>
            </div>
          </form>
        </section>

        <section className="detail-card">
          <div className="card-header-row"><h2>Available technologies</h2></div>
          {technologies.length === 0 ? <p className="empty-text">No technologies have been added yet.</p> : <div className="detail-list">
            {technologies.map((technology) => <div key={technology.id} className="detail-list-item">
              <div><strong>{technology.name}</strong><p>{technology.description || "No description provided."}</p></div>
              <div className="table-actions"><button className="secondary-button" onClick={() => { setEditingId(technology.id); setForm({ name: technology.name, description: technology.description ?? "" }); }}>Edit</button><button className="danger-button-small" onClick={() => handleDelete(technology)}>Delete</button></div>
            </div>)}
          </div>}
        </section>
      </div>
    </div>
  );
}
