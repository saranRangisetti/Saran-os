import { StyleSheetManager, ThemeProvider } from "styled-components";
import { memo, useMemo } from "react";
import { type FeatureBundle, LazyMotion } from "motion/react";
import { useSession } from "contexts/session";
import GlobalStyle from "styles/GlobalStyle";
import themes from "styles/themes";
import { DEFAULT_THEME } from "utils/constants";
import branding from "utils/branding";

const motionFeatures = async (): Promise<FeatureBundle> =>
  (
    await import(
      /* webpackMode: "eager" */
      "styles/motionFeatures"
    )
  ).default;

const StyledApp: FC = ({ children }) => {
  const { themeName } = useSession();

  const activeTheme = themes[themeName] || themes[DEFAULT_THEME];

  const brandedTheme = useMemo(
    () => ({
      ...activeTheme,
      colors: {
        ...activeTheme.colors,
        background: branding.colors.background || activeTheme.colors.background,
        highlight: branding.colors.primary || activeTheme.colors.highlight,
        selectionHighlight:
          branding.colors.primary || activeTheme.colors.selectionHighlight,
        selectionHighlightBackground:
          branding.colors.primary ||
          activeTheme.colors.selectionHighlightBackground,
        taskbar: {
          ...activeTheme.colors.taskbar,
          background:
            branding.colors.surface || activeTheme.colors.taskbar.background,
        },
        titleBar: {
          ...activeTheme.colors.titleBar,
          background:
            branding.colors.accent || activeTheme.colors.titleBar.background,
          backgroundHover:
            branding.colors.accent ||
            activeTheme.colors.titleBar.backgroundHover,
          closeHover:
            branding.colors.primary || activeTheme.colors.titleBar.closeHover,
        },
        window: {
          ...activeTheme.colors.window,
          outline: activeTheme.colors.window.outline,
        },
      },
      name: branding.name || activeTheme.name,
    }),
    [activeTheme]
  );

  return (
    <StyleSheetManager enableVendorPrefixes>
      <ThemeProvider theme={brandedTheme}>
        <GlobalStyle />
        <LazyMotion features={motionFeatures} strict>
          {children}
        </LazyMotion>
      </ThemeProvider>
    </StyleSheetManager>
  );
};

export default memo(StyledApp);
