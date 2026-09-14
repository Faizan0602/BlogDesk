import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import heroImage from "../assets/hero.png";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const successMessage = location.state?.message;
  const [showSuccessMessage, setShowSuccessMessage] = useState(Boolean(successMessage));

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError("");

      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setShowSuccessMessage(false);
      setError(getErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your blog workspace.</h1>
        <p className="muted">Use the username and password you registered with.</p>

        {showSuccessMessage && <p className="alert alert-success">{successMessage}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="faizan"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              {...register("username", {
                required: "Username is required.",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters.",
                },
              })}
            />
            {errors.username && <p className="field-error">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required.",
              })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button className="button button-primary button-wide" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>

      <div className="auth-art" aria-hidden="true">
        <img src={heroImage} alt="" />
        <div>
          <span>Secure session</span>
          <strong>JWT backed by real users</strong>
        </div>
      </div>
    </section>
  );
}

export default Login;
