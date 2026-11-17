import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login/Login";

function App() {
	const [session, setSession] = useState(null);

	function handleLogin(result) {
		setSession({ token: result.token, user: result.user });
	}

	if (!session) {
		return <Login onLogin={handleLogin} />;
	}

	const DashboardPage = session.user.role === "admin" ? AdminDashboard : Dashboard;

	return (
		<DashboardPage
			user={session.user}
			token={session.token}
			onLogout={() => setSession(null)}
		/>
	);
}

export default App;