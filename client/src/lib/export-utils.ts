export function downloadAsJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Handle nested objects and arrays
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      // Escape commas and quotes
      return stringValue.includes(",") || stringValue.includes('"') 
        ? `"${stringValue.replace(/"/g, '""')}"` 
        : stringValue;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateReportHTML(data: {
  routes: any[];
  employees: any[];
  vehicles: any[];
  statistics: any;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчет по маршрутам</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-item { text-align: center; padding: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Отчет по маршрутам развозки сотрудников</h1>
        <p>Дата формирования: ${new Date().toLocaleDateString("ru-RU")}</p>
    </div>
    
    <div class="stats">
        <div class="stat-item">
            <h3>${data.statistics.totalEmployees}</h3>
            <p>Всего сотрудников</p>
        </div>
        <div class="stat-item">
            <h3>${data.statistics.activeRoutes}</h3>
            <p>Активных маршрутов</p>
        </div>
        <div class="stat-item">
            <h3>${data.statistics.totalVehicles}</h3>
            <p>Транспортных средств</p>
        </div>
        <div class="stat-item">
            <h3>${data.statistics.efficiency}%</h3>
            <p>Эффективность</p>
        </div>
    </div>

    <h2>Маршруты</h2>
    <table>
        <thead>
            <tr>
                <th>Название</th>
                <th>Водитель</th>
                <th>Вместимость</th>
                <th>Время отправления</th>
                <th>Загруженность</th>
            </tr>
        </thead>
        <tbody>
            ${data.routes.map(route => `
                <tr>
                    <td>${route.name}</td>
                    <td>${route.driver}</td>
                    <td>${route.capacity}</td>
                    <td>${route.departureTime}</td>
                    <td>${route.occupancy}/${route.capacity} (${Math.round((route.occupancy / route.capacity) * 100)}%)</td>
                </tr>
            `).join("")}
        </tbody>
    </table>

    <h2>Сотрудники</h2>
    <table>
        <thead>
            <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Адрес</th>
                <th>Смена</th>
                <th>Маршрут</th>
            </tr>
        </thead>
        <tbody>
            ${data.employees.map(employee => `
                <tr>
                    <td>${employee.name}</td>
                    <td>${employee.phone || "—"}</td>
                    <td>${employee.address}</td>
                    <td>${employee.shift === "morning" ? "Утренняя" : "Вечерняя"}</td>
                    <td>${employee.route?.name || "Не назначен"}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>

    <h2>Транспорт</h2>
    <table>
        <thead>
            <tr>
                <th>Государственный номер</th>
                <th>Модель</th>
                <th>Вместимость</th>
                <th>Статус</th>
                <th>Примечания</th>
            </tr>
        </thead>
        <tbody>
            ${data.vehicles.map(vehicle => `
                <tr>
                    <td>${vehicle.licensePlate}</td>
                    <td>${vehicle.model}</td>
                    <td>${vehicle.capacity}</td>
                    <td>${vehicle.status}</td>
                    <td>${vehicle.notes || "—"}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>
</body>
</html>
  `;
}

export function printReport(htmlContent: string) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
