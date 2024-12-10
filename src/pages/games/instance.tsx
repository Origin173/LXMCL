import { useRouter } from "next/router";

const GameInstanceDetailPage = () => {
  const router = useRouter();

  return (
    <div>
      Game Instance Detail Page
      <br />
      ID: {router.query.id}
    </div>
  );
};

export default GameInstanceDetailPage;
