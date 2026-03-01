import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const reason = searchParams.get("reason");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-lg border p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">
            {isSuccess ? "Email Verified" : "Verification Failed"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isSuccess
              ? "Your account is now verified. You can sign in and continue."
              : "This verification link is invalid or expired. Request a new verification email and try again."}
          </p>
          {!isSuccess && reason && (
            <p className="text-xs text-muted-foreground mb-6">Reason: {reason}</p>
          )}
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
