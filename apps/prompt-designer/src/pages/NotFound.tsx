import { useRouter } from "@/lib/router";
import { useEffect } from "react";
import { useI18n } from "@/i18n";
import { routes } from "@/lib/routes";

const NotFound = () => {
  const { currentPath } = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", currentPath);
  }, [currentPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl md:text-4xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl md:text-lg text-muted-foreground">{t("notFound.message")}</p>
        <a
          href={routes.prompts}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {t("notFound.returnHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
