import { User } from "../api/types";
import { Badge } from "./Badge";

type Props = {
  user: User;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
};

export function UserCard({ user: u, onView, onDelete, onToggleActive }: Props) {
  return (
    <div className="card p-3">
      <div className="font-semibold">{u.firstName ? `${u.firstName} ${u.lastName ?? ""}` : u.id}</div>
      <div className="text-sm text-slate-400">{u.email}</div>
      <div className="text-sm text-slate-400">{u.phoneNumber}</div>
      <div className="mt-1">{u.active === false ? <Badge color="red">Inactif</Badge> : <Badge>Actif</Badge>}</div>
      <div className="flex gap-2 mt-2">
        <button className="btn-ghost subtle" onClick={() => onView(u.id)}>Détails</button>
        <button className="btn-ghost subtle" onClick={() => onDelete(u.id)}>Supprimer</button>
        <button className="btn-ghost subtle" onClick={() => onToggleActive(u.id, u.active !== false)}>
          {u.active === false ? "Activer" : "Désactiver"}
        </button>
      </div>
    </div>
  );
}
