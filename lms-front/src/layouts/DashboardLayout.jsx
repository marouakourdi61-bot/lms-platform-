import "./DashboardLayout.css";

function DashboardLayout({ sidebar, header, children }) {
  return (
    <div className="dashboard-layout">
      {sidebar}
      <div className="dashboard-main">
        {header}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;