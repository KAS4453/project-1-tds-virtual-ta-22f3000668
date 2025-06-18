import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ApiTesting from "@/pages/api-testing";
import DataSources from "@/pages/data-sources";
import Performance from "@/pages/performance";
import Configuration from "@/pages/configuration";
import Logs from "@/pages/logs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/api-testing" component={ApiTesting} />
      <Route path="/data-sources" component={DataSources} />
      <Route path="/performance" component={Performance} />
      <Route path="/configuration" component={Configuration} />
      <Route path="/logs" component={Logs} />
      <Route component={Dashboard} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-surface">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="flex h-screen pt-16">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className="flex-1 overflow-y-auto bg-surface">
              <div className="p-6">
                <Router />
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
