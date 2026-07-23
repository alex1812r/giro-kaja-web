import { z } from "zod";

export const settingsPreferencesSchema = z.object({
  theme: z.enum(["light", "dark"]),
  locale: z.enum(["es", "en"]),
});

export type SettingsPreferencesValues = z.infer<typeof settingsPreferencesSchema>;
