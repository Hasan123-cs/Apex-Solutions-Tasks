
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import "../styles/Register.css";
import { getHomeRoute } from "../utils/auth";
export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        phoneNumber: "",
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
            const response = await api.post("/api/auth/register", form);

            const { token, role } = response.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("role", role);

            navigate(getHomeRoute(role), { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className="register-form">
                <h2>Create your account</h2>
                <p className="form-subtitle">
                    Book, reschedule and cancel your own appointments.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                placeholder="Maya Haddad"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="phoneNumber">Phone</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                placeholder="+961 71 234 567"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="maya.haddad@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <small className="password-hint">
                                ✓ At least 8 characters
                            </small>
                        </div>
                    </div>

                    {error && (
                        <div className="form-error" role="alert">
                            {error}
                            {error.toLowerCase().includes("email") && (
                                <>
                                    {" "}
                                    <Link to="/login">Sign in instead</Link>
                                </>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                    <div className="auth-notice">
                        <span>ⓘ</span>
                        Staff and admin accounts are created by the
                        clinic administrator.
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
