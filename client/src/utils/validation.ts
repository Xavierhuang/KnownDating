/**
 * Input validation utilities for production safety
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }

  return { valid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name is too long' };
  }

  // Check for potentially malicious content
  const suspiciousPatterns = /[<>{}[\]\\\/]/;
  if (suspiciousPatterns.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate age
 */
export function validateAge(age: number | string): ValidationResult {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(ageNum)) {
    return { valid: false, error: 'Age must be a number' };
  }

  if (ageNum < 18) {
    return { valid: false, error: 'You must be at least 18 years old' };
  }

  if (ageNum > 120) {
    return { valid: false, error: 'Please enter a valid age' };
  }

  return { valid: true };
}

/**
 * Validate gender
 */
export function validateGender(gender: string): ValidationResult {
  const validGenders = ['male', 'female', 'non-binary', 'other'];
  
  if (!gender || typeof gender !== 'string') {
    return { valid: false, error: 'Gender is required' };
  }

  if (!validGenders.includes(gender.toLowerCase())) {
    return { valid: false, error: 'Please select a valid gender' };
  }

  return { valid: true };
}

/**
 * Validate interested_in array
 */
export function validateInterestedIn(interestedIn: string[]): ValidationResult {
  if (!Array.isArray(interestedIn)) {
    return { valid: false, error: 'Interested in must be an array' };
  }

  if (interestedIn.length === 0) {
    return { valid: false, error: 'Please select at least one preference' };
  }

  const validGenders = ['male', 'female', 'non-binary', 'other'];
  for (const gender of interestedIn) {
    if (!validGenders.includes(gender.toLowerCase())) {
      return { valid: false, error: 'Invalid gender preference' };
    }
  }

  return { valid: true };
}

/**
 * Validate message content
 */
export function validateMessage(content: string): ValidationResult {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message is too long (max 2000 characters)' };
  }

  return { valid: true };
}

/**
 * Validate compatibility answer
 */
export function validateCompatibilityAnswer(answer: string): ValidationResult {
  if (!answer || typeof answer !== 'string') {
    return { valid: false, error: 'Answer cannot be empty' };
  }

  const trimmed = answer.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Answer cannot be empty' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'Please provide a more detailed answer (at least 10 characters)' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Answer is too long (max 5000 characters)' };
  }

  return { valid: true };
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

/**
 * Validate file upload
 */
export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type (images only)
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files are allowed (JPEG, PNG, WebP, GIF)' };
  }

  return { valid: true };
}

