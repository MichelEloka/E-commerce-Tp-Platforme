import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Package, ShoppingBag, Users, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../api/client";

type AuthPageProps = {
  mode: "login" | "register";
  onAuthenticated: (token: string) => void;
};

export function AuthPage({ mode, onAuthenticated }: AuthPageProps) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await api.auth.login(loginForm);
      onAuthenticated(response.token);
      toast.success("Connexion reussie");
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setLoading(true);
      await api.auth.register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password
      });
      const response = await api.auth.login({
        email: registerForm.email,
        password: registerForm.password
      });
      onAuthenticated(response.token);
      toast.success("Compte cree et connecte");
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-hero">
        <span className="auth-kicker">Espace boutique</span>
        <h1 className="auth-title">Piloter la boutique au quotidien</h1>
        <p className="auth-subtitle">
          Centralisez le catalogue, suivez les commandes et gardez une vue claire sur vos clients.
        </p>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Package size={18} />
            </div>
            <div>
              <h3>Catalogue produits</h3>
              <p>Ajoutez, mettez a jour et structurez l'offre en quelques clics.</p>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3>Commandes en cours</h3>
              <p>Suivez les statuts, preparez les expeditions et restez serein.</p>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">
              <Users size={18} />
            </div>
            <div>
              <h3>Relation client</h3>
              <p>Accedez aux informations utiles pour mieux accompagner vos clients.</p>
            </div>
          </div>
        </div>
        <div className="auth-badges">
          <span>Catalogue</span>
          <span>Commandes</span>
          <span>Clients</span>
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-tabs">
          <NavLink to="/login" className={({ isActive }) => `auth-tab ${isActive ? "active" : ""}`}>
            Connexion
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `auth-tab ${isActive ? "active" : ""}`}>
            Creer un compte
          </NavLink>
        </div>

        <div className="auth-panel" key={mode}>
          {isLogin ? (
            <form className="auth-fields" onSubmit={handleLogin}>
              <label className="field">
                <span>Email</span>
                <input
                  className="card px-3 py-2"
                  type="email"
                  placeholder="admin@exemple.com"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={event => setLoginForm(prev => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Mot de passe</span>
                <input
                  className="card px-3 py-2"
                  type="password"
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={event => setLoginForm(prev => ({ ...prev, password: event.target.value }))}
                  required
                />
              </label>
              <button className="btn-primary w-full auth-submit" type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <div className="auth-switch">
                <span>Pas encore de compte ?</span>
                <NavLink to="/register">Creer un compte</NavLink>
              </div>
            </form>
          ) : (
            <form className="auth-fields" onSubmit={handleRegister}>
              <div className="auth-grid">
                <label className="field">
                  <span>Prenom</span>
                  <input
                    className="card px-3 py-2"
                    placeholder="Jeanne"
                    autoComplete="given-name"
                    value={registerForm.firstName}
                    onChange={event => setRegisterForm(prev => ({ ...prev, firstName: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span>Nom</span>
                  <input
                    className="card px-3 py-2"
                    placeholder="Durand"
                    autoComplete="family-name"
                    value={registerForm.lastName}
                    onChange={event => setRegisterForm(prev => ({ ...prev, lastName: event.target.value }))}
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span>Email</span>
                <input
                  className="card px-3 py-2"
                  type="email"
                  placeholder="jeanne.durand@exemple.com"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={event => setRegisterForm(prev => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <div className="auth-grid">
                <label className="field">
                  <span>Mot de passe</span>
                  <input
                    className="card px-3 py-2"
                    type="password"
                    placeholder="8 caracteres minimum"
                    autoComplete="new-password"
                    minLength={8}
                    value={registerForm.password}
                    onChange={event => setRegisterForm(prev => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span>Confirmer</span>
                  <input
                    className="card px-3 py-2"
                    type="password"
                    placeholder="Repeter le mot de passe"
                    autoComplete="new-password"
                    minLength={8}
                    value={registerForm.confirmPassword}
                    onChange={event => setRegisterForm(prev => ({ ...prev, confirmPassword: event.target.value }))}
                    required
                  />
                </label>
              </div>
              <button className="btn-primary w-full auth-submit" type="submit" disabled={loading}>
                {loading ? "Creation..." : "Creer mon compte"}
              </button>
              <div className="auth-switch">
                <span>Deja un compte ?</span>
                <NavLink to="/login">Se connecter</NavLink>
              </div>
            </form>
          )}
        </div>

        <div className="auth-footer">
          <Sparkles size={16} />
          <span>Acces reserve a l'equipe de gestion de la boutique</span>
        </div>
      </div>
    </section>
  );
}
