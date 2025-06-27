import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
          <div className="h-6 w-px bg-slate-300"></div>
          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut size={16} className="mr-2" />
            Выход
          </Button>
        </div>
      </div>
    </header>
  );
}
