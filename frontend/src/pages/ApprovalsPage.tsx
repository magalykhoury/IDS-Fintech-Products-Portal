import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { canManageDeployments, canWritePortalData } from "../services/permissions";

interface DeploymentOption {
  id: number;
  clientName: string;
  productName: string;
}

interface Approval {
  id: number;
  entityId: number;
  title: string;
  description: string | null;
  requestedByUserId: number;
  requestedByUsername: string;
  status: string;
  reviewedByUsername: string | null;
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [deployments, setDeployments] = useState<DeploymentOption[]>([]);
  const [deploymentId, setDeploymentId] = useState("");
  const [description, setDescription] = useState("");
  const [reviewComments, setReviewComments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();
  const [searchParams] = useSearchParams();
  const focusedApprovalId = Number(searchParams.get("focus"));
  const canRequest = canManageDeployments();
  const canReview = canWritePortalData();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [approvalData, deploymentData] = await Promise.all([
        apiFetch("/approvals"),
        apiFetch("/deployments"),
      ]);
      setApprovals(approvalData);
      setDeployments(deploymentData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!focusedApprovalId || loading) return;
    document.getElementById(`approval-${focusedApprovalId}`)?.scrollIntoView({ block: "center" });
  }, [focusedApprovalId, loading]);

  const pendingApprovals = useMemo(
    () => approvals.filter((approval) => approval.status === "Pending"),
    [approvals]
  );

  async function createApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deploymentId) return;
    try {
      setSaving(true);
      setError("");
      await apiFetch("/approvals", {
        method: "POST",
        body: JSON.stringify({
          entityType: "Deployment",
          entityId: Number(deploymentId),
          description: description || null,
        }),
      });
      setDeploymentId("");
      setDescription("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not request approval.");
    } finally {
      setSaving(false);
    }
  }

  async function decide(approval: Approval, status: "Approved" | "Rejected") {
    try {
      setSaving(true);
      setError("");
      await apiFetch(`/approvals/${approval.id}/decision`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          comment: reviewComments[approval.id] || null,
        }),
      });
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not review approval.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading approvals...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Phase 2</p>
          <h1>Approvals</h1>
          <p className="page-subtitle">Request and review deployment changes with a clear decision history.</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {canRequest && (
        <section className="detail-card approval-create-card">
          <div className="card-header-row">
            <div>
              <h2>Request deployment approval</h2>
              <p className="section-description">Send a deployment change to Admin or Management for review.</p>
            </div>
          </div>
          <form className="approval-form" onSubmit={createApproval}>
            <label className="form-group">
              <span>Deployment</span>
              <select value={deploymentId} onChange={(event) => setDeploymentId(event.target.value)} required>
                <option value="">Select deployment</option>
                {deployments.map((deployment) => (
                  <option key={deployment.id} value={deployment.id}>
                    {deployment.clientName} / {deployment.productName}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-group">
              <span>Reason or change summary</span>
              <textarea value={description} maxLength={1000} onChange={(event) => setDescription(event.target.value)} placeholder="Explain what needs review..." />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Sending..." : "Request approval"}
            </button>
          </form>
        </section>
      )}

      <section className="detail-card approval-list-card">
        <div className="card-header-row">
          <div>
            <h2>{canReview ? "Approval queue" : "My approval requests"}</h2>
            <p className="section-description">{pendingApprovals.length} pending request{pendingApprovals.length === 1 ? "" : "s"}.</p>
          </div>
        </div>

        {approvals.length === 0 ? (
          <p className="empty-text">No approval requests yet.</p>
        ) : (
          <div className="approval-list">
            {approvals.map((approval) => {
              const canDecide = canReview && approval.status === "Pending" && approval.requestedByUserId !== currentUser?.userId;
              return (
                <article
                  id={`approval-${approval.id}`}
                  className={`approval-item${approval.id === focusedApprovalId ? " approval-item-focused" : ""}`}
                  key={approval.id}
                >
                  <div className="approval-item-header">
                    <div>
                      <strong>{approval.title}</strong>
                      <p>{approval.description || "No change summary provided."}</p>
                    </div>
                    <span className={`small-badge approval-status-${approval.status.toLowerCase()}`}>{approval.status}</span>
                  </div>
                  <div className="approval-meta">
                    <span>Requested by {approval.requestedByUsername}</span>
                    <span>{new Date(approval.createdAt).toLocaleString()}</span>
                    {approval.reviewedByUsername && <span>Reviewed by {approval.reviewedByUsername}</span>}
                  </div>
                  {approval.reviewComment && <p className="approval-comment">{approval.reviewComment}</p>}
                  <div className="table-actions approval-actions">
                    <Link to={`/deployments/${approval.entityId}`} className="secondary-button">View deployment</Link>
                    {canDecide && (
                      <>
                        <input aria-label={`Review comment for approval ${approval.id}`} placeholder="Review comment" value={reviewComments[approval.id] ?? ""} onChange={(event) => setReviewComments({ ...reviewComments, [approval.id]: event.target.value })} />
                        <button type="button" className="secondary-button" disabled={saving} onClick={() => decide(approval, "Approved")}>Approve</button>
                        <button type="button" className="danger-button-small" disabled={saving} onClick={() => decide(approval, "Rejected")}>Reject</button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
