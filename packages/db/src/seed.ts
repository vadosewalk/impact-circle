import "dotenv/config";
import { createDb } from "./index.js";
import * as schema from "./schema.js";
import { fakerEN_IN as faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";

const db = createDb(process.env.DATABASE_URL!);

const INDIAN_HUBS = [
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 }
];

async function main() {
  console.log("🇮🇳 Starting Massive Indian Context Seeding (2000+ records)...");

  console.log("🧹 Wiping database for fresh start...");
  await db.delete(schema.messages);
  await db.delete(schema.comments);
  await db.delete(schema.driveUpdates);
  await db.delete(schema.drives);
  await db.delete(schema.beneficiaryUpdates);
  await db.delete(schema.tenders);
  await db.delete(schema.polls);
  await db.delete(schema.categories);
  await db.delete(schema.ngo);
  await db.delete(schema.member);
  await db.delete(schema.organization);
  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.user);

  console.log("👥 Creating 500 Indian Users...");
  const users = [];
  for (let i = 0; i < 500; i++) {
    const userId = faker.string.uuid();
    users.push({
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      emailVerified: true,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      role: "user" as const,
      trustScore: faker.number.int({ min: 10, max: 200 }),
      bio: faker.helpers.arrayElement([
        "Social worker based in " + faker.location.city(),
        "Committed to local community service.",
        "Passionate about education for all.",
        "Helping hand for those in distress.",
        "Regular donor and volunteer."
      ]),
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
  }
  await db.insert(schema.user).values(users);

  console.log("🏢 Creating 100 Indian NGOs...");
  const ngoOwners = [];
  for (let i = 0; i < 100; i++) {
    const userId = faker.string.uuid();
    ngoOwners.push({
      id: userId,
      name: faker.person.fullName(),
      email: `director${i}@ngo-network.org.in`,
      emailVerified: true,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=NGO${i}`,
      role: "ngo" as const,
      trustScore: faker.number.int({ min: 150, max: 600 }),
      bio: "Registered NGO Director with focus on sustainable impact.",
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
  }
  await db.insert(schema.user).values(ngoOwners);

  const prefixes = ["Asha", "Sankalp", "Bharat", "Gramin", "Nav", "Udaan", "Jan", "Seva", "Maitri", "Pahal", "Goonj", "Sneha"];
  const suffixes = ["Trust", "Foundation", "Jan Kalyan Society", "Sahayata Group", "Relief Fund", "Charitable Trust", "Vikas Parishad"];

  const ngos = [];
  for (let i = 0; i < 100; i++) {
    const city = faker.helpers.arrayElement(INDIAN_HUBS);
    const name = `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(suffixes)} ${city.name}`;
    const ngoId = faker.string.uuid();
    const orgId = faker.string.uuid();
    
    await db.insert(schema.organization).values({
      id: orgId,
      name: name,
      slug: faker.helpers.slugify(name).toLowerCase() + "-" + faker.string.alphanumeric(5),
      logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      createdAt: new Date(),
    });

    const ngoData = {
      id: ngoId,
      userId: ngoOwners[i].id,
      organizationId: orgId,
      name: name,
      description: `Empowering communities in ${city.name} since ${faker.date.past({ years: 10 }).getFullYear()}. ` + faker.lorem.paragraphs(2),
      status: "verified" as const,
      geoRadius: faker.number.int({ min: 20, max: 300 }),
      address: faker.location.streetAddress() + ", " + city.name + ", India",
      registrationNumber: `DARPAN-${faker.string.alphanumeric(10).toUpperCase()}`,
      auditMeetLink: "https://meet.google.com/impact-circle-audit",
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    };
    await db.insert(schema.ngo).values(ngoData);
    ngos.push(ngoData);

    await db.insert(schema.member).values({
      id: faker.string.uuid(),
      organizationId: orgId,
      userId: ngoOwners[i].id,
      role: "admin",
      createdAt: new Date(),
    });
  }

  console.log("🏷️ Creating Detailed Categories...");
  const coreCategories = [
    { id: faker.string.uuid(), name: "Nutrition & Mid-day Meals", description: "Addressing hunger in schools and urban slums." },
    { id: faker.string.uuid(), name: "Healthcare & Emergency SOS", description: "Oxygen, medicines, and ambulance services." },
    { id: faker.string.uuid(), name: "Education & Literacy", description: "Providing books, laptops, and tutoring." },
    { id: faker.string.uuid(), name: "Water & Sanitation", description: "Clean water and community toilet projects." },
    { id: faker.string.uuid(), name: "Women Empowerment", description: "Vocational training and protection programs." },
    { id: faker.string.uuid(), name: "Animal Welfare", description: "Stray rescue and vaccination clinics." },
    { id: faker.string.uuid(), name: "Disaster Response", description: "Flood and crisis management kits." },
    { id: faker.string.uuid(), name: "Senior Seva", description: "Support for elderly living alone." }
  ];
  await db.insert(schema.categories).values(coreCategories);

  console.log("📋 Creating 600 Tenders (Community Needs)...");
  for (let i = 0; i < 600; i++) {
    const category = faker.helpers.arrayElement(coreCategories);
    const poster = faker.helpers.arrayElement(users);
    const hub = faker.helpers.arrayElement(INDIAN_HUBS);
    const lat = hub.lat + (Math.random() - 0.5) * 0.4;
    const lon = hub.lon + (Math.random() - 0.5) * 0.4;
    
    await db.insert(schema.tenders).values({
      id: faker.string.uuid(),
      userId: poster.id,
      title: `${faker.hacker.ingverb()} assistance required near ${hub.name}`,
      description: faker.lorem.paragraphs(2),
      categoryId: category.id,
      status: faker.helpers.weightedArrayElement([
        { weight: 85, value: "open" as const },
        { weight: 10, value: "claimed" as const },
        { weight: 5, value: "fulfilled" as const }
      ]),
      urgency: faker.helpers.weightedArrayElement([
        { weight: 20, value: "urgent" as const },
        { weight: 80, value: "normal" as const }
      ]),
      latitude: lat.toString(),
      longitude: lon.toString(),
      location: sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`,
      targetAmount: faker.number.int({ min: 5000, max: 250000 }).toString(),
      currentAmount: faker.number.int({ min: 0, max: 40000 }).toString(),
      targetVolunteers: faker.number.int({ min: 1, max: 150 }),
      createdAt: faker.date.recent({ days: 60 }),
      updatedAt: new Date(),
    });
  }

  console.log("🚗 Creating 400 Drives (NGO Initiatives)...");
  const driveThemes = [
    "Clean Ganga Mission", "Smart Classroom Initiative", "Tribal Health Camp", "Skill India Workshop",
    "Digital Literacy Drive", "Solar Power for Rural Homes", "Mangrove Reforestation", "Oxygen Plant Installation",
    "Mobile Soup Kitchen", "Stray Sterilization Drive", "Menstrual Hygiene Awareness", "Rural Housing Project"
  ];

  for (let i = 0; i < 400; i++) {
    const selectedNgo = faker.helpers.arrayElement(ngos);
    const hub = faker.helpers.arrayElement(INDIAN_HUBS);
    const lat = hub.lat + (Math.random() - 0.5) * 0.6;
    const lon = hub.lon + (Math.random() - 0.5) * 0.6;
    const theme = faker.helpers.arrayElement(driveThemes);
    
    await db.insert(schema.drives).values({
      id: faker.string.uuid(),
      ngoId: selectedNgo.id,
      title: `${theme} - ${hub.name} Sector ${i+1}`,
      description: faker.lorem.paragraphs(3),
      targetFunds: faker.number.int({ min: 100000, max: 5000000 }).toString(),
      currentFunds: faker.number.int({ min: 0, max: 200000 }).toString(),
      targetVolunteers: faker.number.int({ min: 50, max: 1000 }),
      status: "open",
      latitude: lat.toString(),
      longitude: lon.toString(),
      location: sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`,
      createdAt: faker.date.recent({ days: 45 }),
      updatedAt: new Date(),
    });
  }

  console.log("💬 Adding 1000 Social Interactions...");
  const allTenders = await db.select().from(schema.tenders);
  const allDrives = await db.select().from(schema.drives);

  for (let i = 0; i < 1000; i++) {
    const commenter = faker.helpers.arrayElement(users);
    const target = faker.helpers.arrayElement([
      { tenderId: faker.helpers.arrayElement(allTenders).id },
      { driveId: faker.helpers.arrayElement(allDrives).id }
    ]);

    await db.insert(schema.comments).values({
      id: faker.string.uuid(),
      userId: commenter.id,
      ...target,
      content: faker.helpers.arrayElement([
        "Interested in supporting from my end.",
        "Could you provide more details about the location?",
        "Jai Hind! Incredible work by the team.",
        "I can provide supplies instead of funds. Is that okay?",
        "I have shared this with my WhatsApp groups.",
        "Verified this personally, genuine need.",
        "Available for volunteering this Sunday."
      ]),
      createdAt: faker.date.recent({ days: 15 }),
    });
  }

  console.log("✅ Database Seeded Successfully with 2000+ Indian context records!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:");
  console.error(err);
  process.exit(1);
});
