import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Car } from "lucide-react";
import { VehicleForm } from "@/components/forms/vehicle-form";
import type { InsertVehicle, Vehicle } from "@shared/schema";

export default function Vehicles() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Транспорт добавлен",
        description: "Транспортное средство успешно добавлено в систему",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить транспорт",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Транспорт удален",
        description: "Транспортное средство успешно удалено из системы",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить транспорт",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertVehicle) => {
    createVehicleMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить это транспортное средство?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const getRouteNameById = (routeId: number | null) => {
    if (!routeId) return "Не назначен";
    const route = routes.find((r: any) => r.id === routeId);
    return route?.name || "Не найден";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "В работе";
      case "maintenance":
        return "ТО";
      case "inactive":
        return "Простой";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Управление транспортом</h3>
          <p className="text-slate-600">Регистрация и назначение транспортных средств</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Добавить транспорт
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Добавить транспортное средство</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Парк транспортных средств</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-800">{vehicle.licensePlate}</h5>
                        <p className="text-sm text-slate-500">{vehicle.model}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Вместимость:</span>
                      <span className="text-sm font-medium text-slate-800">{vehicle.capacity} мест</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Маршрут:</span>
                      <span className="text-sm font-medium text-slate-800">
                        {getRouteNameById(vehicle.routeId)}
                      </span>
                    </div>
                    {vehicle.notes && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Примечания:</span>
                        <span className="text-sm font-medium text-slate-800">{vehicle.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(vehicle.status || "active")}>
                      {getStatusLabel(vehicle.status || "active")}
                    </Badge>
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${vehicle.routeId ? 80 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {vehicles.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              Нет зарегистрированных транспортных средств
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
