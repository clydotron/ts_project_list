
// Validation:
export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// @TODO implement as class too
export function validate(v: Validatable) {
  if (v.required) {
    if (v.value.toString().trim().length === 0) {
      return false
    }
  }

  if (v.minLength != null && typeof v.value === 'string') {
    if (v.value.length < v.minLength) {
      return false;
    } 
  }

  if (v.maxLength != null && typeof v.value === 'string') {
    if (v.value.length > v.maxLength) {
      return false;
    } 
  }

  if (v.min != null && typeof v.value === 'number') {
    if (v.value < v.min) {
      return false;
    } 
  }

  if (v.max != null && typeof v.value === 'number') {
    if (v.value > v.max) {
      return false;
    } 
  }

  return true;
}
