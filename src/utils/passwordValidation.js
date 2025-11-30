export const validatePassword = (value) => {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 12)
    return "La contraseña debe tener al menos 12 caracteres.";
  if (!/[A-Z]/.test(value))
    return "La contraseña debe tener al menos una mayúscula.";
  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(value))
    return "La contraseña debe tener al menos un número o carácter especial.";
  return "";
};
