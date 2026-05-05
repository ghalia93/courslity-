type UniversityAliasGroup = {
  aliases: string[];
  searchTerms: string[];
};

const UNIVERSITY_ALIAS_GROUPS: UniversityAliasGroup[] = [
  {
    aliases: ["bau"],
    searchTerms: ["Beirut Arab University"],
  },
  {
    aliases: ["aub"],
    searchTerms: ["American University of Beirut"],
  },
  {
    aliases: ["lau"],
    searchTerms: ["Lebanese American University"],
  },
  {
    aliases: ["liu"],
    searchTerms: ["Lebanese International University"],
  },
  {
    aliases: ["usj", "usjb"],
    searchTerms: ["Saint-Joseph"],
  },
  {
    aliases: ["uob"],
    searchTerms: ["Balamand"],
  },
];

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getUniversityAliasSearchTerms(query: string) {
  const normalizedQuery = normalizeAlias(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return UNIVERSITY_ALIAS_GROUPS.flatMap(({ aliases, searchTerms }) =>
    aliases.some(
      (alias) => alias === normalizedQuery || alias.startsWith(normalizedQuery),
    )
      ? searchTerms
      : [],
  );
}

