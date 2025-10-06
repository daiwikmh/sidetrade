
import "./global.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
          <SidebarProvider>
            {/* Mobile Header - only visible on mobile */}
            <MobileHeader />

            {/* Desktop Layout */}
            <div className="w-full flex">
              {/* Sidebar */}

             <div className="hidden lg:block flex-shrink-0">
                <DashboardSidebar />
              </div>


              {/* Main content */}
              <div className="flex-1 min-h-screen bg-muted">
                {/* Sidebar Toggle Button */}
                <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center gap-4">
                  <SidebarTrigger className="lg:flex" />
                  <h2 className="text-lg font-semibold">sidetradeShift</h2>
                </div>

                {/* Page Content */}
                <div className="p-6 max-w-7xl mx-auto">
                  {children}
                </div>
              </div>

              {/* Right column */}
        {/*<div className="hidden mx-4 lg:block flex-shrink-0 w-[320px]">
                <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
                  <Widget widgetData={mockData.widgetData} />
                  <Notifications
                    initialNotifications={mockData.notifications}
                  />
                  <Chat />
                </div>
              </div>*/}
            </div>

            {/* Mobile Chat - floating CTA with drawer */}
            {/*<MobileChat />*/}
          </SidebarProvider>
  );
}
