const emailPattern = /^\S+@\S+\.\S+$/;

export function validateLogin(values) {
  const errors = {};

  if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export function validateSignup(values) {
  const errors = validateLogin(values);

  if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
