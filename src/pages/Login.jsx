import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const result = login(form.email, form.password);
    if (result.success) {
      navigate(`/${result.user.role}`);
      return;
    }

    setError(result.message);
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Sign in to EMS</h2>
        <p>Use your registered email and password to access your role dashboard.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit">
          Login
        </button>

        <p className="muted">
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;