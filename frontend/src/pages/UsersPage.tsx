import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Management" },
  { id: 3, name: "ProductOwner" },
  { id: 4, name: "Developer" },
  { id: 5, name: "QA" },
  { id: 6, name: "Implementation" },
  { id: 7, name: "Support" },
  { id: 8, name: "Viewer" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", roleId: 8 });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/users");

      setUsers(data);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleStatus(user: User) {
    try {
      setError("");

      await apiFetch(
        `/users/${user.id}/status/${!user.isActive}`,
        {
          method: "PUT",
        }
      );

      await loadUsers();
    } catch {
      setError("Could not update user status.");
    }
  }

  async function changeRole(
    userId: number,
    roleId: number
  ) {
    try {
      setError("");

      await apiFetch(
        `/users/${userId}/role/${roleId}`,
        {
          method: "PUT",
        }
      );

      await loadUsers();
    } catch {
      setError("Could not update user role.");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setCreating(true);
      setError("");
      await apiFetch("/users", { method: "POST", body: JSON.stringify(newUser) });
      setNewUser({ username: "", email: "", password: "", roleId: 8 });
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create user.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Administration
          </p>

          <h1>Users</h1>

          <p className="page-subtitle">
            Manage portal users, roles, and account access.
          </p>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <section className="detail-card user-create-card">
        <div className="card-header-row">
          <div><h2>Add user</h2><p className="section-description">Accounts require a unique username, an email address, and a role.</p></div>
        </div>
        <form className="user-create-form" onSubmit={createUser}>
          <div className="form-group"><label htmlFor="user-username">Username</label><input id="user-username" value={newUser.username} minLength={1} maxLength={50} required onChange={(event) => setNewUser({ ...newUser, username: event.target.value })} /></div>
          <div className="form-group"><label htmlFor="user-email">Email</label><input id="user-email" type="email" value={newUser.email} maxLength={255} required onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></div>
          <div className="form-group"><label htmlFor="user-password">Temporary password</label><input id="user-password" type="password" value={newUser.password} minLength={8} required onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} /></div>
          <div className="form-group"><label htmlFor="user-role">Role</label><select id="user-role" value={newUser.roleId} onChange={(event) => setNewUser({ ...newUser, roleId: Number(event.target.value) })}>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div>
          <button className="primary-button" disabled={creating}>{creating ? "Creating..." : "Create user"}</button>
        </form>
      </section>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Account</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>
                    {user.username}
                  </strong>
                </td>

                <td>
                  {user.email}
                </td>

                <td>
                  <select
                    value={user.roleId}
                    onChange={(event) =>
                      changeRole(
                        user.id,
                        Number(event.target.value)
                      )
                    }
                  >
                    {roles.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <span className="small-badge">
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                <td>
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  <button
                    onClick={() =>
                      toggleStatus(user)
                    }
                  >
                    {user.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
