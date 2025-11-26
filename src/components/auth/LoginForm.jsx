import { useState } from "react";

export default function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "El email es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "El email no es válido.";
    }

    if (name === "password") {
      if (!value) error = "La contraseña es obligatoria.";
      else if (value.length < 6)
        error = "La contraseña debe tener al menos 6 caracteres.";
    }

    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // evitar doble submit

    let newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err) {
      setErrors({ general: err.message });
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-sm mx-auto p-4"
      autoComplete="on"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">Iniciar sesión</h2>

      {errors.general && (
        <div
          role="alert"
          className="text-red-600 text-sm bg-red-100 p-2 rounded"
        >
          {errors.general}
        </div>
      )}

      {/* EMAIL */}
      <div className="flex flex-col">
        <label htmlFor="email" className="font-medium">
          Email *
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="email"
          className="border border-gray-300 p-3 rounded mt-1 text-base"
        />

        {errors.email && (
          <span className="text-red-600 text-sm mt-1">{errors.email}</span>
        )}
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col">
        <label htmlFor="password" className="font-medium">
          Contraseña *
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="current-password"
            className="border border-gray-300 p-3 rounded mt-1 w-full text-base"
          />

          {/* TOGGLE PASSWORD */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-blue-600"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {errors.password && (
          <span className="text-red-600 text-sm mt-1">{errors.password}</span>
        )}
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-3 rounded text-lg font-semibold mt-2 disabled:bg-blue-300"
      >
        {loading ? "Cargando..." : "Entrar"}
      </button>
    </form>
  );
}
