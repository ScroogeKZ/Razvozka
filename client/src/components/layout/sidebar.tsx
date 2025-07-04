import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Route, 
  Car, 
  Map, 
  ClipboardList, 
  FileText,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Басқару панелі", href: "/", icon: LayoutDashboard },
  { name: "Қызметкерлер", href: "/employees", icon: Users },
  { name: "Бағыттар", href: "/routes", icon: Route },
  { name: "Көлік парк", href: "/vehicles", icon: Car },
  { name: "Карта", href: "/map", icon: Map },
  { name: "Тағайындаулар", href: "/assignments", icon: ClipboardList },
  { name: "Есептер", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Route className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">BusManager</h1>
            <p className="text-sm text-slate-500">Қызметкер көлігін басқару</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "text-primary bg-blue-50" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <UserCheck className="text-white text-sm" size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Әкімші</p>
            <p className="text-xs text-slate-500">Толық құқық</p>
          </div>
        </div>
      </div>
    </div>
  );
}
