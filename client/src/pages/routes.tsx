import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Users, Clock } from "lucide-react";
import { RouteForm } from "@/components/forms/route-form";
import type { InsertRoute, RouteWithDetails } from "@shared/schema";

export default function Routes() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery<RouteWithDetails[]>({
    queryKey: ["/api/routes"],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: InsertRoute) => {
      const response = await apiRequest("POST", "/api/routes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Маршрут создан",
        description: "Маршрут успешно добавлен в систему",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать маршрут",
        variant: "destructive",
      });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Маршрут удален",
        description: "Маршрут успешно удален из системы",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить маршрут",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertRoute) => {
    createRouteMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот маршрут?")) {
      deleteRouteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Управление маршрутами</h3>
          <p className="text-slate-600">Создание и редактирование маршрутов развозки</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Создать маршрут
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Создать новый маршрут</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Существующие маршруты</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {routes.map((route) => (
                <div key={route.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-slate-800">{route.name}</h5>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(route.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <User className="text-slate-500" size={16} />
                      <span className="text-sm text-slate-700">Водитель: {route.driver}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="text-slate-500" size={16} />
                      <span className="text-sm text-slate-700">Вместимость: {route.capacity} человек</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="text-slate-500" size={16} />
                      <span className="text-sm text-slate-700">Отправление: {route.departureTime}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Остановки:</p>
                    <div className="space-y-1">
                      {route.stops.map((stop, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{index + 1}</span>
                          </div>
                          <span className="text-sm text-slate-600">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={route.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {route.isActive ? "Активный" : "Неактивный"}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {route.occupancy}/{route.capacity} мест занято
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {routes.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              Нет созданных маршрутов
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
