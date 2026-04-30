export function normalizeRole(role: string | undefined | null) {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "university_admin" || normalized === "university admin") {
    return "super_admin";
  }

  if (normalized === "administrator") {
    return "admin";
  }

  return normalized;
}

export function isAdminRole(role: string | undefined | null) {
  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "super_admin";
}

export function isUniversityAdminRole(role: string | undefined | null) {
  return normalizeRole(role) === "super_admin";
}
