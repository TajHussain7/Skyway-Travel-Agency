import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      // Check password length
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      }
      // Check for @ symbol
      else if (!formData.password.includes("@")) {
        newErrors.password = "Password must contain @ symbol";
      }
      // Check for at least one number
      else if (!/\d/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      newErrors.terms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Redirect based on user role
        setTimeout(() => {
          if (response.data.data?.user?.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
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
                        className="fas fa-user-plus me-2"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                      Create Account
                    </h1>
                    <p className="card-text">
                      Join SkyWay Travel and start your journey today
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {errors.general && (
                      <div className="alert alert-danger mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                        {errors.general}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <span className="text-danger text-sm mt-1 block">
                          {errors.name}
                        </span>
                      )}
                    </div>

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
                        <span className="text-danger text-sm mt-1 block">
                          {errors.email}
                        </span>
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
                          placeholder="Create a password"
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
                        <span className="text-danger text-sm mt-1 block">
                          {errors.password}
                        </span>
                      )}
                      <small className="text-gray-500 text-xs mt-1 block">
                        Password must be 8+ characters, contain @ symbol and at
                        least one number
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Confirm Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Confirm your password"
                          style={{ paddingRight: "40px" }}
                        />
                        <i
                          className={`fas ${
                            showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                      {errors.confirmPassword && (
                        <span className="text-danger text-sm mt-1 block">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                          id="terms"
                          name="terms"
                          checked={formData.terms}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                      {errors.terms && (
                        <span className="text-danger text-sm mt-1 block">
                          {errors.terms}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 mb-3 "
                        disabled={loading}
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        {loading ? "Creating Account..." : "Create Account"}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="mb-2">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="text-decoration-none text-primary hover:underline"
                        >
                          Sign in here
                        </Link>
                      </p>
                      <p>
                        <Link
                          to="/"
                          className="text-decoration-none text-gray-500 hover:text-primary"
                        >
                          ← Back to Homepage
                        </Link>
                      </p>
                    </div>
                  </form>

                  {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                        <p className="text-gray-600">
                          Creating your account...
                        </p>
                      </div>
                    </div>
                  )}
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

export default Register;
