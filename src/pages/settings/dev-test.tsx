import { useEffect } from "react";
import { useRouter } from "next/router";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { isProd } from "@/utils/env";

// ============================================================
// This page is only for developers to test components, etc.
// DO NOT commit changes to this page.
// ============================================================

const DevTestPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (isProd) { router.push("/launch"); }
  }, []);

  return (
    <Alert status='warning' fontSize='sm' variant='left-accent'>
      <AlertIcon />
      This Page is only for developer to test components and etc. It will not shown in production mode.
    </Alert>
  )
}

export default DevTestPage;