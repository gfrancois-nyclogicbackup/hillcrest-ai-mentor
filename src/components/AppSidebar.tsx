import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, TrendingUp, Users, FileText,
  ClipboardCheck, GraduationCap, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assignments', label: 'My Assignments', icon: BookOpen },
  { to: '/progress', label: 'My Progress', icon: TrendingUp },
];

const teacherNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assignments', label: 'Assignments', icon: BookOpen },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/submissions', label: 'Submissions', icon: FileText },
  { to: '/grades', label: 'Grades', icon: ClipboardCheck },
];

export default function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const nav = role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside className={cn(
      "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight">Hillcrest AI</span>}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{profile.full_name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{profile.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && 'Sign Out'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mx-auto flex text-sidebar-foreground/50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
