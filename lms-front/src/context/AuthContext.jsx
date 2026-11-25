import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, getCurrentUserApi } from "../services/authApi";
const AuthContext = createContext(null);


function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function restoreSession() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const result = await getCurrentUserApi(token);

                const currentUser = result.data.user || result.data;

                setUser(currentUser);
            } catch (error) {
                console.error("Session restoration error:", error);

                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, []);


    const handleLogin = async (data) => {

        try {

            setLoading(true);
            setError(null);

            const login = await loginApi(data);
            setUser(login.data.user);
            setToken(login.data.token);

            localStorage.setItem("token", login.data.token);


        } catch (error) {
            setError(error.response?.data?.message || error.message);
            throw error;
        } finally {
            setLoading(false);
        }

    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        setError(null);
    }

    return <AuthContext.Provider value={{ user, token, loading, error, handleLogin, logout }}>{children}</AuthContext.Provider>
}
const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }