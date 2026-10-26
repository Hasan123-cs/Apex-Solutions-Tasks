
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import "../styles/Login.css";
import { getHomeRoute } from "../utils/auth";
export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", form);

            const { token, role } = response.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("role", role);
            console.log("Login role:", role);
            console.log("Home route:", getHomeRoute(role));
            // Temporary route until role-based routing is implemented
            const homeRoute = getHomeRoute(response.data.role);
            navigate(homeRoute, { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className="login-form">
                <h2>Welcome Back</h2>

                <p className="form-subtitle">
                    Sign in to manage your appointments.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="login-password">Password</label>

                        <div className="login-password-wrapper">
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="form-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="auth-footer">
                        Don't have an account?{" "}
                        <Link to="/register">Create account</Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
}
