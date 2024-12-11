import { useRouter } from "next/router";

const InstanceDetailHomePage = () => {
  const router = useRouter();

  return (
    <div>
      Game Instance Home Page
      <br />
      ID: {router.query.id}
    </div>
  );
};

export default InstanceDetailHomePage;
