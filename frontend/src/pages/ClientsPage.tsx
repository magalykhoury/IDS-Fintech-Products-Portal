import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { canWritePortalData } from "../services/permissions";
import type { Client } from "../types/client";

interface ClientDeployment {
  clientId: number;
  productId: number;
  productName: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [deployments, setDeployments] = useState<ClientDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [data, deploymentData] = await Promise.all([
        apiFetch("/clients"),
        apiFetch("/deployments"),
      ]);

      setClients(data);
      setDeployments(deploymentData);
    } catch {
      setError("Could not load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadClients);
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        client.companyName
          .toLowerCase()
          .includes(searchValue) ||
        client.country
          ?.toLowerCase()
          .includes(searchValue) ||
        client.contactName
          ?.toLowerCase()
          .includes(searchValue) ||
        client.contactEmail
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        client.status === statusFilter;

      const matchesProduct =
        productFilter === "All" ||
        deployments.some(
          (deployment) =>
            deployment.clientId === client.id &&
            deployment.productId === Number(productFilter)
        );

      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [clients, deployments, search, statusFilter, productFilter]);

  const productOptions = useMemo(() => {
    const options = new Map<number, string>();
    deployments.forEach((deployment) => options.set(deployment.productId, deployment.productName));
    return Array.from(options, ([id, name]) => ({ id, name }));
  }, [deployments]);

  if (loading) {
    return <p>Loading clients...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Clients
          </p>

          <h1>Clients</h1>

          <p className="page-subtitle">
            Search client organizations and review their portal records.
          </p>
        </div>

        {canWritePortalData() && (
          <Link to="/clients/new" className="primary-button">
            Create Client
          </Link>
        )}
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

        <select
          value={productFilter}
          onChange={(event) => setProductFilter(event.target.value)}
        >
          <option value="All">All products</option>
          {productOptions.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {filteredClients.length === 0 ? (
        <div className="detail-card">
          <p className="empty-text">
            No clients match your search or filters.
          </p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Country</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td>
                  <Link
                    to={`/clients/${client.id}`}
                    className="table-link"
                  >
                    {client.companyName}
                  </Link>
                </td>

                <td>
                  {client.country ?? "-"}
                </td>

                <td>
                  {client.contactName ?? "-"}
                </td>

                <td>
                  {client.contactEmail ?? "-"}
                </td>

                <td>
                  {client.contactPhone ?? "-"}
                </td>

                <td>
                  <span className="small-badge">
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
