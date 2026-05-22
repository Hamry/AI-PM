interface SidebarNavItem {
  label: string;
  icon: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProject {
  id: string;
  name: string;
  color: string;
  taskCount?: number;
}

interface SidebarProps {
  navItems?: SidebarNavItem[];
  projects?: SidebarProject[];
  activeProjectId?: string;
  onProjectClick?: (id: string) => void;
  aiSuggestion?: string;
}

const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Inbox", icon: "inbox", count: 4 },
  { label: "Today", icon: "today" },
  { label: "Upcoming", icon: "calendar_month" },
];

export function Sidebar({
  navItems = DEFAULT_NAV_ITEMS,
  projects = [],
  activeProjectId,
  onProjectClick,
  aiSuggestion,
}: SidebarProps) {
  return (
    <div className="flex flex-col gap-5 h-full py-1">
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-colors ${
              item.active
                ? "bg-surface-muted text-text-primary font-medium"
                : "text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
            <span className="text-sm flex-1">{item.label}</span>
            {item.count != null && (
              <span className="text-xs bg-surface-muted text-text-muted px-1.5 py-0.5 rounded-full font-medium">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {projects.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase px-3 mb-1">
            Projects
          </p>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectClick?.(project.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-colors ${
                activeProjectId === project.id
                  ? "bg-surface-muted text-text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary"
              }`}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-sm flex-1 truncate">{project.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <div className="rounded-xl bg-background-dark p-3 text-white">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">
              Sage AI
            </span>
            <span className="size-1.5 rounded-full bg-primary ml-auto" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {aiSuggestion ?? "Analyzing your tasks…"}
          </p>
        </div>
      </div>
    </div>
  );
}
