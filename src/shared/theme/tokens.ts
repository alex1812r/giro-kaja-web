/**
 * Source of truth for Giro Kaja design tokens (aligned with Stitch DS).
 * CSS variables in globals.css must stay in sync with these values.
 */
export const brand = {
  primary: "#107C41",
  primaryDark: "#0B532C",
  primaryLight: "#EAF4EC",
  /** Stitch primary-container — nav item activo */
  primaryContainer: "#96F7AF",
  onPrimaryContainer: "#005F2F",
} as const;

export const lightPalette = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F4F5",
  border: "#E5E7EB",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
  success: "#107C41",
  warning: "#F59E0B",
  danger: "#EF4444",
  ring: "#107C41",
} as const;

export const darkPalette = {
  background: "#111827",
  surface: "#1F2937",
  surfaceMuted: "#374151",
  border: "#374151",
  textMain: "#F9FAFB",
  textSecondary: "#9CA3AF",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  ring: "#34D399",
  primaryLight: "#1A3D2A",
} as const;

export const layout = {
  sidebarWidth: "15rem", // 240px
  contentMaxWidth: "70rem", // 1120px
  authCardMaxWidth: "26.25rem", // 420px — Stitch auth card
  radiusSm: "0.375rem",
  radiusMd: "0.5rem", // ROUND_EIGHT
  radiusLg: "0.75rem",
  radiusXl: "1rem",
} as const;

export const typography = {
  headline: "Manrope",
  body: "DM Sans",
} as const;
