import "./ActivityChart.css";

function ActivityChart() {
  return (
    <section className="admin-panel activity-chart" aria-labelledby="activity-chart-title">
      <div className="admin-panel-heading">
        <div>
          <h2 id="activity-chart-title">Learning Activity</h2>
          <p>Platform activity over time</p>
        </div>
      </div>
      <div className="activity-chart-plot" role="img" aria-label="No learning activity data available">
        <div className="activity-chart-grid" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <p>No activity data available yet.</p>
      </div>
      <div className="activity-chart-legend">
        <span className="activity-legend-dot" /> Learning activity
      </div>
    </section>
  );
}

export default ActivityChart;