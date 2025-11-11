// Validation helper functions (without external dependencies)

export function validateEmail(email: string): string | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Email tidak valid';
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) ? null : 'Format nomor telepon tidak valid';
}

export function validateNISN(nisn: string): string | null {
  if (!nisn) return null;
  const nisnRegex = /^\d{10}$/;
  return nisnRegex.test(nisn) ? null : 'NISN harus 10 digit angka';
}

export function validateNIS(nis: string): string | null {
  if (!nis || nis.trim() === '') return 'NIS wajib diisi';
  return null;
}

export function validateURL(url: string): string | null {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL tidak valid';
  }
}

export function validateDate(date: string): string | null {
  if (!date) return null;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return 'Format tanggal tidak valid (YYYY-MM-DD)';
  const dateObj = new Date(date);
  return isNaN(dateObj.getTime()) ? 'Tanggal tidak valid' : null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password wajib diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar';
  if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung angka';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password harus mengandung karakter khusus';
  return null;
}

// Schema validation functions
export function validateStudent(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  } else if (data.name.length > 100) {
    errors.name = 'Nama maksimal 100 karakter';
  }
  
  if (data.nisn) {
    const nisnError = validateNISN(data.nisn);
    if (nisnError) errors.nisn = nisnError;
  }
  
  const nisError = validateNIS(data.nis);
  if (nisError) errors.nis = nisError;
  
  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }
  
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  if (!data.gender || !['L', 'P'].includes(data.gender)) {
    errors.gender = 'Pilih jenis kelamin';
  }
  
  if (!data.birth_place || data.birth_place.trim() === '') {
    errors.birth_place = 'Tempat lahir wajib diisi';
  }
  
  const dateError = validateDate(data.birth_date);
  if (dateError) errors.birth_date = dateError;
  
  if (!data.address || data.address.length < 10) {
    errors.address = 'Alamat minimal 10 karakter';
  }
  
  return errors;
}

export function validateTeacher(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  } else if (data.name.length > 100) {
    errors.name = 'Nama maksimal 100 karakter';
  }
  
  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }
  
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  if (!data.gender || !['L', 'P'].includes(data.gender)) {
    errors.gender = 'Pilih jenis kelamin';
  }
  
  if (!data.birth_place || data.birth_place.trim() === '') {
    errors.birth_place = 'Tempat lahir wajib diisi';
  }
  
  const dateError = validateDate(data.birth_date);
  if (dateError) errors.birth_date = dateError;
  
  if (!data.address || data.address.length < 10) {
    errors.address = 'Alamat minimal 10 karakter';
  }
  
  return errors;
}

export function validateLogin(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password wajib diisi';
  }
  
  return errors;
}

export function validateRegister(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  }
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok';
  }
  
  if (!data.tenantName || data.tenantName.length < 3) {
    errors.tenantName = 'Nama instansi minimal 3 karakter';
  }
  
  return errors;
}

// Generic form field validation
export function validateField(value: any, rules: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}): string | null {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'Field ini wajib diisi';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Min length check
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return `Minimal ${rules.minLength} karakter`;
  }

  // Max length check
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return `Maksimal ${rules.maxLength} karakter`;
  }

  // Pattern check
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return 'Format tidak valid';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

// Validation helpers
export const validators = {
  required: (message = 'Field ini wajib diisi') => (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },
  
  email: (message = 'Email tidak valid') => (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return null;
    return value.length < min ? (message || `Minimal ${min} karakter`) : null;
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return null;
    return value.length > max ? (message || `Maksimal ${max} karakter`) : null;
  },
  
  pattern: (pattern: RegExp, message = 'Format tidak valid') => (value: string) => {
    if (!value) return null;
    return pattern.test(value) ? null : message;
  },
  
  number: (message = 'Harus berupa angka') => (value: any) => {
    if (!value) return null;
    return isNaN(Number(value)) ? message : null;
  },
  
  min: (min: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return null;
    return value < min ? (message || `Minimal ${min}`) : null;
  },
  
  max: (max: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) return null;
    return value > max ? (message || `Maksimal ${max}`) : null;
  },
  
  url: (message = 'URL tidak valid') => (value: string) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },
  
  date: (message = 'Format tanggal tidak valid') => (value: string) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return message;
    const date = new Date(value);
    return isNaN(date.getTime()) ? message : null;
  },
  
  phone: (message = 'Format nomor telepon tidak valid') => (value: string) => {
    if (!value) return null;
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(value) ? null : message;
  },
};

