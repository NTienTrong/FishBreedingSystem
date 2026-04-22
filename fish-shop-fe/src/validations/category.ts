export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCategory = (data: { name: string; description: string }): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Tên danh mục không được để trống';
  } else if (data.name.length < 3) {
    errors.name = 'Tên danh mục phải chứa ít nhất 3 ký tự';
  } else if (data.name.length > 100) {
    errors.name = 'Tên danh mục không được vượt quá 100 ký tự';
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Mô tả không được vượt quá 500 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
