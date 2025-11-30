import { describe, it, expect } from 'vitest';
import { validatePassword } from '../../utils/passwordValidation';

describe('validatePassword', () => {
  it('returns error when password is empty', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria.');
  });

  it('returns error when password is too short', () => {
    expect(validatePassword('short')).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('returns error when password has no uppercase letter', () => {
    expect(validatePassword('longpassword1!')).toBe('La contraseña debe tener al menos una mayúscula.');
  });

  it('returns error when password has no number or special character', () => {
    expect(validatePassword('LongPassword')).toBe('La contraseña debe tener al menos un número o carácter especial.');
  });

  it('returns empty string for valid password', () => {
    expect(validatePassword('ValidPass1!')).toBe('');
  });
});
