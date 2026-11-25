import { useState } from "react";
import "./LoginForm.css";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onLogin({ email, password });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Erreur de connexion."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <span className="auth-eyebrow">WELCOME BACK</span>
        <h2>Sign in to LMS</h2>
        <p>Continue your learning journey today.</p>
      </div>

      <form className="signin-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <div className="input-wrapper">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@work-email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <div className="password-label-row">
            <label htmlFor="password">Password</label>
            <span className="forgot-password">Forgot password?</span>
          </div>

          <div className="input-wrapper">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="submit-wrapper">
          <button
            className="signin-button"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Connexion..." : "Sign in"}</span>
          </button>
        </div>
      </form>

      <div className="demo-divider">
        <span>or explore a demo</span>
      </div>

      <div className="demo-buttons">
        <div className="demo-button">Admin workspace</div>
        <div className="demo-button">Learner workspace</div>
      </div>

      <p className="terms-text">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}

export default LoginForm;
