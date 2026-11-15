import Icon from "./Icon";
import "./StatCard.css";

function StatCard({ icon, tone, value, label }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon metric-icon-${tone}`}>
        <Icon name={icon} />
      </span>
      <span className="metric-copy">
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </article>
  );
}

export default StatCard;