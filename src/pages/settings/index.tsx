import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRoutingHistory } from "@/contexts/routing-history";

const SettingsPage = () => {
  const router = useRouter();
  const { history } = useRoutingHistory();

  useEffect(() => {
    router.replace(
      [...history].reverse().find((route) => route.startsWith("/settings/")) ||
        "/settings/general"
    );
  }, [history, router]);

  return null;
};

export default SettingsPage;
