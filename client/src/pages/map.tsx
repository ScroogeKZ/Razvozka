import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Download, Settings } from "lucide-react";
import type { EmployeeWithRoute, RouteWithDetails } from "@shared/schema";

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [showEmployees, setShowEmployees] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const { data: employees = [] } = useQuery<EmployeeWithRoute[]>({
    queryKey: ["/api/employees"],
  });

  const { data: routes = [] } = useQuery<RouteWithDetails[]>({
    queryKey: ["/api/routes"],
  });

  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
  });

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (!window.L && mapRef.current) {
        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L && mapRef.current && !map) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || map) return;

      const leafletMap = window.L.map(mapRef.current).setView([55.7558, 37.6176], 10);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      setMap(leafletMap);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.pane === 'markerPane') {
        map.removeLayer(layer);
      }
    });

    const filteredEmployees = selectedRoute 
      ? employees.filter(emp => emp.routeId === parseInt(selectedRoute))
      : employees;

    const filteredRoutes = selectedRoute 
      ? routes.filter(route => route.id === parseInt(selectedRoute))
      : routes;

    // Add employee markers
    if (showEmployees) {
      filteredEmployees.forEach((employee, index) => {
        if (employee.coordinates) {
          const marker = window.L.marker([employee.coordinates.lat, employee.coordinates.lng])
            .addTo(map);
          
          marker.bindPopup(`
            <div>
              <h3><strong>${employee.name}</strong></h3>
              <p>Адрес: ${employee.address}</p>
              <p>Смена: ${employee.shift === 'morning' ? 'Утренняя' : 'Вечерняя'}</p>
              <p>Маршрут: ${employee.route?.name || 'Не назначен'}</p>
            </div>
          `);
        }
      });
    }

    // Add route stops
    if (showStops) {
      filteredRoutes.forEach((route) => {
        route.stops.forEach((stop, index) => {
          // In a real implementation, you would geocode the address to get coordinates
          // For now, we'll place stops around the center with some offset
          const lat = 55.7558 + (Math.random() - 0.5) * 0.1;
          const lng = 37.6176 + (Math.random() - 0.5) * 0.1;
          
          const stopMarker = window.L.marker([lat, lng], {
            icon: window.L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index + 1}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).addTo(map);
          
          stopMarker.bindPopup(`
            <div>
              <h3><strong>Остановка ${index + 1}</strong></h3>
              <p>Маршрут: ${route.name}</p>
              <p>Адрес: ${stop}</p>
            </div>
          `);
        });
      });
    }

  }, [map, employees, routes, selectedRoute, showEmployees, showStops, showRoutes]);

  const stats = statistics || {
    totalEmployees: 0,
    activeRoutes: 0,
    totalVehicles: 0,
    efficiency: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Карта маршрутов</h3>
          <p className="text-slate-600">Визуализация маршрутов и расположения сотрудников</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все маршруты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все маршруты</SelectItem>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id.toString()}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Интерактивная карта</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Сотрудники</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Остановки</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-96 bg-slate-100 rounded-lg border border-slate-200" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Слои карты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="employees"
                checked={showEmployees}
                onCheckedChange={setShowEmployees}
              />
              <label htmlFor="employees" className="text-sm font-medium">
                Показать сотрудников
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stops"
                checked={showStops}
                onCheckedChange={setShowStops}
              />
              <label htmlFor="stops" className="text-sm font-medium">
                Показать остановки
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="routes"
                checked={showRoutes}
                onCheckedChange={setShowRoutes}
              />
              <label htmlFor="routes" className="text-sm font-medium">
                Показать маршруты
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Общее расстояние:</span>
              <span className="text-sm font-medium text-slate-800">245 км</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Время в пути:</span>
              <span className="text-sm font-medium text-slate-800">3ч 45м</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Остановок:</span>
              <span className="text-sm font-medium text-slate-800">
                {routes.reduce((total, route) => total + route.stops.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Сотрудников:</span>
              <span className="text-sm font-medium text-slate-800">{stats.totalEmployees}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Инструменты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">
              Оптимизировать маршруты
            </Button>
            <Button variant="outline" className="w-full bg-green-500 text-white hover:bg-green-600">
              <Download size={16} className="mr-2" />
              Экспорт карты
            </Button>
            <Button variant="outline" className="w-full">
              <Settings size={16} className="mr-2" />
              Настройки отображения
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
