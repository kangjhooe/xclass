'use client';

import { useState, useCallback, useMemo } from 'react';
import { validators, validateField } from '../validation/schemas';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
  url?: boolean;
  date?: boolean;
  phone?: boolean;
}

export interface FormValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  validateField: (fieldName: keyof T, value: any) => string | null;
  validateForm: (values: T) => boolean;
  setFieldError: (fieldName: keyof T, error: string | null) => void;
  setFieldTouched: (fieldName: keyof T, touched?: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: keyof T) => void;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  rules: FormValidationRules,
  initialValues?: Partial<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const buildValidator = useCallback((rule: ValidationRule) => {
    return (value: any): string | null => {
      // Build validation rules object
      const validationRules: Parameters<typeof validateField>[1] = {
        required: rule.required,
        minLength: rule.minLength,
        maxLength: rule.maxLength,
        pattern: rule.pattern,
      };

      // Add custom validators
      if (rule.email) {
        validationRules.custom = validators.email();
      } else if (rule.phone) {
        validationRules.custom = validators.phone();
      } else if (rule.url) {
        validationRules.custom = validators.url();
      } else if (rule.date) {
        validationRules.custom = validators.date();
      } else if (rule.number) {
        validationRules.custom = validators.number();
      } else if (rule.custom) {
        validationRules.custom = rule.custom;
      }

      // Add min/max for numbers
      if (rule.min !== undefined || rule.max !== undefined) {
        const originalCustom = validationRules.custom;
        validationRules.custom = (value: any) => {
          if (originalCustom) {
            const error = originalCustom(value);
            if (error) return error;
          }
          
          const numValue = Number(value);
          if (isNaN(numValue)) return null;
          
          if (rule.min !== undefined && numValue < rule.min) {
            return `Minimal ${rule.min}`;
          }
          if (rule.max !== undefined && numValue > rule.max) {
            return `Maksimal ${rule.max}`;
          }
          return null;
        };
      }

      return validateField(value, validationRules);
    };
  }, []);

  const validateFieldValue = useCallback(
    (fieldName: keyof T, value: any): string | null => {
      const rule = rules[fieldName as string];
      if (!rule) return null;

      const validator = buildValidator(rule);
      return validator(value);
    },
    [rules, buildValidator]
  );

  const validateForm = useCallback(
    (values: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};

      Object.keys(rules).forEach((fieldName) => {
        const fieldValue = values[fieldName as keyof T];
        const error = validateFieldValue(fieldName as keyof T, fieldValue);
        if (error) {
          newErrors[fieldName as keyof T] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules, validateFieldValue]
  );

  const setFieldError = useCallback((fieldName: keyof T, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const nextErrors = { ...prev };
        delete nextErrors[fieldName];
        return nextErrors;
      }
      return { ...prev, [fieldName]: error };
    });
  }, []);

  const setFieldTouched = useCallback((fieldName: keyof T, touchedValue = true) => {
    setTouched((prev) => ({ ...prev, [fieldName]: touchedValue }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setFieldError(fieldName, null);
  }, [setFieldError]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    errors,
    touched,
    isValid,
    validateField: validateFieldValue,
    validateForm,
    setFieldError,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    reset,
  };
}

