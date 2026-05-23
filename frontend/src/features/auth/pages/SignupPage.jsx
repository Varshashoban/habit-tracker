import { useState } from "react";
import { Link, useNavigate } from "react-router";

import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import { useAuth } from "../hooks/useAuth";
import { validateSignup } from "../utils/validation";

const initialValues = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

function SignupPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function updateValue(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignup(values);

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      navigate("/dashboard", { replace: true });
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
      description="Create your secure account and move directly into your dashboard."
      title="Start your streak"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <TextField
          autoComplete="name"
          error={errors.name}
          label="Name"
          name="name"
          onChange={updateValue}
          placeholder="Ava Patel"
          type="text"
          value={values.name}
        />
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
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          name="password"
          onChange={updateValue}
          placeholder="At least 8 characters"
          type="password"
          value={values.password}
        />
        <TextField
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirm password"
          name="confirmPassword"
          onChange={updateValue}
          placeholder="Repeat your password"
          type="password"
          value={values.confirmPassword}
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
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-300">
        Already have an account?{" "}
        <Link className="font-semibold text-teal-200 hover:text-teal-100" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;
