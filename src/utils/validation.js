export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\d{10,15}$/;

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  const cleanPhone = phone.replace(/\D/g, '');
  if (!phoneRegex.test(cleanPhone)) return "Enter a valid phone number (10-15 digits)";
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateName = (name, fieldName = "Name") => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (/\d/.test(name)) return `${fieldName} cannot contain numbers`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  return null;
};

export const validateCompanyName = (name, fieldName = "Company Name") => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (!/^[a-zA-Z0-9\s.&'()-]+$/.test(name)) {
    return `${fieldName} contains invalid characters`;
  }
  return null;
};
