import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconArrowUpRight, IconChartBar } from "@tabler/icons-react";
import { apiFetch } from "../services/api";
import type { Client } from "../types/client";
import type { Deployment } from "../types/deployment";
import type { Product } from "../types/product";

type Count = { label: string; value: number };

function countBy<T>(items: T[], pick: (item: T) => string | null | undefined): Count[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const label = pick(item) || "Not specified";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function Distribution({ title, subtitle, data, tone = "blue" }: { title: string; subtitle: string; data: Count[]; tone?: "blue" | "dark" | "amber" }) {
  const maximum = Math.max(...data.map((item) => item.value), 1);
  return <section className="detail-card chart-panel"><div className="card-header-row"><div><h2>{title}</h2><p className="section-description">{subtitle}</p></div><IconChartBar size={19} stroke={1.8} aria-hidden="true" /></div>{data.length === 0 ? <p className="empty-text">No records available yet.</p> : <div className="bar-chart">{data.map((item) => <div className="bar-row" key={item.label}><div className="bar-label"><span>{item.label}</span><strong>{item.value}</strong></div><div className="bar-track"><span className={`bar-fill ${tone}`} style={{ width: `${(item.value / maximum) * 100}%` }} /></div></div>)}</div>}</section>;
}

export default function DashboardPage() {
  const username = localStorage.getItem("username");
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [productsData, clientsData, deploymentsData, teamMembersData] = await Promise.all([apiFetch("/products"), apiFetch("/clients"), apiFetch("/deployments"), apiFetch("/teammembers")]);
      setProducts(productsData); setClients(clientsData); setDeployments(deploymentsData); setTeamCount(teamMembersData.length);
    } catch { setError("Could not load dashboard data."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(loadDashboard); }, [loadDashboard]);

  const lifecycle = useMemo(() => countBy(products, (product) => product.lifecycleStatus), [products]);
  const criticality = useMemo(() => countBy(products, (product) => product.criticality), [products]);
  const deploymentStatus = useMemo(() => countBy(deployments, (deployment) => deployment.status), [deployments]);
  const recentProducts = useMemo(() => [...products].sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()).slice(0, 5), [products]);
  const highlightedProducts = useMemo(() => products.filter((product) => product.criticality === "Critical" || product.criticality === "High"), [products]);
  const activeProducts = products.filter((product) => product.lifecycleStatus === "Active").length;

  if (loading) return <p className="empty-text">Loading dashboard...</p>;
  return <div className="dashboard-page">
    <div className="page-header"><div><p className="page-eyebrow">Operations overview</p><h1>Dashboard</h1><p className="page-subtitle">A current view of the IDS Fintech product portfolio, client estate, and deployment footprint.</p></div><span className="dashboard-date">Signed in as {username}</span></div>
    {error && <p className="form-error">{error}</p>}
    <div className="dashboard-grid">
      <div className="dashboard-card"><span className="dashboard-label">Total products</span><strong className="dashboard-value">{products.length}</strong><span className="metric-note">Portfolio records</span></div>
      <div className="dashboard-card"><span className="dashboard-label">Active products</span><strong className="dashboard-value">{activeProducts}</strong><span className="metric-note">In active lifecycle</span></div>
      <div className="dashboard-card"><span className="dashboard-label">Clients</span><strong className="dashboard-value">{clients.length}</strong><span className="metric-note">Organizations tracked</span></div>
      <div className="dashboard-card"><span className="dashboard-label">Deployments</span><strong className="dashboard-value">{deployments.length}</strong><span className="metric-note">Client product instances</span></div>
      <div className="dashboard-card"><span className="dashboard-label">Team members</span><strong className="dashboard-value">{teamCount}</strong><span className="metric-note">Assigned personnel</span></div>
    </div>
    <div className="analytics-grid"><Distribution title="Product lifecycle" subtitle="Products grouped by current lifecycle status." data={lifecycle} /><Distribution title="Deployment estate" subtitle="Deployments grouped by operational status." data={deploymentStatus} tone="dark" /><Distribution title="Portfolio criticality" subtitle="Risk classification across product records." data={criticality} tone="amber" /></div>
    <div className="dashboard-split">
      <section className="detail-card"><div className="card-header-row"><div><h2>Recent products</h2><p className="section-description">Newest changes across the product portfolio.</p></div><Link to="/products" className="section-link">View products <IconArrowUpRight size={15} /></Link></div>{recentProducts.length === 0 ? <p className="empty-text">No products available.</p> : <div className="detail-list">{recentProducts.map((product) => <div className="detail-list-item" key={product.id}><div><Link to={`/products/${product.id}`} className="detail-link">{product.name}</Link><p>Version {product.currentVersion ?? "Not recorded"}</p></div><span className="small-badge">{product.lifecycleStatus}</span></div>)}</div>}</section>
      <section className="detail-card priority-panel"><div className="card-header-row"><div><h2>Priority attention</h2><p className="section-description">High and critical products requiring closer oversight.</p></div><IconAlertTriangle size={19} stroke={1.8} aria-hidden="true" /></div>{highlightedProducts.length === 0 ? <p className="empty-text">No high or critical products are currently recorded.</p> : <div className="detail-list">{highlightedProducts.slice(0, 5).map((product) => <div className="detail-list-item" key={product.id}><Link to={`/products/${product.id}`} className="detail-link">{product.name}</Link><span className="priority-badge">{product.criticality}</span></div>)}</div>}</section>
    </div>
    <section className="dashboard-section"><div className="dashboard-section-header"><div><h2>Workspace access</h2><p>Move directly into the main portfolio management areas.</p></div></div><div className="quick-access-grid">{[["Products","Product records, modules, and technology.","/products"],["Clients","Organizations and contacts.","/clients"],["Deployments","Versions and support posture.","/deployments"],["Team","Responsibilities and coverage.","/team"]].map(([title,description,path]) => <Link key={path} to={path} className="quick-access-card"><strong>{title}</strong><span>{description}</span><IconArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></section>
  </div>;
}
