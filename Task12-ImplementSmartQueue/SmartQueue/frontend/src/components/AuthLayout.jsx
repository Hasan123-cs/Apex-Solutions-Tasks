import { Link } from "react-router-dom";
import "../styles/AuthLayout.css";
export default function AuthLayout({ children }) {
    return (
        <div className="auth-page">
            <div className="auth-shell">

                <aside className="auth-sidebar">
                    <div className="brand">
                        <div className="brand-icon">≡</div>
                        <span>TeamFlow</span>
                    </div>

                    <div className="sidebar-content">
                        <h1>
                            Book appointments online and see your place
                            in the queue.
                        </h1>

                        <ul className="feature-list">
                            <li>
                                <span>▣</span>
                                Pick a service, a practitioner and a free time
                            </li>
                            <li>
                                <span>✉</span>
                                Get your booking reference by email
                            </li>
                            <li>
                                <span>☷</span>
                                Check in at reception and follow the live queue
                            </li>
                        </ul>
                    </div>

                    <div className="queue-preview">
                        <div>
                            <small>Now serving</small>
                            <strong>A-019</strong>
                        </div>
                        <div>
                            <small>Your number</small>
                            <strong className="accent">A-025</strong>
                        </div>
                        <div>
                            <small>Ahead of you</small>
                            <strong>4</strong>
                        </div>
                    </div>
                </aside>

                <section className="auth-main">
                    <div className="auth-top-link">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </div>

                    <div className="auth-form-area">
                        {children}
                    </div>
                </section>

            </div>
        </div>
    );
}
