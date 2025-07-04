import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Route, Car, TrendingUp, UserPlus, Plus, Wand2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useTranslation();
  
  const { data: statistics } = useQuery<{
    totalEmployees: number;
    activeRoutes: number;
    totalVehicles: number;
    efficiency: number;
  }>({
    queryKey: ["/api/statistics"],
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  const stats = statistics || {
    totalEmployees: 0,
    activeRoutes: 0,
    totalVehicles: 0,
    efficiency: 0,
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalEmployees')}</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-slate-500 ml-2">{t('perMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('activeRoutes')}</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.activeRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Route className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+3</span>
              <span className="text-slate-500 ml-2">{t('newRoutes')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalVehicles')}</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.totalVehicles}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Car className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">100%</span>
              <span className="text-slate-500 ml-2">{t('utilization')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Эффективность</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.efficiency}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+2%</span>
              <span className="text-slate-500 ml-2">улучшение</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center space-x-3 p-4 h-auto justify-start"
              onClick={() => window.location.href = "/employees"}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="text-blue-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Добавить сотрудника</p>
                <p className="text-sm text-slate-500">Новый сотрудник в систему</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-3 p-4 h-auto justify-start"
              onClick={() => window.location.href = "/routes"}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="text-green-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Создать маршрут</p>
                <p className="text-sm text-slate-500">Новый маршрут развозки</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-3 p-4 h-auto justify-start"
              onClick={() => window.location.href = "/assignments"}
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wand2 className="text-purple-600" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Автораспределение</p>
                <p className="text-sm text-slate-500">Оптимизировать маршруты</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Последние изменения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 border border-slate-100 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Система инициализирована</p>
                <p className="text-sm text-slate-500">Загружены тестовые данные</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 border border-slate-100 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Route className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Созданы базовые маршруты</p>
                <p className="text-sm text-slate-500">Готовы к назначению сотрудников</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
