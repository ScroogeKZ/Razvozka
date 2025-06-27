import type { Employee, Route } from "@shared/schema";

export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  // Haversine formula for calculating distance between two coordinates
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findOptimalRoute(
  employee: Employee,
  routes: Route[],
  options: {
    proximityWeight: number;
    capacityWeight: number;
    shiftWeight: number;
  }
): Route | null {
  let bestRoute: Route | null = null;
  let bestScore = -1;

  for (const route of routes) {
    if (!route.isActive) continue;

    let score = 0;

    // Proximity score (simplified)
    if (employee.coordinates) {
      // In a real implementation, this would calculate actual distances to route stops
      score += (options.proximityWeight / 100) * 0.8; // Mock proximity score
    }

    // Capacity score
    // In a real implementation, this would check current occupancy
    score += (options.capacityWeight / 100) * 0.7; // Mock capacity score

    // Shift matching score
    const routeShift = route.departureTime < "12:00" ? "morning" : "evening";
    if (employee.shift === routeShift) {
      score += options.shiftWeight / 100;
    }

    if (score > bestScore) {
      bestScore = score;
      bestRoute = route;
    }
  }

  return bestRoute;
}

export function getRouteEfficiency(route: Route, assignedEmployees: Employee[]): number {
  if (route.capacity === 0) return 0;
  return Math.round((assignedEmployees.length / route.capacity) * 100);
}

export function getShiftLabel(shift: string): string {
  switch (shift) {
    case "morning":
      return "Утренняя";
    case "evening":
      return "Вечерняя";
    default:
      return shift;
  }
}

export function getShiftColor(shift: string): string {
  switch (shift) {
    case "morning":
      return "bg-green-100 text-green-800";
    case "evening":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
