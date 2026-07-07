import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../../redux/slices/authSlice";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (formData) => {
    setSubmitError("");
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      const dest = result.payload.role === "admin" ? "/admin/dashboard" : location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } else {
      setSubmitError(result.payload || "Login failed");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12">
      <div className="rounded-xl2 border border-primary-100 bg-white p-8 shadow-card">
        <h1 className="mb-1 font-display text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mb-6 text-sm text-ink-500">Log in to your FreshMart account.</p>

        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {status === "loading" ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          New to FreshMart?{" "}
          <Link to="/register" className="font-semibold text-primary-700 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink-500">
          Admin demo: admin@store.com / Admin@123 &nbsp;•&nbsp; Customer demo: customer@store.com / Customer@123
        </p>
      </div>
    </div>
  );
};

export default Login;
