import { useState } from "react";
import { useFormValidation } from "./hooks/useFormValidation";

export default function SignInForm({ onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = () => ({
    email: (value) => {
      if (!value) return "El email es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "El email no es válido.";
      return "";
    },
    password: (value) => {
      if (!value) return "La contraseña es obligatoria.";
      if (value.length < 12)
        return "La contraseña debe tener al menos 12 caracteres.";
      return "";
    },
  });

  const {
    form,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    { email: "", password: "" },
    validationRules
  );

  const handleFormSubmit = async (formData) => {
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        throw new Error("Demasiados intentos. Por favor, inténtelo de nuevo más tarde (429).");
      }
      // Generic error message for security
      throw new Error("Las credenciales no son válidas.");
    }
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e, handleFormSubmit)}
      className="flex flex-col gap-4"
      autoComplete="on"
    >
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
        <label htmlFor="signin-email" className="font-medium">
          Email *
        </label>

        <input
          id="signin-email"
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
        <label htmlFor="signin-password" className="font-medium">
          Contraseña *
        </label>

        <div className="relative">
          <input
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="current-password"
            className="border border-gray-300 p-3 rounded mt-1 w-full text-base"
          />

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
        className="bg-blue-600 text-white p-3 rounded text-lg font-semibold mt-2 disabled:bg-blue-300 hover:bg-blue-700 transition"
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
