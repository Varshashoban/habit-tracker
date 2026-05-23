import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import { useAuth } from "../hooks/useAuth";
import { validateLogin } from "../utils/validation";

const initialValues = {
  email: "",
  password: "",
};

function LoginPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function updateValue(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);

    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (error) {
      if (error.fields?.length) {
        setErrors(
          error.fields.reduce(
            (fieldErrors, fieldError) => ({
              ...fieldErrors,
              [fieldError.field]: fieldError.message,
            }),
            {},
          ),
        );
      }

      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      description="Sign in to return to your dashboard and protected habit data."
      title="Welcome back"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={errors.email}
          label="Email"
          name="email"
          onChange={updateValue}
          placeholder="you@example.com"
          type="email"
          value={values.email}
        />
        <TextField
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          name="password"
          onChange={updateValue}
          placeholder="Your password"
          type="password"
          value={values.password}
        />
        {serverError && (
          <p className="rounded-md border border-rose-200/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
            {serverError}
          </p>
        )}
        <button
          className="w-full rounded-md bg-teal-300 px-4 py-3 font-semibold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-300">
        New here?{" "}
        <Link className="font-semibold text-teal-200 hover:text-teal-100" to="/signup">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
