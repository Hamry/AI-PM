import { createRootRouteWithContext, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { UserButton, SignInButton, useAuth } from "@clerk/react";
import { Navbar } from "@fractalist/shared-ui";
import * as Tooltip from "@radix-ui/react-tooltip";

interface RouterContext {
  auth: ReturnType<typeof useAuth>;
}

function RootComponent() {
  const { isSignedIn } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const links = pathname.startsWith("/dashboard")
    ? [
        { label: "Dashboard", href: "/dashboard", active: true },
        { label: "Projects", href: "#", active: false },
        { label: "Analytics", href: "#", active: false },
      ]
    : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light">
      <Tooltip.Provider>
        <Navbar
          links={links}
          authSlot={isSignedIn ? <UserButton /> : <SignInButton />}
        />
        <Outlet />
      </Tooltip.Provider>
      <TanStackRouterDevtools />
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
