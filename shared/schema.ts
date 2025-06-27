import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  coordinates: json("coordinates").$type<{ lat: number; lng: number }>(),
  shift: text("shift").notNull(), // 'morning' or 'evening'
  routeId: integer("route_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  driver: text("driver").notNull(),
  capacity: integer("capacity").notNull(),
  departureTime: text("departure_time").notNull(),
  stops: json("stops").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  licensePlate: text("license_plate").notNull().unique(),
  model: text("model").notNull(),
  capacity: integer("capacity").notNull(),
  routeId: integer("route_id"),
  status: text("status").default("active"), // 'active', 'maintenance', 'inactive'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  routeId: integer("route_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignmentType: text("assignment_type").notNull(), // 'automatic' or 'manual'
});

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

// Extended types for frontend
export type EmployeeWithRoute = Employee & {
  route?: Route;
};

export type RouteWithDetails = Route & {
  employees: Employee[];
  vehicle?: Vehicle;
  occupancy: number;
};

export type AssignmentWithDetails = Assignment & {
  employee: Employee;
  route: Route;
};
