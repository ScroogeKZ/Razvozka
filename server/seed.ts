import { db } from "./db";
import { employees, routes, vehicles, assignments } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Sample routes for Kazakhstan (Astana/Almaty)
    const [route1, route2] = await db
      .insert(routes)
      .values([
        {
          name: "Есіл-Алматы районы",
          driver: "Нұрланов Серик Болатұлы",
          capacity: 18,
          departureTime: "07:30",
          stops: ["Кунаев көшесі", "Назарбаев даңғылы", "Республика алаңы", "Қайрат көшесі"],
          isActive: true,
          createdAt: new Date(),
        },
        {
          name: "Сарыарқа районы",
          driver: "Жақсылықов Бауыржан Ерланұлы",
          capacity: 15,
          departureTime: "18:00",
          stops: ["Тұран даңғылы", "Мәңгілік Ел даңғылы", "Кабанбай батыр көшесі"],
          isActive: true,
          createdAt: new Date(),
        },
      ])
      .returning();

    // Sample employees with Kazakh names
    await db
      .insert(employees)
      .values([
        {
          name: "Ахметов Нұрлан Серікұлы",
          phone: "+7 (701) 234-56-78",
          address: "Кунаев көшесі, 25",
          coordinates: { lat: 51.1694, lng: 71.4491 },
          shift: "morning",
          routeId: route1.id,
          createdAt: new Date(),
        },
        {
          name: "Сәрсенова Айгүл Мұхтарқызы",
          phone: "+7 (702) 345-67-89",
          address: "Тұран даңғылы, 14/1",
          coordinates: { lat: 51.1801, lng: 71.4460 },
          shift: "evening",
          routeId: route2.id,
          createdAt: new Date(),
        },
        {
          name: "Жұмабеков Ержан Қанатұлы",
          phone: "+7 (705) 456-78-90",
          address: "Мәңгілік Ел даңғылы, 55",
          coordinates: { lat: 51.1605, lng: 71.4704 },
          shift: "morning",
          routeId: null,
          createdAt: new Date(),
        },
      ]);

    // Sample vehicles with Kazakhstan license plates
    await db
      .insert(vehicles)
      .values([
        {
          licensePlate: "555 AKX 02",
          model: "Mercedes-Benz Sprinter",
          capacity: 18,
          routeId: route1.id,
          status: "active",
          notes: "Жоспарлы техникалық қызмет көрсету - 2 апта",
          createdAt: new Date(),
        },
        {
          licensePlate: "777 NUR 01",
          model: "Hyundai County",
          capacity: 15,
          routeId: route2.id,
          status: "active",
          notes: "Жаңа автобус - 2024 жыл",
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