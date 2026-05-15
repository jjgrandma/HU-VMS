/**
 * Adds 50 realistic HU vehicles to the database.
 * Safe to run multiple times — skips plates that already exist.
 * Run: node seed50Vehicles.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Vehicle = require('./models/Vehicle');

const vehicles = [
  // ── Buses (10) ──────────────────────────────────────────────
  {
    plateNumber: 'HU-BUS-001', model: 'Isuzu NQR Bus',        type: 'bus',     capacity: 45, status: 'available',   year: 2018, color: 'White',  fuelLevel: 88, mileage: 74200, assignedDriverName: 'Abebe Kebede',     department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4140, lng: 42.0360 },
  },
  {
    plateNumber: 'HU-BUS-002', model: 'Higer KLQ6109',        type: 'bus',     capacity: 49, status: 'in-use',      year: 2019, color: 'Blue',   fuelLevel: 62, mileage: 91500, assignedDriverName: 'Chaltu Gemechu',   department: 'Transport',  location: { name: 'Harar–HU Road', lat: 9.3600, lng: 42.0800 },
  },
  {
    plateNumber: 'HU-BUS-003', model: 'Yutong ZK6107',        type: 'bus',     capacity: 49, status: 'available',   year: 2020, color: 'White',  fuelLevel: 95, mileage: 38700, assignedDriverName: 'Dawit Tesfaye',    department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4142, lng: 42.0362 },
  },
  {
    plateNumber: 'HU-BUS-004', model: 'Isuzu NQR Bus',        type: 'bus',     capacity: 45, status: 'available',   year: 2017, color: 'Yellow', fuelLevel: 70, mileage: 112000, assignedDriverName: 'Fatuma Ahmed',    department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4138, lng: 42.0358 },
  },
  {
    plateNumber: 'HU-BUS-005', model: 'Higer KLQ6109',        type: 'bus',     capacity: 49, status: 'maintenance', year: 2016, color: 'White',  fuelLevel: 25, mileage: 145000, assignedDriverName: 'Girma Tadesse',   department: 'Transport',  location: { name: 'HU Workshop',     lat: 9.4100, lng: 42.0320 },
  },
  {
    plateNumber: 'HU-BUS-006', model: 'Yutong ZK6107',        type: 'bus',     capacity: 49, status: 'available',   year: 2021, color: 'White',  fuelLevel: 91, mileage: 22300, assignedDriverName: 'Hanan Yusuf',     department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4141, lng: 42.0361 },
  },
  {
    plateNumber: 'HU-BUS-007', model: 'Isuzu NQR Bus',        type: 'bus',     capacity: 45, status: 'in-use',      year: 2019, color: 'Blue',   fuelLevel: 54, mileage: 83400, assignedDriverName: 'Ibrahim Seid',    department: 'Transport',  location: { name: 'Haramaya Town',   lat: 9.4060, lng: 42.0410 },
  },
  {
    plateNumber: 'HU-BUS-008', model: 'Higer KLQ6109',        type: 'bus',     capacity: 49, status: 'available',   year: 2022, color: 'White',  fuelLevel: 98, mileage: 11200, assignedDriverName: 'Jemal Hussain',   department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4143, lng: 42.0363 },
  },
  {
    plateNumber: 'HU-BUS-009', model: 'Yutong ZK6107',        type: 'bus',     capacity: 49, status: 'available',   year: 2020, color: 'White',  fuelLevel: 80, mileage: 47600, assignedDriverName: 'Kebede Alemu',    department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4139, lng: 42.0359 },
  },
  {
    plateNumber: 'HU-BUS-010', model: 'Isuzu NQR Bus',        type: 'bus',     capacity: 45, status: 'out-of-service', year: 2015, color: 'Grey', fuelLevel: 10, mileage: 198000, assignedDriverName: 'Lemma Bekele',  department: 'Transport',  location: { name: 'HU Workshop',     lat: 9.4101, lng: 42.0321 },
  },

  // ── Minibuses (10) ──────────────────────────────────────────
  {
    plateNumber: 'HU-MB-001',  model: 'Toyota Coaster',       type: 'minibus', capacity: 25, status: 'available',   year: 2020, color: 'White',  fuelLevel: 87, mileage: 34500, assignedDriverName: 'Meseret Haile',   department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4140, lng: 42.0360 },
  },
  {
    plateNumber: 'HU-MB-002',  model: 'Mitsubishi Rosa',      type: 'minibus', capacity: 30, status: 'in-use',      year: 2019, color: 'White',  fuelLevel: 58, mileage: 61200, assignedDriverName: 'Negash Wolde',    department: 'Transport',  location: { name: 'Aretanya–HU Road', lat: 9.3800, lng: 42.0600 },
  },
  {
    plateNumber: 'HU-MB-003',  model: 'Hyundai County',       type: 'minibus', capacity: 28, status: 'available',   year: 2021, color: 'Silver', fuelLevel: 93, mileage: 18900, assignedDriverName: 'Omar Abdullahi',  department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4142, lng: 42.0362 },
  },
  {
    plateNumber: 'HU-MB-004',  model: 'Toyota Coaster',       type: 'minibus', capacity: 25, status: 'available',   year: 2018, color: 'White',  fuelLevel: 75, mileage: 79300, assignedDriverName: 'Petros Girma',    department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4138, lng: 42.0358 },
  },
  {
    plateNumber: 'HU-MB-005',  model: 'Mitsubishi Rosa',      type: 'minibus', capacity: 30, status: 'maintenance', year: 2017, color: 'Blue',   fuelLevel: 30, mileage: 103000, assignedDriverName: 'Rahel Tesfaye',  department: 'Transport',  location: { name: 'HU Workshop',     lat: 9.4100, lng: 42.0320 },
  },
  {
    plateNumber: 'HU-MB-006',  model: 'Hyundai County',       type: 'minibus', capacity: 28, status: 'available',   year: 2022, color: 'White',  fuelLevel: 96, mileage: 9800,  assignedDriverName: 'Samuel Bekele',   department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4141, lng: 42.0361 },
  },
  {
    plateNumber: 'HU-MB-007',  model: 'Toyota Coaster',       type: 'minibus', capacity: 25, status: 'in-use',      year: 2020, color: 'White',  fuelLevel: 48, mileage: 52100, assignedDriverName: 'Tigist Alemu',    department: 'Transport',  location: { name: 'Haramaya–HU Road', lat: 9.4200, lng: 42.0500 },
  },
  {
    plateNumber: 'HU-MB-008',  model: 'Mitsubishi Rosa',      type: 'minibus', capacity: 30, status: 'available',   year: 2021, color: 'White',  fuelLevel: 82, mileage: 27400, assignedDriverName: 'Urgessa Daba',    department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4143, lng: 42.0363 },
  },
  {
    plateNumber: 'HU-MB-009',  model: 'Hyundai County',       type: 'minibus', capacity: 28, status: 'available',   year: 2019, color: 'Yellow', fuelLevel: 71, mileage: 68700, assignedDriverName: 'Wondwosen Hailu',  department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4139, lng: 42.0359 },
  },
  {
    plateNumber: 'HU-MB-010',  model: 'Toyota Coaster',       type: 'minibus', capacity: 25, status: 'available',   year: 2023, color: 'White',  fuelLevel: 100, mileage: 3200, assignedDriverName: 'Yonas Tadesse',   department: 'Transport',  location: { name: 'HU Main Parking', lat: 9.4140, lng: 42.0360 },
  },

  // ── Cars / SUVs (15) ────────────────────────────────────────
  {
    plateNumber: 'HU-CAR-001', model: 'Toyota Land Cruiser',  type: 'car',     capacity: 7,  status: 'available',   year: 2021, color: 'White',  fuelLevel: 90, mileage: 28600, assignedDriverName: 'Zerihun Mamo',    department: 'President Office', location: { name: 'HU Admin Block', lat: 9.4150, lng: 42.0370 },
  },
  {
    plateNumber: 'HU-CAR-002', model: 'Toyota Land Cruiser',  type: 'car',     capacity: 7,  status: 'in-use',      year: 2020, color: 'Silver', fuelLevel: 65, mileage: 41200, assignedDriverName: 'Abebe Kebede',    department: 'VP Academic',      location: { name: 'Harar City',      lat: 9.3120, lng: 42.1180 },
  },
  {
    plateNumber: 'HU-CAR-003', model: 'Toyota Prado',         type: 'car',     capacity: 7,  status: 'available',   year: 2022, color: 'Black',  fuelLevel: 95, mileage: 15300, assignedDriverName: 'Chaltu Gemechu',  department: 'VP Research',      location: { name: 'HU Admin Block', lat: 9.4151, lng: 42.0371 },
  },
  {
    plateNumber: 'HU-CAR-004', model: 'Toyota Prado',         type: 'car',     capacity: 7,  status: 'available',   year: 2021, color: 'White',  fuelLevel: 88, mileage: 32100, assignedDriverName: 'Dawit Tesfaye',   department: 'Finance',          location: { name: 'HU Admin Block', lat: 9.4149, lng: 42.0369 },
  },
  {
    plateNumber: 'HU-CAR-005', model: 'Nissan Patrol',        type: 'car',     capacity: 7,  status: 'available',   year: 2020, color: 'White',  fuelLevel: 78, mileage: 47800, assignedDriverName: 'Fatuma Ahmed',    department: 'Registrar',        location: { name: 'HU Admin Block', lat: 9.4152, lng: 42.0372 },
  },
  {
    plateNumber: 'HU-CAR-006', model: 'Toyota Land Cruiser',  type: 'car',     capacity: 7,  status: 'maintenance', year: 2018, color: 'Grey',   fuelLevel: 20, mileage: 98400, assignedDriverName: 'Girma Tadesse',   department: 'Transport',        location: { name: 'HU Workshop',    lat: 9.4100, lng: 42.0320 },
  },
  {
    plateNumber: 'HU-CAR-007', model: 'Toyota Prado',         type: 'car',     capacity: 7,  status: 'available',   year: 2023, color: 'White',  fuelLevel: 100, mileage: 5100, assignedDriverName: 'Hanan Yusuf',    department: 'Dean of Students', location: { name: 'HU Admin Block', lat: 9.4150, lng: 42.0370 },
  },
  {
    plateNumber: 'HU-CAR-008', model: 'Nissan Patrol',        type: 'car',     capacity: 7,  status: 'available',   year: 2021, color: 'Black',  fuelLevel: 83, mileage: 29700, assignedDriverName: 'Ibrahim Seid',    department: 'College of Agri',  location: { name: 'HU Admin Block', lat: 9.4148, lng: 42.0368 },
  },
  {
    plateNumber: 'HU-CAR-009', model: 'Toyota Land Cruiser',  type: 'car',     capacity: 7,  status: 'in-use',      year: 2019, color: 'White',  fuelLevel: 55, mileage: 63500, assignedDriverName: 'Jemal Hussain',   department: 'College of Vet',   location: { name: 'Dire Dawa Road', lat: 9.5000, lng: 42.1500 },
  },
  {
    plateNumber: 'HU-CAR-010', model: 'Toyota Prado',         type: 'car',     capacity: 7,  status: 'available',   year: 2022, color: 'Silver', fuelLevel: 92, mileage: 18200, assignedDriverName: 'Kebede Alemu',    department: 'College of Edu',   location: { name: 'HU Admin Block', lat: 9.4153, lng: 42.0373 },
  },
  {
    plateNumber: 'HU-SUV-001', model: 'Toyota Fortuner',      type: 'suv',     capacity: 7,  status: 'available',   year: 2022, color: 'White',  fuelLevel: 94, mileage: 21400, assignedDriverName: 'Lemma Bekele',    department: 'College of Law',   location: { name: 'HU Admin Block', lat: 9.4150, lng: 42.0370 },
  },
  {
    plateNumber: 'HU-SUV-002', model: 'Toyota Fortuner',      type: 'suv',     capacity: 7,  status: 'available',   year: 2021, color: 'Black',  fuelLevel: 86, mileage: 35600, assignedDriverName: 'Meseret Haile',   department: 'College of Med',   location: { name: 'HU Admin Block', lat: 9.4151, lng: 42.0371 },
  },
  {
    plateNumber: 'HU-SUV-003', model: 'Mitsubishi Pajero',    type: 'suv',     capacity: 7,  status: 'in-use',      year: 2020, color: 'White',  fuelLevel: 60, mileage: 52300, assignedDriverName: 'Negash Wolde',    department: 'Research',         location: { name: 'Haramaya Farm',  lat: 9.4300, lng: 42.0700 },
  },
  {
    plateNumber: 'HU-SUV-004', model: 'Mitsubishi Pajero',    type: 'suv',     capacity: 7,  status: 'available',   year: 2023, color: 'Silver', fuelLevel: 99, mileage: 4200,  assignedDriverName: 'Omar Abdullahi',  department: 'Extension',        location: { name: 'HU Admin Block', lat: 9.4149, lng: 42.0369 },
  },
  {
    plateNumber: 'HU-SUV-005', model: 'Toyota Fortuner',      type: 'suv',     capacity: 7,  status: 'available',   year: 2021, color: 'White',  fuelLevel: 77, mileage: 43100, assignedDriverName: 'Petros Girma',    department: 'ICT',              location: { name: 'HU Admin Block', lat: 9.4152, lng: 42.0372 },
  },

  // ── Pickups (10) ────────────────────────────────────────────
  {
    plateNumber: 'HU-PU-001',  model: 'Toyota Hilux',         type: 'pickup',  capacity: 5,  status: 'available',   year: 2021, color: 'White',  fuelLevel: 85, mileage: 31800, assignedDriverName: 'Rahel Tesfaye',   department: 'Maintenance',      location: { name: 'HU Workshop',    lat: 9.4100, lng: 42.0320 },
  },
  {
    plateNumber: 'HU-PU-002',  model: 'Toyota Hilux',         type: 'pickup',  capacity: 5,  status: 'in-use',      year: 2020, color: 'White',  fuelLevel: 50, mileage: 58400, assignedDriverName: 'Samuel Bekele',   department: 'Maintenance',      location: { name: 'HU Farm Area',   lat: 9.4250, lng: 42.0450 },
  },
  {
    plateNumber: 'HU-PU-003',  model: 'Isuzu D-Max',          type: 'pickup',  capacity: 5,  status: 'available',   year: 2022, color: 'Grey',   fuelLevel: 90, mileage: 14200, assignedDriverName: 'Tigist Alemu',    department: 'Security',         location: { name: 'HU Main Gate',   lat: 9.4130, lng: 42.0340 },
  },
  {
    plateNumber: 'HU-PU-004',  model: 'Isuzu D-Max',          type: 'pickup',  capacity: 5,  status: 'available',   year: 2021, color: 'White',  fuelLevel: 76, mileage: 39600, assignedDriverName: 'Urgessa Daba',    department: 'Maintenance',      location: { name: 'HU Workshop',    lat: 9.4101, lng: 42.0321 },
  },
  {
    plateNumber: 'HU-PU-005',  model: 'Toyota Hilux',         type: 'pickup',  capacity: 5,  status: 'maintenance', year: 2018, color: 'Blue',   fuelLevel: 15, mileage: 107000, assignedDriverName: 'Wondwosen Hailu', department: 'Maintenance',     location: { name: 'HU Workshop',    lat: 9.4100, lng: 42.0320 },
  },
  {
    plateNumber: 'HU-PU-006',  model: 'Mitsubishi L200',      type: 'pickup',  capacity: 5,  status: 'available',   year: 2022, color: 'White',  fuelLevel: 88, mileage: 17500, assignedDriverName: 'Yonas Tadesse',   department: 'Agriculture',      location: { name: 'HU Farm Area',   lat: 9.4251, lng: 42.0451 },
  },
  {
    plateNumber: 'HU-PU-007',  model: 'Mitsubishi L200',      type: 'pickup',  capacity: 5,  status: 'available',   year: 2020, color: 'Silver', fuelLevel: 72, mileage: 46300, assignedDriverName: 'Zerihun Mamo',    department: 'Agriculture',      location: { name: 'HU Farm Area',   lat: 9.4252, lng: 42.0452 },
  },
  {
    plateNumber: 'HU-PU-008',  model: 'Toyota Hilux',         type: 'pickup',  capacity: 5,  status: 'in-use',      year: 2021, color: 'White',  fuelLevel: 44, mileage: 61700, assignedDriverName: 'Abebe Kebede',    department: 'Security',         location: { name: 'HU East Gate',   lat: 9.4160, lng: 42.0400 },
  },
  {
    plateNumber: 'HU-PU-009',  model: 'Isuzu D-Max',          type: 'pickup',  capacity: 5,  status: 'available',   year: 2023, color: 'White',  fuelLevel: 97, mileage: 6800,  assignedDriverName: 'Chaltu Gemechu',  department: 'Maintenance',      location: { name: 'HU Workshop',    lat: 9.4102, lng: 42.0322 },
  },
  {
    plateNumber: 'HU-PU-010',  model: 'Mitsubishi L200',      type: 'pickup',  capacity: 5,  status: 'available',   year: 2021, color: 'Grey',   fuelLevel: 81, mileage: 33900, assignedDriverName: 'Dawit Tesfaye',   department: 'Agriculture',      location: { name: 'HU Farm Area',   lat: 9.4253, lng: 42.0453 },
  },

  // ── Vans (5) ────────────────────────────────────────────────
  {
    plateNumber: 'HU-VAN-001', model: 'Toyota HiAce',         type: 'van',     capacity: 14, status: 'available',   year: 2021, color: 'White',  fuelLevel: 89, mileage: 26700, assignedDriverName: 'Fatuma Ahmed',    department: 'Transport',        location: { name: 'HU Main Parking', lat: 9.4140, lng: 42.0360 },
  },
  {
    plateNumber: 'HU-VAN-002', model: 'Toyota HiAce',         type: 'van',     capacity: 14, status: 'in-use',      year: 2020, color: 'White',  fuelLevel: 53, mileage: 54800, assignedDriverName: 'Girma Tadesse',   department: 'Transport',        location: { name: 'Harar Road',      lat: 9.3500, lng: 42.0900 },
  },
  {
    plateNumber: 'HU-VAN-003', model: 'Nissan Urvan',         type: 'van',     capacity: 15, status: 'available',   year: 2022, color: 'White',  fuelLevel: 94, mileage: 13400, assignedDriverName: 'Hanan Yusuf',     department: 'Transport',        location: { name: 'HU Main Parking', lat: 9.4141, lng: 42.0361 },
  },
  {
    plateNumber: 'HU-VAN-004', model: 'Nissan Urvan',         type: 'van',     capacity: 15, status: 'available',   year: 2021, color: 'Silver', fuelLevel: 79, mileage: 38200, assignedDriverName: 'Ibrahim Seid',    department: 'Transport',        location: { name: 'HU Main Parking', lat: 9.4139, lng: 42.0359 },
  },
  {
    plateNumber: 'HU-VAN-005', model: 'Toyota HiAce',         type: 'van',     capacity: 14, status: 'maintenance', year: 2017, color: 'White',  fuelLevel: 22, mileage: 121000, assignedDriverName: 'Jemal Hussain',  department: 'Transport',        location: { name: 'HU Workshop',     lat: 9.4100, lng: 42.0320 },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let added = 0;
  let skipped = 0;

  for (const v of vehicles) {
    const exists = await Vehicle.findOne({ plateNumber: v.plateNumber });
    if (exists) {
      console.log(`  ⏭  Skipped (already exists): ${v.plateNumber}`);
      skipped++;
    } else {
      await Vehicle.create(v);
      console.log(`  ✅ Added: ${v.plateNumber} – ${v.model} (${v.type}, ${v.status})`);
      added++;
    }
  }

  console.log(`\nDone — ${added} added, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
