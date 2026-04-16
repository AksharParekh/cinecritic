const adminUsername = "akshar_190";
const adminUsernames = [adminUsername];

const defaultAuthorities = [
  "dashboard:view",
  "analytics:view",
  "reviews:moderate",
  "favorites:view",
  "content:create",
  "content:edit",
  "content:delete",
  "admins:manage"
];

const authorityStorageKey = (username) => `cinecritic_admin_authorities_${username?.toLowerCase() || ""}`;

const isAdminUser = (user) => {
  if (!user?.username) return false;
  return adminUsernames.includes(user.username.toLowerCase());
};

const getAdminUsernames = () => adminUsernames;

const getAuthorities = (username) => {
  if (!username || typeof window === "undefined") return defaultAuthorities;

  try {
    const raw = window.localStorage.getItem(authorityStorageKey(username));
    if (!raw) return defaultAuthorities;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultAuthorities;

    const sanitized = parsed.filter(Boolean);
    return sanitized.length > 0 ? sanitized : defaultAuthorities;
  } catch {
    return defaultAuthorities;
  }
};

const setAuthorities = (username, authorities) => {
  if (!username || typeof window === "undefined") return;
  window.localStorage.setItem(
    authorityStorageKey(username),
    JSON.stringify(authorities)
  );
};

const hasAuthority = (user, authority) => {
  if (!user?.username) return false;
  return getAuthorities(user.username).includes(authority);
};

const adminUtils = {
  isAdminUser,
  getAdminUsernames,
  defaultAuthorities,
  getAuthorities,
  setAuthorities,
  hasAuthority
};

export default adminUtils;
