
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
    const { user, token, loading, handleLogin, logout } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    const DashboardPage =
        user.role === "admin" ? AdminDashboard : Dashboard;

    return (
        <DashboardPage
            user={user}
            token={token}
            onLogout={logout}
        />
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
