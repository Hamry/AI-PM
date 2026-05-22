import React from "react";

interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  mainSlot: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function DashboardLayout({ sidebar, mainSlot, rightSlot }: DashboardLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden px-4 pb-4 pt-4 gap-4">
      {sidebar && (
        <aside className="w-[220px] shrink-0 flex flex-col overflow-y-auto">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {mainSlot}
      </main>
      {rightSlot && (
        <aside className="w-[280px] shrink-0 flex flex-col overflow-y-auto">
          {rightSlot}
        </aside>
      )}
    </div>
  );
}
