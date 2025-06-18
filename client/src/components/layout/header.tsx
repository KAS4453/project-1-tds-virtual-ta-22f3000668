import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatusIndicator from "@/components/ui/status-indicator";
import { Menu, Bell, Bot } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="bg-primary text-white rounded-lg p-2 mr-3">
                <Bot size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">TDS Virtual TA</h1>
                <p className="text-sm text-gray-500">Teaching Assistant API Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
              <StatusIndicator status="active" />
              <span className="text-sm font-medium">API Online</span>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
              <Bell size={18} />
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin Avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
