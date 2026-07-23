import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";

import "../src/app/globals.css";
import { AppProviders } from "../src/app/providers/app-providers";
import {
  applyTheme,
  type Theme,
  themeStorageKey,
} from "../src/shared/theme/theme";
import { mswHandlers } from "./msw-handlers";

initialize({ onUnhandledRequest: "bypass" });

function syncStorybookTheme(theme: Theme) {
  applyTheme(theme);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(themeStorageKey, theme);
  }
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const selectedTheme = context.globals.theme === "dark" ? "dark" : "light";

      syncStorybookTheme(selectedTheme);

      return (
        <AppProviders key={context.id}>
          <div className="min-h-screen bg-background p-6 text-text-main">
            <Story />
          </div>
        </AppProviders>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: "Tema visual de la aplicación",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Oscuro" },
        ],
        showName: true,
        title: "Tema",
      },
    },
  },
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: mswHandlers,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "fullscreen",
  },
};

export default preview;
