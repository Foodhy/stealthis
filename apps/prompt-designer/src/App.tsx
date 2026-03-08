import { ToastProvider, Toaster } from "@/components/native/toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/i18n";
import { legacyRouteAliases, routes } from "@/lib/routes";
import { Route, Router, Routes } from "@/lib/router";
import Changelog from "@/pages/Changelog";
import Index from "@/pages/Index";
import NewDataSource from "@/pages/NewDataSource";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import TestEndpoints from "@/pages/TestEndpoints";
import Values from "@/pages/Values";
import { PromptWorkspacePage } from "@/pages/prompts/PromptWorkspacePage";

const App = () => (
  <I18nProvider>
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Toaster />
          <Routes>
            <Route path={routes.home} element={<Index />} />
            <Route path={routes.prompts} element={<Index />} />
            <Route path={routes.promptsNew} element={<PromptWorkspacePage mode="new" />} />
            <Route path={routes.promptsEdit} element={<PromptWorkspacePage mode="edit" />} />
            <Route path={routes.newSource} element={<NewDataSource />} />
            <Route path={routes.testEndpoints} element={<TestEndpoints />} />
            <Route path={routes.values} element={<Values />} />
            <Route path={routes.settings} element={<Settings />} />
            <Route path={routes.changelog} element={<Changelog />} />

            {/* Spanish/legacy aliases kept for backward compatibility */}
            <Route path={legacyRouteAliases.promptsNew[0]} element={<PromptWorkspacePage mode="new" />} />
            <Route path={legacyRouteAliases.promptsEdit[0]} element={<PromptWorkspacePage mode="edit" />} />
            <Route path={legacyRouteAliases.newSource[0]} element={<NewDataSource />} />
            <Route path={legacyRouteAliases.testEndpoints[0]} element={<TestEndpoints />} />
            <Route path={legacyRouteAliases.values[0]} element={<Values />} />
            <Route path={legacyRouteAliases.settings[0]} element={<Settings />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  </I18nProvider>
);

export default App;
