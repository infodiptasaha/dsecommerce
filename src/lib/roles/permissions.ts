export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "users:read", "users:write", "users:delete", "users:assign_role",
    "products:read", "products:write", "products:delete",
    "orders:read", "orders:write", "orders:refund",
    "notifications:read", "notifications:write", "notifications:send",
    "settings:read", "settings:write",
    "roles:manage", "analytics:read",
  ],
  manager: [
    "users:read",
    "products:read", "products:write",
    "orders:read", "orders:write",
    "notifications:read", "analytics:read",
  ],
  support: [
    "users:read",
    "orders:read", "orders:write",
    "notifications:read",
  ],
  customer: ["orders:read_own"],
};

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
