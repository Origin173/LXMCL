import { useRouter } from "next/router";
import { useEffect } from "react";

const SettingsPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/settings/general");
  }, [router]);

  return null;
};

export default SettingsPage;
