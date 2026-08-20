import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OtaShell } from "@/components/ota/OtaShell";

export const Route = createFileRoute("/ota")({
  component: () => (
    <OtaShell>
      <Outlet />
    </OtaShell>
  ),
});
