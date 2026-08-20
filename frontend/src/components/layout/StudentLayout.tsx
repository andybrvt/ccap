import { Navigation } from "./StudentNavigation";
import AdminFooter from "./AdminFooter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navigation />
      <div className="flex-1">
        {children}
      </div>
      <AdminFooter />
    </div>
  );
}
