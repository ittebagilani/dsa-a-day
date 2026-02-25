import { Navigate, useParams } from "react-router-dom";
import { useChallenge } from "@/hooks/use-challenges";
import { getChallengeSlug } from "@/lib/challenge-slug";

const LegacyChallengeRedirect = () => {
  const { id } = useParams();
  const challengeId = Number(id);
  const { data: challenge, isLoading } = useChallenge(challengeId);

  if (isLoading) return null;
  if (!challenge) return <Navigate to="/" replace />;

  return <Navigate to={`/${getChallengeSlug(challenge)}`} replace />;
};

export default LegacyChallengeRedirect;
