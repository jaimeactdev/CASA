import type { Metadata } from "next";
import { appConfig } from "@/config/appConfig";

const isProd = process.env.NODE_ENV === "production";

const baseUrl = isProd ? appConfig.siteUrl : "http://localhost:4200";

type PageKey = "site" | "login" | "home" | "ejemplo" | "form";

/** SEO metadata per page. Titles use appConfig.name — change it in branding. */
export const seoMetadata: Record<PageKey, Metadata> = {
  site: {
    title: appConfig.fullName,
    description: appConfig.description,
    alternates: { canonical: `${baseUrl}/` },
  },
  login: {
    title: `Iniciar sesión | ${appConfig.name}`,
    description: appConfig.tagline,
    alternates: { canonical: `${baseUrl}/login` },
    robots: "noindex, nofollow",
  },
  home: {
    title: `Inicio | ${appConfig.name}`,
    description: appConfig.description,
    alternates: { canonical: `${baseUrl}/home` },
  },
  ejemplo: {
    title: `Ejemplo | ${appConfig.name}`,
    description: appConfig.description,
    alternates: { canonical: `${baseUrl}/ejemplo` },
  },
  form: {
    title: `Formulario | ${appConfig.name}`,
    description: appConfig.description,
    alternates: { canonical: `${baseUrl}/form` },
  },
};
