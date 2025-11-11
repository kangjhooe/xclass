/**
 * Centralized cache key constants
 */
export class CacheKeys {
  // User cache keys
  static user(id: number) {
    return `user:${id}`;
  }

  static userByEmail(email: string) {
    return `user:email:${email}`;
  }

  // Tenant cache keys
  static tenant(id: number) {
    return `tenant:${id}`;
  }

  static tenantByNpsn(npsn: string) {
    return `tenant:npsn:${npsn}`;
  }

  // Student cache keys
  static student(id: number, tenantId: number) {
    return `tenant:${tenantId}:student:${id}`;
  }

  static students(tenantId: number, page?: number, limit?: number) {
    const parts = [`tenant:${tenantId}:students`];
    if (page) parts.push(`page:${page}`);
    if (limit) parts.push(`limit:${limit}`);
    return parts.join(':');
  }

  // Teacher cache keys
  static teacher(id: number, tenantId: number) {
    return `tenant:${tenantId}:teacher:${id}`;
  }

  static teachers(tenantId: number, page?: number, limit?: number) {
    const parts = [`tenant:${tenantId}:teachers`];
    if (page) parts.push(`page:${page}`);
    if (limit) parts.push(`limit:${limit}`);
    return parts.join(':');
  }

  // Class cache keys
  static classRoom(id: number, tenantId: number) {
    return `tenant:${tenantId}:class:${id}`;
  }

  static classes(tenantId: number) {
    return `tenant:${tenantId}:classes`;
  }

  // Subject cache keys
  static subject(id: number, tenantId: number) {
    return `tenant:${tenantId}:subject:${id}`;
  }

  static subjects(tenantId: number) {
    return `tenant:${tenantId}:subjects`;
  }

  // Dashboard cache keys
  static dashboard(tenantId: number) {
    return `tenant:${tenantId}:dashboard`;
  }

  // Analytics cache keys
  static analytics(tenantId: number, module: string, startDate?: string, endDate?: string) {
    const parts = [`tenant:${tenantId}:analytics:${module}`];
    if (startDate) parts.push(`start:${startDate}`);
    if (endDate) parts.push(`end:${endDate}`);
    return parts.join(':');
  }

  // Pattern for invalidating all tenant cache
  static tenantPattern(tenantId: number) {
    return `tenant:${tenantId}:*`;
  }

  // Pattern for invalidating all students cache
  static studentsPattern(tenantId: number) {
    return `tenant:${tenantId}:student:*`;
  }

  // Pattern for invalidating all teachers cache
  static teachersPattern(tenantId: number) {
    return `tenant:${tenantId}:teacher:*`;
  }
}

