import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Database, 
  Code, 
  TrendingUp, 
  Settings, 
  FileText, 
  FolderSync, 
  Download, 
  Shield,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Data Sources",
      href: "/data-sources",
      icon: Database,
    },
    {
      title: "API Testing",
      href: "/api-testing",
      icon: Code,
    },
    {
      title: "Performance",
      href: "/performance",
      icon: TrendingUp,
    },
    {
      title: "Configuration",
      href: "/configuration",
      icon: Settings,
    },
    {
      title: "Logs & Monitoring",
      href: "/logs",
      icon: FileText,
    },
  ];

  const quickActions = [
    {
      title: "Trigger Data FolderSync",
      icon: FolderSync,
    },
    {
      title: "Export Data",
      icon: Download,
    },
    {
      title: "Security Settings",
      icon: Shield,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav className={cn(
        "bg-white w-64 min-h-screen shadow-lg transform transition-transform duration-300 ease-in-out fixed lg:relative z-40",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <ScrollArea className="h-full">
          <div className="p-4">
            {/* Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-medium",
                        isActive 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => {
                        // Close sidebar on mobile when navigating
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <item.icon className="mr-3" size={20} />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                  >
                    <action.icon className="mr-2" size={16} />
                    {action.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </nav>
    </>
  );
}
