export type AppRole = "guest" | "client" | "legal_staff" | "admin";

export const canAccess = (role: AppRole, area: "public" | "client" | "staff" | "admin") => {
  if (area === "public") return true;
  if (area === "client") return ["client", "legal_staff", "admin"].includes(role);
  if (area === "staff") return ["legal_staff", "admin"].includes(role);
  return role === "admin";
};
