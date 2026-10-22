const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Report = require("../models/Report");
const Notification = require("../models/Notification");

dotenv.config();

async function run() {
  await connectDB();
  try {
    await Promise.all([
      Booking.deleteMany({}),
      Report.deleteMany({}),
      Notification.deleteMany({}),
      Property.deleteMany({}),
      User.deleteMany({ email: { $regex: /@basharthikana\.local$/ } }),
    ]);

    const admin = await User.create({
      name: "Amina Rahman", email: "admin@basharthikana.local", phone: "01700000001",
      password: "Admin123!", role: "admin", isVerified: true,
    });
    const owner = await User.create({
      name: "Mahmud Karim", email: "owner@basharthikana.local", phone: "01700000002",
      password: "Owner123!", role: "user", isVerified: true,
    });
    const owner2 = await User.create({
      name: "Farzana Chowdhury", email: "owner2@basharthikana.local", phone: "01700000004",
      password: "Owner123!", role: "user", isVerified: true,
    });
    const consumer = await User.create({
      name: "Nafis Ahmed", email: "consumer@basharthikana.local", phone: "01700000003",
      password: "Consumer123!", role: "consumer", isVerified: true,
    });

    const propertyData = [
      {
        owner: owner._id, title: "Nasirabad Garden Flat", description: "A bright two-bedroom apartment with cross ventilation, balcony, lift access and a quiet residential setting. Illustrative demo listing.",
        propertyType: "flat", address: "Road 4, Nasirabad Housing Society, Chattogram", area: "Nasirabad", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8135, 22.3677] }, monthlyRent: 18500, deposit: 18500,
        suitableFor: ["family", "professional"], facilities: ["Lift", "Parking", "Gas", "Balcony", "Security"],
        images: ["/demo/property-1.svg", "/demo/property-1b.svg"], availableUnits: 1, verificationStatus: "approved", isPublished: true,
        rooms: [{ roomName: "Whole flat", roomType: "apartment", monthlyRent: 18500, totalCapacity: 1, availableCapacity: 1 }],
      },
      {
        owner: owner2._id, title: "GEC Corner Shared Home", description: "A furnished shared home near everyday services with Wi-Fi, common lounge and individual storage. Illustrative demo listing.",
        propertyType: "shared-room", address: "O.R. Nizam Road, GEC, Chattogram", area: "GEC", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8188, 22.3594] }, monthlyRent: 6500, deposit: 3000,
        suitableFor: ["bachelor", "student", "professional"], facilities: ["Wi-Fi", "Furnished", "Water", "Security", "Cleaning"],
        images: ["/demo/property-2.svg", "/demo/property-2b.svg"], availableUnits: 2, verificationStatus: "approved", isPublished: true,
        rooms: [{ roomName: "Shared Room A", roomType: "shared", monthlyRent: 6500, totalCapacity: 3, availableCapacity: 2 }],
      },
      {
        owner: owner._id, title: "Agrabad Compact Studio", description: "A compact studio designed for a single working professional, with attached bath and kitchenette. Illustrative demo listing.",
        propertyType: "studio", address: "Commercial Area, Agrabad, Chattogram", area: "Agrabad", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8018, 22.3266] }, monthlyRent: 12000, deposit: 12000,
        suitableFor: ["professional", "bachelor"], facilities: ["Attached bath", "Kitchen", "Security", "Generator"],
        images: ["/demo/property-3.svg"], availableUnits: 1, verificationStatus: "approved", isPublished: true,
        rooms: [{ roomName: "Studio 3B", roomType: "studio", monthlyRent: 12000, totalCapacity: 1, availableCapacity: 1 }],
      },
      {
        owner: owner2._id, title: "Khulshi Family Apartment", description: "Spacious three-bedroom family apartment with parking and a separate dining area. Illustrative demo listing.",
        propertyType: "flat", address: "South Khulshi, Chattogram", area: "Khulshi", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8087, 22.3711] }, monthlyRent: 28000, deposit: 28000,
        suitableFor: ["family"], facilities: ["Parking", "Lift", "Generator", "Balcony", "CCTV"],
        images: ["/demo/property-4.svg"], availableUnits: 1, verificationStatus: "approved", isPublished: true,
        rooms: [{ roomName: "Whole flat", roomType: "apartment", monthlyRent: 28000, totalCapacity: 1, availableCapacity: 1 }],
      },
      {
        owner: owner._id, title: "Muradpur Single Room", description: "Single room with attached washroom submitted for verification. Illustrative demo listing.",
        propertyType: "single-room", address: "Muradpur, Chattogram", area: "Muradpur", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8361, 22.3717] }, monthlyRent: 8000, deposit: 4000,
        suitableFor: ["bachelor", "student", "professional"], facilities: ["Attached bath", "Water", "Security"],
        images: ["/demo/property-5.svg"], availableUnits: 1, verificationStatus: "pending", isPublished: false,
      },
      {
        owner: owner2._id, title: "Panchlaish Sublet", description: "A sublet room with a shared kitchen currently waiting for admin review. Illustrative demo listing.",
        propertyType: "sublet", address: "Panchlaish, Chattogram", area: "Panchlaish", city: "Chattogram",
        location: { type: "Point", coordinates: [91.8250, 22.3635] }, monthlyRent: 9000, deposit: 5000,
        suitableFor: ["female", "professional", "student"], facilities: ["Wi-Fi", "Kitchen", "Balcony"],
        images: ["/demo/property-6.svg"], availableUnits: 1, verificationStatus: "pending", isPublished: false,
      },
    ];

    const properties = await Property.insertMany(propertyData);
    const [nasirabad, gec, agrabad] = properties;

    await Booking.create([
      { consumer: consumer._id, property: nasirabad._id, requestType: "visit", status: "requested", moveInDate: new Date(Date.now() + 8 * 86400000), message: "Can I visit after 5 PM?" },
      { consumer: consumer._id, property: gec._id, requestType: "booking", status: "under-review", moveInDate: new Date(Date.now() + 15 * 86400000), message: "I need one seat from next month." },
      { consumer: consumer._id, property: agrabad._id, requestType: "visit", status: "accepted", moveInDate: new Date(Date.now() + 20 * 86400000), message: "Please confirm a weekend visit." },
    ]);

    await Report.create({
      reportedBy: consumer._id, property: gec._id, reason: "Availability may be stale",
      details: "Consumer requested that the owner reconfirm the vacancy.", status: "open",
    });

    console.log("\nDemo dataset created.\n");
    console.log("Admin:    admin@basharthikana.local / Admin123!");
    console.log("Owner:    owner@basharthikana.local / Owner123!");
    console.log("Consumer: consumer@basharthikana.local / Consumer123!\n");
  } finally {
    await mongoose.connection.close();
  }
}

run().catch((error) => { console.error(error); process.exit(1); });
