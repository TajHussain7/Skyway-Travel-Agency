import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Redirect based on user role
        if (response.data.data?.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    }
  };

  return (
    <>
      <Header />
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-6">
              <div className="card">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h1 className="card-title">
                      <i
                        className="fas fa-plane-departure me-2"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                      Welcome Back
                    </h1>
                    <p className="card-text">
                      Sign in to your SkyWay Travel account
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {errors.general && (
                      <div className="alert alert-danger">{errors.general}</div>
                    )}
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-envelope me-2"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <span className="text-danger">{errors.email}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Enter your password"
                          style={{ paddingRight: "40px" }}
                        />
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "12px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                            fontSize: "16px",
                            pointerEvents: "auto",
                          }}
                        ></i>
                      </div>
                      {errors.password && (
                        <span className="text-danger">{errors.password}</span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label m-2 text-primary cursor-pointer checked:marker:"
                          htmlFor="rememberMe"
                        >
                          Remember me
                        </label>
                      </div>
                      <a
                        href="#"
                        className="text-decoration-none text-primary hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-3"
                      disabled={loading}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="text-center">
                      <p className="mb-2">
                        Don't have an account?{" "}
                        <Link
                          to="/register"
                          className="text-decoration-none text-primary hover:underline"
                        >
                          Create one here
                        </Link>
                      </p>
                      <p>
                        <Link
                          to="/"
                          className="text-decoration-none text-primary hover:underline"
                        >
                          ← Back to Home
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Login;
