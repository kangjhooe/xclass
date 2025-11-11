import { Transform } from 'class-transformer';

/**
 * Transform decorator untuk mengubah null atau empty string menjadi undefined
 * Berguna untuk field opsional yang bisa menerima null dari frontend
 * 
 * @example
 * @TransformNull()
 * @IsOptional()
 * @IsString()
 * notes?: string;
 */
export function TransformNull() {
  return Transform(({ value }) => {
    if (value === null || value === '') {
      return undefined;
    }
    return value;
  });
}

