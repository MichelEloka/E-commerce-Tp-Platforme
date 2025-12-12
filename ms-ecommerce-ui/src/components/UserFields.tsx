import { User } from "../api/types";

type Props = {
  value: Partial<User>;
  onChange: (next: Partial<User>) => void;
};

export function UserFields({ value, onChange }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <label className="field">
        <span>Prénom</span>
        <input
          className="card px-3 py-2"
          placeholder="Jean"
          value={value.firstName ?? ""}
          onChange={e => onChange({ ...value, firstName: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Nom</span>
        <input
          className="card px-3 py-2"
          placeholder="Dupont"
          value={value.lastName ?? ""}
          onChange={e => onChange({ ...value, lastName: e.target.value })}
        />
      </label>
      <label className="field md:col-span-3 md:col-span-1">
        <span>Email</span>
        <input
          className="card px-3 py-2"
          placeholder="jean.dupont@example.com"
          value={value.email ?? ""}
          onChange={e => onChange({ ...value, email: e.target.value })}
        />
      </label>
      <label className="field md:col-span-3 md:col-span-1">
        <span>Téléphone</span>
        <input
          className="card px-3 py-2"
          placeholder="+33 6 00 00 00 00"
          value={value.phoneNumber ?? ""}
          onChange={e => onChange({ ...value, phoneNumber: e.target.value })}
        />
      </label>
    </div>
  );
}
