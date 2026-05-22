import { useAuth } from "@clerk/react";
import { redirect, createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.auth.isLoaded && !context.auth.isSignedIn) throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
