import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/native/card";
import { Badge } from "@/components/native/badge";
import { Button } from "@/components/native/button";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/lib/routes";
import { useRouter } from "@/lib/router";
import { changelogData } from "@/data/changelog";
import { useI18n } from "@/i18n";

const Changelog: React.FC = () => {
  const { navigate } = useRouter();
  const { t } = useI18n();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(routes.prompts)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.changelog")}</h1>
          <p className="text-muted-foreground">{t("changelog.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-8">
        {changelogData.map((entry) => (
          <Card key={entry.version} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="outline">{entry.date}</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl">v{entry.version}</CardTitle>
              </div>
              <CardDescription>
                {t(entry.description, undefined, entry.description)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {entry.updates.map((update, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {update.type === "feature" && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {t("changelog.badge.feature")}
                        </Badge>
                      )}
                      {update.type === "fix" && (
                        <Badge variant="destructive">{t("changelog.badge.fix")}</Badge>
                      )}
                      {update.type === "improvement" && (
                        <Badge variant="secondary">{t("changelog.badge.improvement")}</Badge>
                      )}
                      {update.type === "chore" && (
                        <Badge variant="outline">{t("changelog.badge.chore")}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm leading-none pt-1.5">
                        {t(update.content, undefined, update.content)}
                      </p>
                      {update.link && (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                          onClick={() => navigate(update.link!)}
                        >
                          {t("changelog.cta")} &rarr;
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Changelog;
