import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import {
  ThemeProvider as MacawUIThemeProvider,
  light,
  dark,
  SaleorThemeColors,
} from "@saleor/macaw-ui";
import React, { PropsWithChildren, useEffect } from "react";

import { AppLayoutProps } from "../../types";
import { ThemeSynchronizer } from "../hooks/theme-synchronizer";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";

const themeOverrides: Partial<Theme> = {
  overrides: {
    MuiTableCell: {
      body: {
        paddingBottom: 8,
        paddingTop: 8,
      },
      root: {
        height: 56,
        paddingBottom: 4,
        paddingTop: 4,
      },
    },
  },
};

type PalettesOverride = Record<"light" | "dark", SaleorThemeColors>;

/**
 * Temporary override of colors, to match new dashboard palette.
 * Long term this will be replaced with Macaw UI 2.x with up to date design tokens
 */
const palettes: PalettesOverride = {
  light: {
    ...light,
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  dark: {
    ...dark,
    background: {
      default: "hsla(211, 42%, 14%, 1)",
      paper: "hsla(211, 42%, 14%, 1)",
    },
  },
};

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
const appBridgeInstance =
  typeof window !== "undefined" ? new AppBridge({ autoNotifyReady: false }) : undefined;

// That's a hack required by Macaw-UI incompatibility with React@18
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean; palettes: PalettesOverride }>
>;

function SaleorApp({ Component, pageProps }: AppLayoutProps) {
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider overrides={themeOverrides} ssr palettes={palettes}>
          <ThemeSynchronizer />
          <RoutePropagator />
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
