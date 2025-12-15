import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { User } from "../api/types";
import { Panel } from "../components/Panel";
import { UserFields } from "../components/UserFields";
import { UserCard } from "../components/UserCard";
import { Badge } from "../components/Badge";
import { api } from "../api/client";

// ===== UsersPage (Liste) =====
type UsersPageProps = {
  userSearch: string;
  setUserSearch: (value: string) => void;
  userActiveOnly: boolean;
  setUserActiveOnly: (value: boolean) => void;
  userIdLookup: string;
  setUserIdLookup: (value: string) => void;
  users: User[];
  onSearchUsers: () => void;
  onLoadUsersActive: () => void;
  onLoadUsers: () => void;
  onDeleteUser: (id: number) => void;
  onDeactivateUser: (id: number) => void;
};

export function UsersPage({
  userSearch,
  setUserSearch,
  userActiveOnly,
  setUserActiveOnly,
  userIdLookup,
  setUserIdLookup,
  users,
  onSearchUsers,
  onLoadUsersActive,
  onLoadUsers,
  onDeleteUser,
  onDeactivateUser
}: UsersPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchParam = searchParams.get("search");
    const activeParam = searchParams.get("active");
    if (searchParam !== null) setUserSearch(searchParam);
    if (activeParam !== null) setUserActiveOnly(activeParam === "true");
  }, []);

  useEffect(() => {
    const hasFilters = userSearch || userActiveOnly;

    if (hasFilters) {
      if (userSearch) {
        onSearchUsers();
      } else if (userActiveOnly) {
        onLoadUsersActive();
      }
    }
  }, [userSearch, userActiveOnly, onSearchUsers, onLoadUsersActive]);

  return (
    <div className="space-y-4">
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <input
          className="card px-3 py-2"
          placeholder="Rechercher par nom"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            className="card px-3 py-2 w-32"
            placeholder="ID utilisateur"
            value={userIdLookup}
            onChange={e => setUserIdLookup(e.target.value)}
          />
          <button className="btn-ghost subtle" onClick={() => userIdLookup && navigate(`/users/${userIdLookup}`)}>
            Charger ID
          </button>
        </div>
        <label className="field flex-row items-center gap-2">
          <input
            type="checkbox"
            checked={userActiveOnly}
            onChange={e => setUserActiveOnly(e.target.checked)}
          />
          <span>Actifs seulement</span>
        </label>
        <button className="btn-ghost subtle" onClick={() => { setUserSearch(""); setUserActiveOnly(false); onLoadUsers(); }}>
          Réinitialiser
        </button>
      </div>

      <Panel title="Utilisateurs">
        <div className="grid gap-3">
          {users.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onView={(id) => navigate(`/users/${id}`)}
              onDelete={onDeleteUser}
              onToggleActive={(id, active) => {
                if (active) {
                  onDeactivateUser(id);
                }
              }}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ===== NewUserPage =====
type NewUserPageProps = {
  newUser: Partial<User>;
  setNewUser: (value: Partial<User>) => void;
  loading: boolean;
  onCreateUser: () => void;
};

export function NewUserPage({ newUser, setNewUser, loading, onCreateUser }: NewUserPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Panel title="Nouvel utilisateur">
        <UserFields value={newUser} onChange={setNewUser} />
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-ghost" onClick={() => navigate("/users")}>
            Annuler
          </button>
          <button className="btn-primary" onClick={onCreateUser} disabled={loading}>
            Créer l'utilisateur
          </button>
        </div>
      </Panel>
    </div>
  );
}

// ===== UserDetailPage =====
type UserDetailPageProps = {
  onDeactivateUser: (id: number) => void;
  onDeleteUser: (id: number) => void;
};

export function UserDetailPage({ onDeactivateUser, onDeleteUser }: UserDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      api.users.get(Number(id))
        .then(data => setUser(data as User))
        .catch(e => {
          toast.error((e as Error).message);
          navigate("/users");
        });
    }
  }, [id, navigate]);

  if (!user) return <div className="text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <Panel
        title={user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : `Utilisateur #${user.id}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-ghost subtle" onClick={() => navigate(`/users/${id}/edit`)}>
              Modifier
            </button>
            <button className="btn-ghost subtle" onClick={() => navigate("/users")}>
              Retour
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="text-base font-semibold">{user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : `ID ${user.id}`}</div>
          <div className="text-muted">{user.email}</div>
          {user.phoneNumber && <div className="text-muted">{user.phoneNumber}</div>}
          {user.active === false && <Badge color="red">Inactif</Badge>}
        </div>
        <div className="flex gap-2 mt-3">
          <button className="btn-ghost subtle" onClick={() => onDeactivateUser(user.id)}>Désactiver</button>
          <button className="btn-ghost subtle" onClick={() => onDeleteUser(user.id)}>Supprimer</button>
        </div>
      </Panel>
    </div>
  );
}

// ===== UserEditPage =====
type UserEditPageProps = {
  loading: boolean;
  onSaveUserEdit: (id: number, user: Partial<User>) => void;
};

export function UserEditPage({ loading, onSaveUserEdit }: UserEditPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    if (id) {
      api.users.get(Number(id))
        .then(data => setEditUser(data as User))
        .catch(e => {
          toast.error((e as Error).message);
          navigate("/users");
        });
    }
  }, [id, navigate]);

  if (!editUser) return <div className="text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <Panel title="Modifier l'utilisateur">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="field">
            <span>Prénom</span>
            <input
              className="card px-3 py-2"
              value={editUser.firstName ?? ""}
              onChange={e => setEditUser(u => ({ ...u, firstName: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Nom</span>
            <input
              className="card px-3 py-2"
              value={editUser.lastName ?? ""}
              onChange={e => setEditUser(u => ({ ...u, lastName: e.target.value }))}
            />
          </label>
          <label className="field md:col-span-3 md:col-span-1">
            <span>Email</span>
            <input
              className="card px-3 py-2"
              value={editUser.email ?? ""}
              onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))}
            />
          </label>
          <label className="field md:col-span-3 md:col-span-1">
            <span>Téléphone</span>
            <input
              className="card px-3 py-2"
              value={editUser.phoneNumber ?? ""}
              onChange={e => setEditUser(u => ({ ...u, phoneNumber: e.target.value }))}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-ghost subtle" onClick={() => navigate(`/users/${id}`)}>Annuler</button>
          <button className="btn-primary" onClick={() => onSaveUserEdit(Number(id), editUser)} disabled={loading}>Sauvegarder</button>
        </div>
      </Panel>
    </div>
  );
}
