
import "./LoginForm.css";

function LoginForm() {
  function handleSubmit(event) {
    event.preventDefault();
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
              required
            />

            <span className="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
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
              placeholder="•••••••••"
              autoComplete="current-password"
              required
            />

            <span className="input-icon eye-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="submit-wrapper">
          <button className="signin-button" type="submit">
            <span>Sign in</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
