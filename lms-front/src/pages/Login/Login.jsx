
import LoginForm from "./LoginForm";
import "./Login.css";

function Login() {
  return (
    <div className="login-page">
      {/* Left Hero Panel */}
      <section className="hero-panel">
        <div className="curved-line circle-one" aria-hidden="true"></div>
        <div className="curved-line circle-two" aria-hidden="true"></div>
        <div className="curved-line circle-three" aria-hidden="true"></div>

        <div className="hero-brand">
          
          <span className="brand-name">LMS Platform</span>
        </div>

        <div className="hero-content">
          <p className="hero-tagline">LEARN WITHOUT LIMITS</p>

          <h1>
            <span>Grow your skills.</span>
            <span className="gradient-text">Shape your future.</span>
          </h1>

          <p className="hero-description">
            One beautiful space for meaningful learning,
            measurable progress, and teams that thrive.
          </p>
        </div>

        <div className="hero-social-proof">
         

          
        </div>
      </section>

      {/* Right Auth Panel */}
      <main className="auth-panel">
        <LoginForm />
      </main>

     
    </div>
  );
}

export default Login;
