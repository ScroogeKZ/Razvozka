import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AssignmentAlgorithms } from "@/components/assignment-algorithms";
import { Wand2, Plus, X, User } from "lucide-react";
import { getShiftLabel, getShiftColor } from "@/lib/assignment-utils";
import type { InsertAssignment, AssignmentWithDetails, EmployeeWithRoute, RouteWithDetails } from "@shared/schema";

export default function Assignments() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<AssignmentWithDetails[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: employees = [] } = useQuery<EmployeeWithRoute[]>({
    queryKey: ["/api/employees"],
  });

  const { data: routes = [] } = useQuery<RouteWithDetails[]>({
    queryKey: ["/api/routes"],
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: InsertAssignment) => {
      const response = await apiRequest("POST", "/api/assignments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Назначение создано",
        description: "Сотрудник успешно назначен на маршрут",
      });
      setSelectedEmployee("");
      setSelectedRoute("");
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать назначение",
        variant: "destructive",
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async ({ employeeId, routeId }: { employeeId: number; routeId: number }) => {
      await apiRequest("DELETE", `/api/assignments/${employeeId}/${routeId}`);
    },
    onSuccess: () => {
      toast({
        title: "Назначение удалено",
        description: "Сотрудник снят с маршрута",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить назначение",
        variant: "destructive",
      });
    },
  });

  const handleManualAssignment = () => {
    if (!selectedEmployee || !selectedRoute) {
      toast({
        title: "Ошибка",
        description: "Выберите сотрудника и маршрут",
        variant: "destructive",
      });
      return;
    }

    createAssignmentMutation.mutate({
      employeeId: parseInt(selectedEmployee),
      routeId: parseInt(selectedRoute),
      assignmentType: "manual",
    });
  };

  const handleRemoveAssignment = (employeeId: number, routeId: number) => {
    deleteAssignmentMutation.mutate({ employeeId, routeId });
  };

  // Get unassigned employees
  const unassignedEmployees = employees.filter(emp => !emp.routeId);

  // Group assignments by route
  const assignmentsByRoute = routes.map(route => {
    const routeAssignments = assignments.filter(assignment => assignment.routeId === route.id);
    return {
      ...route,
      assignments: routeAssignments,
    };
  });

  // Filter assignments by route and shift
  const filteredAssignments = assignmentsByRoute.filter(item => {
    const matchesRoute = routeFilter === "all" || !routeFilter || item.id === parseInt(routeFilter);
    const matchesShift = shiftFilter === "all" || !shiftFilter || item.assignments.some(assignment => 
      assignment.employee.shift === shiftFilter
    );
    return matchesRoute && matchesShift;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Управление назначениями</h3>
          <p className="text-slate-600">Автоматическое и ручное назначение сотрудников на маршруты</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-green-500 hover:bg-green-600">
            <Wand2 size={16} className="mr-2" />
            Автораспределение
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Ручное назначение
          </Button>
        </div>
      </div>

      {/* Auto Assignment Panel */}
      <AssignmentAlgorithms />

      {/* Manual Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Ручное назначение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Выберите сотрудника</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({getShiftLabel(employee.shift)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Назначить на маршрут</label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите маршрут" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name} ({route.occupancy}/{route.capacity} мест)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={handleManualAssignment}
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? "Назначается..." : "Назначить"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedEmployee("");
                setSelectedRoute("");
              }}
            >
              Отмена
            </Button>
          </div>
          
          {unassignedEmployees.length === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Все сотрудники назначены на маршруты
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Текущие назначения</CardTitle>
            <div className="flex space-x-3">
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Все маршруты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все маршруты</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Все смены" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все смены</SelectItem>
                  <SelectItem value="morning">Утренняя</SelectItem>
                  <SelectItem value="evening">Вечерняя</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <div className="space-y-6">
              {filteredAssignments.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-slate-800">{item.name}</h5>
                    <div className="flex items-center space-x-3">
                      <Badge className={
                        item.occupancy >= item.capacity 
                          ? "bg-red-100 text-red-800" 
                          : item.occupancy >= item.capacity * 0.8
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }>
                        Заполнен: {item.occupancy}/{item.capacity}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {item.departureTime < "12:00" ? "Утренняя смена" : "Вечерняя смена"}
                      </Badge>
                    </div>
                  </div>
                  
                  {item.assignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="text-blue-600" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{assignment.employee.name}</p>
                            <p className="text-xs text-slate-500">{assignment.employee.address}</p>
                            <Badge className={`${getShiftColor(assignment.employee.shift)} text-xs mt-1`}>
                              {getShiftLabel(assignment.employee.shift)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(assignment.employeeId, assignment.routeId)}
                            className="text-red-600 hover:text-red-800 ml-auto"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      Нет назначенных сотрудников
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {filteredAssignments.length === 0 && !assignmentsLoading && (
            <div className="text-center py-8 text-slate-500">
              Нет назначений для отображения
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
