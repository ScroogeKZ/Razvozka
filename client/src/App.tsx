import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Routes from "@/pages/routes";
import Vehicles from "@/pages/vehicles";
import Map from "@/pages/map";
import Assignments from "@/pages/assignments";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

const pageConfig = {
  "/": { title: "Панель управления", subtitle: "Обзор системы распределения маршрутов" },
  "/employees": { title: "Управление сотрудниками", subtitle: "Добавление, редактирование и назначение сотрудников" },
  "/routes": { title: "Управление маршрутами", subtitle: "Создание и редактирование маршрутов развозки" },
  "/vehicles": { title: "Управление транспортом", subtitle: "Регистрация и назначение транспортных средств" },
  "/map": { title: "Карта маршрутов", subtitle: "Визуализация маршрутов и расположения сотрудников" },
  "/assignments": { title: "Управление назначениями", subtitle: "Автоматическое и ручное назначение сотрудников на маршруты" },
  "/reports": { title: "Отчеты и экспорт", subtitle: "Генерация отчетов по маршрутам и назначениям" },
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/routes" component={Routes} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/map" component={Map} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              title={pageConfig[window.location.pathname]?.title || "RouteManager"}
              subtitle={pageConfig[window.location.pathname]?.subtitle || "Система управления маршрутами"}
            />
            <main className="flex-1 overflow-y-auto p-6">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
