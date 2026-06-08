import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignIn } from "@clerk/react";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: ({ context }) => {
    if (context.auth.isLoaded && context.auth.isSignedIn) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
