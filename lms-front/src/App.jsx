import { useState } from "react";
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

	return (
		<Dashboard
			user={session.user}
			onLogout={() => setSession(null)}
		/>
	);
}

export default App;