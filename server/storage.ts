import { 
  employees, routes, vehicles, assignments,
  type Employee, type InsertEmployee,
  type Route, type InsertRoute,
  type Vehicle, type InsertVehicle,
  type Assignment, type InsertAssignment,
  type EmployeeWithRoute, type RouteWithDetails, type AssignmentWithDetails
} from "@shared/schema";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<EmployeeWithRoute[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Route operations
  getRoutes(): Promise<RouteWithDetails[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;

  // Assignment operations
  getAssignments(): Promise<AssignmentWithDetails[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(employeeId: number, routeId: number): Promise<boolean>;
  getAssignmentsByRoute(routeId: number): Promise<AssignmentWithDetails[]>;

  // Assignment algorithms
  autoAssignEmployees(options: {
    proximityWeight: number;
    capacityWeight: number;
    shiftWeight: number;
  }): Promise<Assignment[]>;

  // Statistics
  getStatistics(): Promise<{
    totalEmployees: number;
    activeRoutes: number;
    totalVehicles: number;
    efficiency: number;
  }>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private routes: Map<number, Route> = new Map();
  private vehicles: Map<number, Vehicle> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private currentEmployeeId = 1;
  private currentRouteId = 1;
  private currentVehicleId = 1;
  private currentAssignmentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Sample employees
    const sampleEmployees: InsertEmployee[] = [
      {
        name: "Иванов Иван Иванович",
        phone: "+7 (999) 123-45-67",
        address: "ул. Ленина, 15",
        coordinates: { lat: 55.7558, lng: 37.6176 },
        shift: "morning",
        routeId: 1,
      },
      {
        name: "Петрова Анна Сергеевна",
        phone: "+7 (999) 234-56-78",
        address: "пр. Мира, 45",
        coordinates: { lat: 55.7858, lng: 37.6376 },
        shift: "evening",
        routeId: 2,
      },
      {
        name: "Сидоров Петр Петрович",
        phone: "+7 (999) 345-67-89",
        address: "ул. Советская, 78",
        coordinates: { lat: 55.7258, lng: 37.5976 },
        shift: "morning",
        routeId: 1,
      },
    ];

    // Sample routes
    const sampleRoutes: InsertRoute[] = [
      {
        name: "Центральный район",
        driver: "Сидоров Петр Петрович",
        capacity: 15,
        departureTime: "07:30",
        stops: ["ул. Ленина, 15", "пр. Мира, 45", "ул. Советская, 78"],
        isActive: true,
      },
      {
        name: "Северный район",
        driver: "Козлов Александр Иванович",
        capacity: 20,
        departureTime: "08:00",
        stops: ["ул. Северная, 25", "пр. Победы, 12"],
        isActive: true,
      },
    ];

    // Sample vehicles
    const sampleVehicles: InsertVehicle[] = [
      {
        licensePlate: "А123БВ199",
        model: "Mercedes-Benz Sprinter",
        capacity: 15,
        routeId: 1,
        status: "active",
        notes: "В хорошем состоянии",
      },
      {
        licensePlate: "В456ГД199",
        model: "Ford Transit",
        capacity: 20,
        routeId: 2,
        status: "active",
        notes: "Требует ТО",
      },
    ];

    // Initialize data
    sampleRoutes.forEach(route => this.createRoute(route));
    sampleEmployees.forEach(employee => this.createEmployee(employee));
    sampleVehicles.forEach(vehicle => this.createVehicle(vehicle));
  }

  // Employee operations
  async getEmployees(): Promise<EmployeeWithRoute[]> {
    const employees = Array.from(this.employees.values());
    return employees.map(employee => ({
      ...employee,
      route: employee.routeId ? this.routes.get(employee.routeId) : undefined,
    }));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: new Date(),
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    // Remove assignments first
    const assignmentKey = Array.from(this.assignments.keys()).find(key => 
      this.assignments.get(key)?.employeeId === id
    );
    if (assignmentKey) {
      this.assignments.delete(assignmentKey);
    }
    
    return this.employees.delete(id);
  }

  // Route operations
  async getRoutes(): Promise<RouteWithDetails[]> {
    const routes = Array.from(this.routes.values());
    return routes.map(route => {
      const routeEmployees = Array.from(this.employees.values()).filter(
        emp => emp.routeId === route.id
      );
      const vehicle = Array.from(this.vehicles.values()).find(
        v => v.routeId === route.id
      );
      
      return {
        ...route,
        employees: routeEmployees,
        vehicle,
        occupancy: routeEmployees.length,
      };
    });
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.currentRouteId++;
    const newRoute: Route = {
      ...route,
      id,
      createdAt: new Date(),
    };
    this.routes.set(id, newRoute);
    return newRoute;
  }

  async updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined> {
    const existing = this.routes.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...route };
    this.routes.set(id, updated);
    return updated;
  }

  async deleteRoute(id: number): Promise<boolean> {
    // Update employees to remove route assignment
    Array.from(this.employees.values()).forEach(employee => {
      if (employee.routeId === id) {
        this.employees.set(employee.id, { ...employee, routeId: null });
      }
    });

    // Update vehicles to remove route assignment
    Array.from(this.vehicles.values()).forEach(vehicle => {
      if (vehicle.routeId === id) {
        this.vehicles.set(vehicle.id, { ...vehicle, routeId: null });
      }
    });

    // Remove assignments
    Array.from(this.assignments.entries()).forEach(([key, assignment]) => {
      if (assignment.routeId === id) {
        this.assignments.delete(key);
      }
    });

    return this.routes.delete(id);
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const newVehicle: Vehicle = {
      ...vehicle,
      id,
      createdAt: new Date(),
    };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existing = this.vehicles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...vehicle };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Assignment operations
  async getAssignments(): Promise<AssignmentWithDetails[]> {
    const assignments = Array.from(this.assignments.values());
    return assignments.map(assignment => {
      const employee = this.employees.get(assignment.employeeId)!;
      const route = this.routes.get(assignment.routeId)!;
      return {
        ...assignment,
        employee,
        route,
      };
    });
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const id = this.currentAssignmentId++;
    const newAssignment: Assignment = {
      ...assignment,
      id,
      assignedAt: new Date(),
    };
    
    const key = `${assignment.employeeId}-${assignment.routeId}`;
    this.assignments.set(key, newAssignment);

    // Update employee's routeId
    const employee = this.employees.get(assignment.employeeId);
    if (employee) {
      this.employees.set(assignment.employeeId, { ...employee, routeId: assignment.routeId });
    }

    return newAssignment;
  }

  async deleteAssignment(employeeId: number, routeId: number): Promise<boolean> {
    const key = `${employeeId}-${routeId}`;
    const deleted = this.assignments.delete(key);

    if (deleted) {
      // Update employee's routeId
      const employee = this.employees.get(employeeId);
      if (employee) {
        this.employees.set(employeeId, { ...employee, routeId: null });
      }
    }

    return deleted;
  }

  async getAssignmentsByRoute(routeId: number): Promise<AssignmentWithDetails[]> {
    const assignments = await this.getAssignments();
    return assignments.filter(assignment => assignment.routeId === routeId);
  }

  // Auto-assignment algorithm
  async autoAssignEmployees(options: {
    proximityWeight: number;
    capacityWeight: number;
    shiftWeight: number;
  }): Promise<Assignment[]> {
    const employees = Array.from(this.employees.values()).filter(emp => !emp.routeId);
    const routes = Array.from(this.routes.values()).filter(route => route.isActive);
    const newAssignments: Assignment[] = [];

    // Simple algorithm: assign based on weighted scoring
    for (const employee of employees) {
      let bestRoute: Route | null = null;
      let bestScore = -1;

      for (const route of routes) {
        const currentOccupancy = Array.from(this.employees.values()).filter(
          emp => emp.routeId === route.id
        ).length;

        if (currentOccupancy >= route.capacity) continue;

        let score = 0;

        // Proximity score (simplified - would need actual distance calculation)
        if (employee.coordinates && route.stops.length > 0) {
          score += options.proximityWeight * 0.8; // Mock proximity score
        }

        // Capacity score
        const capacityUtilization = currentOccupancy / route.capacity;
        score += options.capacityWeight * (1 - capacityUtilization);

        // Shift matching score
        const routeShift = route.departureTime < "12:00" ? "morning" : "evening";
        if (employee.shift === routeShift) {
          score += options.shiftWeight;
        }

        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }

      if (bestRoute) {
        const assignment = await this.createAssignment({
          employeeId: employee.id,
          routeId: bestRoute.id,
          assignmentType: "automatic",
        });
        newAssignments.push(assignment);
      }
    }

    return newAssignments;
  }

  async getStatistics(): Promise<{
    totalEmployees: number;
    activeRoutes: number;
    totalVehicles: number;
    efficiency: number;
  }> {
    const totalEmployees = this.employees.size;
    const activeRoutes = Array.from(this.routes.values()).filter(r => r.isActive).length;
    const totalVehicles = this.vehicles.size;
    
    // Calculate efficiency as percentage of assigned employees
    const assignedEmployees = Array.from(this.employees.values()).filter(emp => emp.routeId).length;
    const efficiency = totalEmployees > 0 ? Math.round((assignedEmployees / totalEmployees) * 100) : 0;

    return {
      totalEmployees,
      activeRoutes,
      totalVehicles,
      efficiency,
    };
  }
}

export const storage = new MemStorage();
