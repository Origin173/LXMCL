import { useRouter } from "next/router";
import ComingSoonSign from "@/components/common/coming-soon";

const InstanceDetailOverviewPage = () => {
  const router = useRouter();

  return (
    <div>
      Game Instance Overview Page (ID: {router.query.id})
      <ComingSoonSign />
    </div>
  );
};

export default InstanceDetailOverviewPage;
