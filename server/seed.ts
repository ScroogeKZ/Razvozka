import { db } from "./db";
import { employees, routes, vehicles, assignments } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Sample routes
    const [route1, route2] = await db
      .insert(routes)
      .values([
        {
          name: "Центральный район",
          driver: "Сидоров Петр Иванович",
          capacity: 15,
          departureTime: "07:30",
          stops: ["ул. Ленина", "пр. Советский", "пл. Центральная"],
          isActive: true,
          createdAt: new Date(),
        },
        {
          name: "Северный район",
          driver: "Козлов Андрей Викторович",
          capacity: 12,
          departureTime: "18:00",
          stops: ["пр. Мира", "ул. Северная", "мкр. Заречный"],
          isActive: true,
          createdAt: new Date(),
        },
      ])
      .returning();

    // Sample employees
    await db
      .insert(employees)
      .values([
        {
          name: "Иванов Иван Иванович",
          phone: "+7 (912) 345-67-89",
          address: "ул. Ленина, 15",
          coordinates: { lat: 55.7558, lng: 37.6173 },
          shift: "morning",
          routeId: route1.id,
          createdAt: new Date(),
        },
        {
          name: "Петрова Анна Сергеевна",
          phone: "+7 (913) 456-78-90",
          address: "пр. Мира, 42",
          coordinates: { lat: 55.7665, lng: 37.6156 },
          shift: "evening",
          routeId: route2.id,
          createdAt: new Date(),
        },
        {
          name: "Сидоров Петр Алексеевич",
          phone: "+7 (914) 567-89-01",
          address: "ул. Центральная, 8",
          coordinates: { lat: 55.7512, lng: 37.6184 },
          shift: "morning",
          routeId: null,
          createdAt: new Date(),
        },
      ]);

    // Sample vehicles
    await db
      .insert(vehicles)
      .values([
        {
          licensePlate: "А123БВ199",
          model: "Mercedes-Benz Sprinter",
          capacity: 15,
          routeId: route1.id,
          status: "active",
          notes: "Плановое ТО через 2 недели",
          createdAt: new Date(),
        },
        {
          licensePlate: "Х456УТ199",
          model: "Ford Transit",
          capacity: 12,
          routeId: route2.id,
          status: "active",
          notes: null,
          createdAt: new Date(),
        },
      ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };