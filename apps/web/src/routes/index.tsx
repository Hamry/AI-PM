import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@fractalist/shared-ui";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
