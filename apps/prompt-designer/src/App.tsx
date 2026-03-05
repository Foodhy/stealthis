import { ToastProvider, Toaster } from "@/components/native/toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Route, Router, Routes } from "@/lib/router";
import Changelog from "@/pages/Changelog";
import Index from "@/pages/Index";
import NewDataSource from "@/pages/NewDataSource";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import TestEndpoints from "@/pages/TestEndpoints";
import Values from "@/pages/Values";

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/prompts" element={<Index />} />
          <Route path="/nueva-fuente" element={<NewDataSource />} />
          <Route path="/probar-endpoints" element={<TestEndpoints />} />
          <Route path="/valores" element={<Values />} />
          <Route path="/configuracion" element={<Settings />} />
          <Route path="/changelog" element={<Changelog />} />

          <Route path="/new-source" element={<NewDataSource />} />
          <Route path="/test-endpoints" element={<TestEndpoints />} />
          <Route path="/values" element={<Values />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
