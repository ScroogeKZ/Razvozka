import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";
import { EmployeeForm } from "@/components/forms/employee-form";
import { getShiftLabel, getShiftColor } from "@/lib/assignment-utils";
import type { InsertEmployee, EmployeeWithRoute } from "@shared/schema";

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery<EmployeeWithRoute[]>({
    queryKey: ["/api/employees"],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник добавлен",
        description: "Сотрудник успешно добавлен в систему",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сотрудника",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник удален",
        description: "Сотрудник успешно удален из системы",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сотрудника",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = !shiftFilter || employee.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  const handleSubmit = (data: InsertEmployee) => {
    createEmployeeMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Управление сотрудниками</h3>
          <p className="text-slate-600">Добавление, редактирование и назначение сотрудников</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Добавить нового сотрудника</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Список сотрудников</CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Поиск сотрудника..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Все смены" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все смены</SelectItem>
                  <SelectItem value="morning">Утренняя</SelectItem>
                  <SelectItem value="evening">Вечерняя</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Смена</TableHead>
                  <TableHead>Маршрут</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{employee.name}</div>
                          <div className="text-sm text-slate-500">{employee.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">{employee.address}</TableCell>
                    <TableCell>
                      <Badge className={getShiftColor(employee.shift)}>
                        {getShiftLabel(employee.shift)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">
                      {employee.route?.name || "Не назначен"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredEmployees.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm || shiftFilter ? "Сотрудники не найдены" : "Нет сотрудников"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
