import "./Logo.css";

function Logo() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M3.5 6.5c2.8-.8 5.5-.2 8.5 1.7v11c-3-1.9-5.7-2.5-8.5-1.7v-11Zm17 0c-2.8-.8-5.5-.2-8.5 1.7v11c3-1.9 5.7-2.5 8.5-1.7v-11Z" />
          <path d="M12 8.2v11" />
        </svg>
      </span>
      <span className="brand-name">LMS Platform</span>
    </div>
  );
}

export default Logo;