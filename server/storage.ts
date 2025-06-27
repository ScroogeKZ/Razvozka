import {
  employees,
  routes,
  vehicles,
  assignments,
  type Employee,
  type Route,
  type Vehicle,
  type Assignment,
  type InsertEmployee,
  type InsertRoute,
  type InsertVehicle,
  type InsertAssignment,
  type EmployeeWithRoute,
  type RouteWithDetails,
  type AssignmentWithDetails,
} from "@shared/schema";

import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<EmployeeWithRoute[]> {
    const result = await db.query.employees.findMany({
      with: {
        route: true,
      },
    });
    return result as EmployeeWithRoute[];
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values({
        ...employee,
        phone: employee.phone || null,
        coordinates: employee.coordinates || null,
        routeId: employee.routeId || null,
        createdAt: new Date(),
      })
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set({
        ...employee,
        phone: employee.phone || null,
        coordinates: employee.coordinates || null,
        routeId: employee.routeId || null,
      })
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    // First remove from assignments
    await db.delete(assignments).where(eq(assignments.employeeId, id));
    
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.rowCount > 0;
  }

  async getRoutes(): Promise<RouteWithDetails[]> {
    const routesList = await db.query.routes.findMany({
      with: {
        employees: true,
        vehicle: true,
      },
    });

    return routesList.map(route => ({
      ...route,
      occupancy: route.employees.length,
      employees: route.employees,
      vehicle: route.vehicle || undefined,
    }));
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db
      .insert(routes)
      .values({
        ...route,
        stops: route.stops || null,
        isActive: route.isActive !== undefined ? route.isActive : true,
        createdAt: new Date(),
      })
      .returning();
    return newRoute;
  }

  async updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined> {
    const [updated] = await db
      .update(routes)
      .set({
        ...route,
        stops: route.stops || null,
        isActive: route.isActive !== undefined ? route.isActive : undefined,
      })
      .where(eq(routes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRoute(id: number): Promise<boolean> {
    // First remove assignments and update employees
    await db.delete(assignments).where(eq(assignments.routeId, id));
    await db.update(employees).set({ routeId: null }).where(eq(employees.routeId, id));
    await db.update(vehicles).set({ routeId: null }).where(eq(vehicles.routeId, id));
    
    const result = await db.delete(routes).where(eq(routes.id, id));
    return result.rowCount > 0;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db
      .insert(vehicles)
      .values({
        ...vehicle,
        routeId: vehicle.routeId || null,
        status: vehicle.status || null,
        notes: vehicle.notes || null,
        createdAt: new Date(),
      })
      .returning();
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set({
        ...vehicle,
        routeId: vehicle.routeId || null,
        status: vehicle.status || null,
        notes: vehicle.notes || null,
      })
      .where(eq(vehicles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }

  async getAssignments(): Promise<AssignmentWithDetails[]> {
    const result = await db.query.assignments.findMany({
      with: {
        employee: true,
        route: true,
      },
    });
    return result as AssignmentWithDetails[];
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        ...assignment,
        createdAt: new Date(),
      })
      .returning();
    return newAssignment;
  }

  async deleteAssignment(employeeId: number, routeId: number): Promise<boolean> {
    const result = await db
      .delete(assignments)
      .where(
        sql`${assignments.employeeId} = ${employeeId} AND ${assignments.routeId} = ${routeId}`
      );
    return result.rowCount > 0;
  }

  async getAssignmentsByRoute(routeId: number): Promise<AssignmentWithDetails[]> {
    const result = await db.query.assignments.findMany({
      where: eq(assignments.routeId, routeId),
      with: {
        employee: true,
        route: true,
      },
    });
    return result as AssignmentWithDetails[];
  }

  async autoAssignEmployees(options: {
    proximityWeight: number;
    capacityWeight: number;
    shiftWeight: number;
  }): Promise<Assignment[]> {
    // Get all unassigned employees and available routes
    const unassignedEmployees = await db.select().from(employees).where(sql`${employees.routeId} IS NULL`);
    const availableRoutes = await this.getRoutes();
    
    const newAssignments: Assignment[] = [];
    
    for (const employee of unassignedEmployees) {
      let bestRoute: RouteWithDetails | null = null;
      let bestScore = -1;
      
      for (const route of availableRoutes) {
        if (route.occupancy >= route.capacity) continue;
        
        let score = 0;
        
        // Capacity score
        const capacityScore = (route.capacity - route.occupancy) / route.capacity;
        score += capacityScore * options.capacityWeight;
        
        // Proximity score (simplified - in real app would use actual coordinates)
        const proximityScore = 0.5; // Placeholder
        score += proximityScore * options.proximityWeight;
        
        // Shift matching score
        const shiftScore = employee.shift === 'morning' && route.departureTime < '12:00' ? 1 : 0.5;
        score += shiftScore * options.shiftWeight;
        
        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }
      
      if (bestRoute) {
        const assignment = await this.createAssignment({
          employeeId: employee.id,
          routeId: bestRoute.id,
          assignmentType: 'automatic',
        });
        newAssignments.push(assignment);
        
        // Update employee route
        await this.updateEmployee(employee.id, { routeId: bestRoute.id });
        bestRoute.occupancy++;
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
    const [employeeCount] = await db.select({ count: sql<number>`count(*)` }).from(employees);
    const [routeCount] = await db.select({ count: sql<number>`count(*)` }).from(routes).where(eq(routes.isActive, true));
    const [vehicleCount] = await db.select({ count: sql<number>`count(*)` }).from(vehicles);
    const [assignedCount] = await db.select({ count: sql<number>`count(*)` }).from(employees).where(sql`${employees.routeId} IS NOT NULL`);
    
    const efficiency = employeeCount.count > 0 ? (assignedCount.count / employeeCount.count) * 100 : 0;
    
    return {
      totalEmployees: employeeCount.count,
      activeRoutes: routeCount.count,
      totalVehicles: vehicleCount.count,
      efficiency: Math.round(efficiency),
    };
  }
}

export const storage = new DatabaseStorage();