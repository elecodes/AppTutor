import { useState } from "react";

/**
 * Custom hook for form validation and state management
 * @param {Object} initialState - Initial form state
 * @param {Function} validationRules - Function that returns validation rules
 */
export function useFormValidation(initialState, validationRules) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const rules = validationRules();
    const rule = rules[name];
    
    if (!rule) return "";
    
    return rule(value, form);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateAll = () => {
    const rules = validationRules();
    let newErrors = {};
    
    Object.keys(rules).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault();
    if (loading) return;

    if (!validateAll()) return;

    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err) {
      setErrors({ general: err.message });
    }

    setLoading(false);
  };

  const resetForm = () => {
    setForm(initialState);
    setErrors({});
    setLoading(false);
  };

  return {
    form,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors,
  };
}
