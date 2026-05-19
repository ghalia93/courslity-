export type UniversityEmailSource = {
  name?: string | null;
  email_domain?: string | null;
};

export const UNIVERSITY_DOMAINS: Record<string, string> = {
  "Beirut Arab University": "student.bau.edu.lb",
  "American University of Beirut": "mail.aub.edu",
  "Lebanese American University": "students.lau.edu.lb",
  "Lebanese International University": "students.liu.edu.lb",
  "Universit\u00e9 Saint-Joseph de Beyrouth": "net.usj.edu.lb",
  "University of Balamand": "balamand.edu.lb",
};

export function getExpectedUniversityDomain(
  university: UniversityEmailSource | null | undefined,
) {
  if (!university) return null;

  const configuredDomain = university.email_domain?.trim();
  if (configuredDomain) return configuredDomain;

  const name = university.name?.trim();
  return name ? UNIVERSITY_DOMAINS[name] || null : null;
}

export function domainMatches(typedDomain: string, expectedDomain: string) {
  const typed = typedDomain.trim().toLowerCase();
  const expected = expectedDomain.trim().toLowerCase();
  return typed === expected || typed.endsWith(`.${expected}`);
}

export function getEmailLocalPart(email: string) {
  return email.trim().split("@")[0]?.trim() ?? "";
}

export function buildEmailWithDomain(localPart: string, expectedDomain: string) {
  const normalizedLocalPart = getEmailLocalPart(localPart).toLowerCase();
  const normalizedDomain = expectedDomain.trim().toLowerCase();
  return normalizedLocalPart && normalizedDomain
    ? `${normalizedLocalPart}@${normalizedDomain}`
    : "";
}
