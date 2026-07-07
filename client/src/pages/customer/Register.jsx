import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../redux/slices/authSlice";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (formData) => {
    setSubmitError("");
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created! Welcome to FreshMart.");
      navigate("/", { replace: true });
    } else {
      setSubmitError(result.payload || "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12">
      <div className="rounded-xl2 border border-primary-100 bg-white p-8 shadow-card">
        <h1 className="mb-1 font-display text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mb-6 text-sm text-ink-500">Shop fresh groceries in minutes.</p>

        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Full name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
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
            <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
            <input
              {...register("phone")}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="9999999999"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Confirm password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                validate: (val) => val === watch("password") || "Passwords do not match",
              })}
              className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
