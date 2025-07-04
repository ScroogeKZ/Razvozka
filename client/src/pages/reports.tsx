import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Download, Filter, FileBarChart } from "lucide-react";
import { downloadAsJSON, downloadAsCSV, generateReportHTML, printReport } from "@/lib/export-utils";
import type { RouteWithDetails, EmployeeWithRoute, Vehicle } from "@shared/schema";

export default function Reports() {
  const [period, setPeriod] = useState("today");
  const [routeFilter, setRouteFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("excel");
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [includeAddresses, setIncludeAddresses] = useState(true);
  const [includeSchedules, setIncludeSchedules] = useState(false);
  const [includeContacts, setIncludeContacts] = useState(false);

  const { toast } = useToast();

  const { data: routes = [] } = useQuery<RouteWithDetails[]>({
    queryKey: ["/api/routes"],
  });

  const { data: employees = [] } = useQuery<EmployeeWithRoute[]>({
    queryKey: ["/api/employees"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
  });

  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/export/excel");
      return response.json();
    },
    onSuccess: (data) => {
      downloadAsJSON(data, `route-report-${new Date().toISOString().split('T')[0]}.json`);
      toast({
        title: "Отчет экспортирован",
        description: "Данные экспортированы в формате JSON",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/export/pdf");
      return response.json();
    },
    onSuccess: (data) => {
      const htmlContent = generateReportHTML({
        routes,
        employees,
        vehicles,
        statistics: statistics || { totalEmployees: 0, activeRoutes: 0, totalVehicles: 0, efficiency: 0 },
      });
      printReport(htmlContent);
      toast({
        title: "Отчет сформирован",
        description: "Отчет открыт в новом окне для печати",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка генерации отчета",
        description: "Не удалось сформировать PDF отчет",
        variant: "destructive",
      });
    },
  });

  const handleExportExcel = () => {
    if (exportFormat === "excel") {
      exportExcelMutation.mutate();
    } else {
      // Export as CSV
      const csvData = routes.map(route => ({
        name: route.name,
        driver: route.driver,
        capacity: route.capacity,
        occupancy: route.occupancy,
        departureTime: route.departureTime,
        efficiency: Math.round((route.occupancy / route.capacity) * 100),
        vehicle: route.vehicle?.licensePlate || "Не назначен",
      }));
      
      downloadAsCSV(csvData, `routes-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Данные экспортированы",
        description: "Маршруты экспортированы в формате CSV",
      });
    }
  };

  const handleExportPdf = () => {
    exportPdfMutation.mutate();
  };

  const handleGenerateReport = () => {
    toast({
      title: "Отчет обновлен",
      description: "Данные отчета обновлены с учетом выбранных фильтров",
    });
  };

  // Filter data based on selections
  const filteredRoutes = routes.filter(route => {
    const matchesRoute = routeFilter === "all" || !routeFilter || route.id === parseInt(routeFilter);
    const matchesShift = shiftFilter === "all" || !shiftFilter || route.departureTime < "12:00" ? "morning" === shiftFilter : "evening" === shiftFilter;
    return matchesRoute && matchesShift;
  });

  const reportData = filteredRoutes.map(route => ({
    name: route.name,
    vehicle: route.vehicle?.licensePlate || "Не назначен",
    driver: route.driver,
    employees: route.occupancy,
    efficiency: route.capacity > 0 ? Math.round((route.occupancy / route.capacity) * 100) : 0,
    departureTime: route.departureTime,
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Отчеты и экспорт</h3>
          <p className="text-slate-600">Генерация отчетов по маршрутам и назначениям</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={handleExportExcel}
            disabled={exportExcelMutation.isPending}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Экспорт Excel
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600"
            onClick={handleExportPdf}
            disabled={exportPdfMutation.isPending}
          >
            <FileText size={16} className="mr-2" />
            Экспорт PDF
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Параметры отчета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Период</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">Текущая неделя</SelectItem>
                  <SelectItem value="month">Текущий месяц</SelectItem>
                  <SelectItem value="custom">Выбрать период</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Маршрут</label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger>
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Смена</label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
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
          
          <div className="flex space-x-4">
            <Button onClick={handleGenerateReport}>
              <Filter size={16} className="mr-2" />
              Сформировать отчет
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setPeriod("today");
                setRouteFilter("all");
                setShiftFilter("all");
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates and Export Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Готовые шаблоны</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between p-4 h-auto"
                onClick={handleExportExcel}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Отчет по маршрутам</p>
                    <p className="text-sm text-slate-500">Список всех маршрутов и назначений</p>
                  </div>
                </div>
                <Download className="text-slate-400" size={16} />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between p-4 h-auto"
                onClick={() => {
                  const csvData = employees.map(emp => ({
                    name: emp.name,
                    phone: emp.phone || "",
                    address: emp.address,
                    shift: emp.shift === "morning" ? "Утренняя" : "Вечерняя",
                    route: emp.route?.name || "Не назначен",
                  }));
                  downloadAsCSV(csvData, `employees-${new Date().toISOString().split('T')[0]}.csv`);
                  toast({ title: "Данные экспортированы", description: "Список сотрудников экспортирован" });
                }}
              >
                <div className="flex items-center space-x-3">
                  <FileBarChart className="text-green-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Отчет по сотрудникам</p>
                    <p className="text-sm text-slate-500">Детальная информация о каждом сотруднике</p>
                  </div>
                </div>
                <Download className="text-slate-400" size={16} />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between p-4 h-auto"
                onClick={handleExportPdf}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-purple-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Аналитический отчет</p>
                    <p className="text-sm text-slate-500">Статистика и показатели эффективности</p>
                  </div>
                </div>
                <Download className="text-slate-400" size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки экспорта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Формат файла</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="format" 
                      value="excel" 
                      checked={exportFormat === "excel"}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="text-primary"
                    />
                    <span className="text-sm text-slate-700">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="format" 
                      value="pdf" 
                      checked={exportFormat === "pdf"}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="text-primary"
                    />
                    <span className="text-sm text-slate-700">PDF (.pdf)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Включить в отчет</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="personal-data"
                      checked={includePersonalData}
                      onCheckedChange={(checked) => setIncludePersonalData(checked === true)}
                    />
                    <label htmlFor="personal-data" className="text-sm text-slate-700">
                      Личные данные сотрудников
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addresses"
                      checked={includeAddresses}
                      onCheckedChange={(checked) => setIncludeAddresses(checked === true)}
                    />
                    <label htmlFor="addresses" className="text-sm text-slate-700">
                      Адреса остановок
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="schedules"
                      checked={includeSchedules}
                      onCheckedChange={(checked) => setIncludeSchedules(checked === true)}
                    />
                    <label htmlFor="schedules" className="text-sm text-slate-700">
                      Время посадки/высадки
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="contacts"
                      checked={includeContacts}
                      onCheckedChange={(checked) => setIncludeContacts(checked === true)}
                    />
                    <label htmlFor="contacts" className="text-sm text-slate-700">
                      Контактные данные
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Предварительный просмотр отчета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Маршрут</TableHead>
                  <TableHead>Транспорт</TableHead>
                  <TableHead>Водитель</TableHead>
                  <TableHead>Сотрудники</TableHead>
                  <TableHead>Загруженность</TableHead>
                  <TableHead>Время</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.vehicle}</TableCell>
                    <TableCell>{item.driver}</TableCell>
                    <TableCell>{item.employees} человек</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.efficiency} className="w-16" />
                        <span className="text-sm text-slate-600">{item.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.departureTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {reportData.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
