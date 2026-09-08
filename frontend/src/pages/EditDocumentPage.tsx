import { useCallback, useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { apiFetch } from "../services/api";

interface Document {
  id: number;
  productId: number;
  name: string;
  documentType: string;
  description: string | null;
  urlOrFileReference: string;
  lastUpdatedDate: string | null;
}

export default function EditDocumentPage() {
  const { productId, documentId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [urlOrFileReference, setUrlOrFileReference] =
    useState("");
  const [lastUpdatedDate, setLastUpdatedDate] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDocument = useCallback(async () => {
    if (!documentId) {
      setError("Document ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const document: Document =
        await apiFetch(`/documents/${documentId}`);

      setName(document.name);
      setDocumentType(document.documentType);
      setDescription(document.description ?? "");
      setUrlOrFileReference(
        document.urlOrFileReference
      );

      setLastUpdatedDate(
        document.lastUpdatedDate
          ? document.lastUpdatedDate.substring(0, 10)
          : ""
      );
    } catch {
      setError("Could not load document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void Promise.resolve().then(loadDocument);
  }, [loadDocument]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!productId || !documentId) {
      setError(
        "Product ID or Document ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/documents/${documentId}`, {
        method: "PUT",

        body: JSON.stringify({
          productId: Number(productId),
          name,
          documentType,
          description:
            description.trim() || null,
          urlOrFileReference,
          lastUpdatedDate:
            lastUpdatedDate || null,
        }),
      });

      navigate(`/products/${productId}`);
    } catch {
      setError("Could not update document.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading document...</p>;
  }

  if (error && !name) {
    return (
      <div className="product-details-page">
        <p className="form-error">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(`/products/${productId}`)
          }
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Documentation
          </p>

          <h1>Edit Document</h1>

          <p className="page-subtitle">
            Update product documentation information.
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

          {/* DOCUMENT NAME */}

          <div className="form-group">
            <label htmlFor="document-name">
              Document Name
            </label>

            <input
              id="document-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>


          {/* DOCUMENT TYPE */}

          <div className="form-group">
            <label htmlFor="document-type">
              Document Type
            </label>

            <input
              id="document-type"
              type="text"
              value={documentType}
              onChange={(event) =>
                setDocumentType(
                  event.target.value
                )
              }
              placeholder="Technical Documentation"
              required
            />
          </div>


          {/* URL / FILE REFERENCE */}

          <div className="form-group form-group-full">
            <label htmlFor="document-reference">
              URL or File Reference
            </label>

            <input
              id="document-reference"
              type="text"
              value={urlOrFileReference}
              onChange={(event) =>
                setUrlOrFileReference(
                  event.target.value
                )
              }
              placeholder="https://..."
              required
            />
          </div>


          {/* LAST UPDATED */}

          <div className="form-group">
            <label htmlFor="last-updated-date">
              Last Updated Date
            </label>

            <input
              id="last-updated-date"
              type="date"
              value={lastUpdatedDate}
              onChange={(event) =>
                setLastUpdatedDate(
                  event.target.value
                )
              }
            />
          </div>


          {/* DESCRIPTION */}

          <div className="form-group form-group-full">
            <label htmlFor="document-description">
              Description
            </label>

            <textarea
              id="document-description"
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe this document..."
            />
          </div>

        </div>


        {/* ACTIONS */}

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(`/products/${productId}`)
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
