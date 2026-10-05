import type { Role } from "@/types/auth";

export const APP_NAME = "forlivf";
export const APP_TAGLINE = "An AI operating system for the IVF lab.";

export const SESSION_STORAGE_KEY = "forlivf.session";
export const REMEMBERED_USER_KEY = "forlivf.remembered-user";
export const REMEMBERED_CENTER_KEY = "forlivf.remembered-center";

/** Shown as the Center ID placeholder until the real centre directory is wired up. */
export const DEMO_CENTER_ID = "FLV-HYD-014";
export const DEMO_CENTER_NAME = "Forlivf Fertility Centre";

export const ROLES: Role[] = [
  {
    id: "embryologist",
    label: "Embryologist",
    blurb: "Grading, culture and cryo workflows",
  },
  {
    id: "clinician",
    label: "Clinician",
    blurb: "Patient charts and cycle decisions",
  },
  {
    id: "ivf-specialist",
    label: "IVF Specialist",
    blurb: "Protocol design and outcome review",
  },
  {
    id: "andro-technician",
    label: "Andro Technician",
    blurb: "Semen analysis and sample prep",
  },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/tasks", label: "Task Manager", icon: "tasks" },
  { href: "/patients", label: "Patients", icon: "patients" },
  { href: "/sperm-analysis", label: "Sperm Analysis", icon: "sperm" },
  { href: "/embryo-tracking", label: "Embryo Tracking", icon: "embryo" },
  { href: "/stats", label: "Stats", icon: "stats" },
  { href: "/reports", label: "Reports", icon: "reports" },
  { href: "/oocyte-analysis", label: "Oocyte Analysis", icon: "oocyte" },
  { href: "/pgt-analysis", label: "PGT Analysis", icon: "pgt" },
  { href: "/era-analysis", label: "ERA Analysis", icon: "era" },
] as const;
