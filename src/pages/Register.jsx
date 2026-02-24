import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = register(formData);
    if (!result.success) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/login");
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create EMS account</h2>
        <p>Register as a role user for election monitoring workflows.</p>

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="name@email.com"
          required
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Create password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
        >
          <option value="citizen">Citizen</option>
          <option value="observer">Election Observer</option>
          <option value="analyst">Data Analyst</option>
          <option value="admin">Admin</option>
        </select>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit">
          Register
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;