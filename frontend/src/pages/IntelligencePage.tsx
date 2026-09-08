import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { IconArrowUpRight, IconSparkles } from "@tabler/icons-react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

interface IntelligenceSource {
  entityType: string;
  entityId: number;
  label: string;
  path: string;
}

interface IntelligenceResponse {
  answer: string;
  providerStatus: "Generated" | "NotConfigured" | "NoRelevantData" | "Restricted" | "ProviderUnavailable";
  model: string | null;
  sources: IntelligenceSource[];
}

const suggestions = [
  "Show production deployments.",
  "Which products use React?",
  "Which clients have UAT environments?",
  "Where is the technical documentation?",
];

export default function IntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q")?.trim() ?? "";
  const [question, setQuestion] = useState(queryFromUrl);
  const [result, setResult] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastQuery = useRef("");

  const runQuery = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2 || trimmedQuery === lastQuery.current) return;

    lastQuery.current = trimmedQuery;
    setQuestion(trimmedQuery);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      setResult(await apiFetch("/intelligence/query", {
        method: "POST",
        body: JSON.stringify({ question: trimmedQuery }),
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not search portal intelligence.");
      lastQuery.current = "";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (queryFromUrl) void Promise.resolve().then(() => runQuery(queryFromUrl));
  }, [queryFromUrl, runQuery]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 2) return;

    if (trimmedQuestion === queryFromUrl) {
      lastQuery.current = "";
      void runQuery(trimmedQuestion);
    } else {
      setSearchParams({ q: trimmedQuestion });
    }
  }

  function handleSuggestion(suggestion: string) {
    setQuestion(suggestion);
    setSearchParams({ q: suggestion });
  }

  return (
    <div>
      <div className="page-header intelligence-header">
        <div>
          <p className="page-eyebrow">Product intelligence</p>
          <h1>Ask the portal</h1>
          <p className="page-subtitle">
            Get concise answers grounded only in IDS Fintech product, client, deployment, and responsibility records.
          </p>
        </div>
        <span className="intelligence-scope"><IconSparkles size={15} aria-hidden="true" /> Portal data only</span>
      </div>

      <section className="detail-card intelligence-query-card" aria-labelledby="intelligence-question-label">
        <form onSubmit={submit}>
          <label id="intelligence-question-label" htmlFor="intelligence-question">Question</label>
          <textarea
            id="intelligence-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="For example: Which clients use Product X?"
            maxLength={500}
            required
          />
          <div className="intelligence-query-footer">
            <small>Do not enter credentials, contact details, URLs, server information, or other private data.</small>
            <button className="primary-button" type="submit" disabled={loading || question.trim().length < 2}>
              {loading ? "Searching…" : "Ask portal"}
            </button>
          </div>
        </form>
      </section>

      <div className="intelligence-suggestions" aria-label="Suggested questions">
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => handleSuggestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <section className="detail-card intelligence-result" aria-live="polite"><p className="empty-text">Retrieving grounded portal facts…</p></section>}

      {result && !loading && (
        <section className="detail-card intelligence-result" aria-live="polite">
          <div className="card-header-row">
            <div>
              <p className="page-eyebrow">Grounded answer</p>
              <h2>Portal response</h2>
            </div>
            <span className={`small-badge intelligence-status intelligence-status-${result.providerStatus.toLowerCase()}`}>
              {result.providerStatus === "Generated" ? result.model : result.providerStatus.replace(/([A-Z])/g, " $1").trim()}
            </span>
          </div>
          <p className="intelligence-answer">{result.answer}</p>

          {result.sources.length > 0 && (
            <div className="intelligence-sources">
              <h3>Portal sources</h3>
              <div className="intelligence-source-list">
                {result.sources.map((source) => (
                  <Link to={source.path} key={`${source.entityType}-${source.entityId}`}>
                    <span><small>{source.entityType}</small><strong>{source.label}</strong></span>
                    <IconArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
