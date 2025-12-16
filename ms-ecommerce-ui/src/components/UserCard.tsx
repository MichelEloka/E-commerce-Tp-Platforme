import { memo } from "react";
import { Mail, Phone, Eye, Trash2, UserCheck, UserX } from "lucide-react";
import { User } from "../api/types";
import { Badge } from "./Badge";

type Props = {
  user: User;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, active: boolean) => void;
};

export const UserCard = memo(function UserCard({ user: u, onView, onDelete, onToggleActive }: Props) {
  const isActive = u.active !== false;
  const fullName = u.firstName ? `${u.firstName} ${u.lastName ?? ""}`.trim() : `Utilisateur #${u.id}`;

  return (
    <div className="card p-4 hover:shadow-lg transition-all cursor-pointer group" onClick={() => onView(u.id)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-50">{fullName}</h3>
            <Badge color={isActive ? "green" : "red"}>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            {u.email && (
              <div className="flex items-center gap-2 text-muted">
                <Mail size={16} className="flex-shrink-0" />
                <span className="truncate">{u.email}</span>
              </div>
            )}
            {u.phoneNumber && (
              <div className="flex items-center gap-2 text-muted">
                <Phone size={16} className="flex-shrink-0" />
                <span>{u.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            className="btn-ghost subtle flex items-center gap-2"
            onClick={(e) => { e.stopPropagation(); onView(u.id); }}
          >
            <Eye size={16} />
            <span>Voir</span>
          </button>
          <button
            className={`btn-ghost subtle flex items-center gap-2 ${isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
            onClick={(e) => { e.stopPropagation(); onToggleActive(u.id, isActive); }}
          >
            {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
            <span>{isActive ? "Désactiver" : "Activer"}</span>
          </button>
          <button
            className="btn-ghost subtle flex items-center gap-2 text-red-400 hover:bg-red-500/10"
            onClick={(e) => { e.stopPropagation(); onDelete(u.id); }}
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
});
