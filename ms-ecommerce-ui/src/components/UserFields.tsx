import { User } from "../api/types";
import { useState, memo } from "react";

type UserForm = Partial<User> & {
  password?: string;
};

type Props = {
  value: UserForm;
  onChange: (next: UserForm) => void;
};

type ValidationErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roles?: string;
};

export const UserFields = memo(function UserFields({ value, onChange }: Props) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: keyof ValidationErrors, val: any): string | undefined => {
    switch (field) {
      case "firstName":
        if (!val || val.trim().length < 2) return "Le prenom doit contenir au moins 2 caracteres";
        if (val.trim().length > 50) return "Le prenom ne peut pas depasser 50 caracteres";
        break;
      case "lastName":
        if (!val || val.trim().length < 2) return "Le nom doit contenir au moins 2 caracteres";
        if (val.trim().length > 50) return "Le nom ne peut pas depasser 50 caracteres";
        break;
      case "email":
        if (!val || !val.trim()) return "L'email est requis";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return "Format d'email invalide";
        if (val.length > 100) return "L'email ne peut pas depasser 100 caracteres";
        break;
      case "password":
        if (!val || !val.trim()) return "Le mot de passe est requis";
        if (val.length < 8) return "Le mot de passe doit contenir au moins 8 caracteres";
        if (val.length > 128) return "Le mot de passe ne peut pas depasser 128 caracteres";
        break;
      case "roles":
        if (val && val.length > 100) return "Les roles ne doivent pas depasser 100 caracteres";
        break;
    }
    return undefined;
  };

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validate(field, value[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof UserForm, val: any) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      const error = validate(field as keyof ValidationErrors, val);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-3">
      <label className="field">
        <span>Prénom <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.firstName && touched.firstName ? 'border-red-400 border' : ''}`}
          placeholder="Jean"
          value={value.firstName ?? ""}
          onChange={e => handleChange("firstName", e.target.value)}
          onBlur={() => handleBlur("firstName")}
          required
          minLength={2}
          maxLength={50}
        />
        {errors.firstName && touched.firstName && (
          <span className="text-xs text-red-400 mt-1">{errors.firstName}</span>
        )}
      </label>
      <label className="field">
        <span>Nom <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.lastName && touched.lastName ? 'border-red-400 border' : ''}`}
          placeholder="Dupont"
          value={value.lastName ?? ""}
          onChange={e => handleChange("lastName", e.target.value)}
          onBlur={() => handleBlur("lastName")}
          required
          minLength={2}
          maxLength={50}
        />
        {errors.lastName && touched.lastName && (
          <span className="text-xs text-red-400 mt-1">{errors.lastName}</span>
        )}
      </label>
      <label className="field md:col-span-3 md:col-span-1">
        <span>Email <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.email && touched.email ? 'border-red-400 border' : ''}`}
          type="email"
          placeholder="jean.dupont@example.com"
          value={value.email ?? ""}
          onChange={e => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          required
          maxLength={100}
        />
        {errors.email && touched.email && (
          <span className="text-xs text-red-400 mt-1">{errors.email}</span>
        )}
      </label>
      <label className="field md:col-span-3 md:col-span-1">
        <span>Mot de passe <span className="text-red-400">*</span></span>
        <input
          className={`card px-3 py-2 ${errors.password && touched.password ? 'border-red-400 border' : ''}`}
          type="password"
          placeholder="Au moins 8 caracteres"
          value={value.password ?? ""}
          onChange={e => handleChange("password", e.target.value)}
          onBlur={() => handleBlur("password")}
          required
          minLength={8}
          maxLength={128}
        />
        {errors.password && touched.password && (
          <span className="text-xs text-red-400 mt-1">{errors.password}</span>
        )}
      </label>
      <label className="field md:col-span-3 md:col-span-2">
        <span>Roles (optionnel)</span>
        <input
          className={`card px-3 py-2 ${errors.roles && touched.roles ? 'border-red-400 border' : ''}`}
          placeholder="ROLE_USER,ROLE_ADMIN"
          value={value.roles ?? ""}
          onChange={e => handleChange("roles", e.target.value)}
          onBlur={() => handleBlur("roles")}
          maxLength={100}
        />
        {errors.roles && touched.roles && (
          <span className="text-xs text-red-400 mt-1">{errors.roles}</span>
        )}
      </label>
      <label className="field md:col-span-3 md:col-span-1">
        <span>Téléphone</span>
        <input
          className="card px-3 py-2"
          type="tel"
          placeholder="+33 6 00 00 00 00"
          value={value.phoneNumber ?? ""}
          onChange={e => handleChange("phoneNumber", e.target.value)}
        />
      </label>
    </div>
  );
});
