import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Property from "../src/models/Property.js";
import Booking from "../src/models/Booking.js";
import Report from "../src/models/Report.js";
import Notification from "../src/models/Notification.js";
import { LISTING_FEES } from "../src/utils/constants.js";

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
const daysFromNow = (days) => new Date(Date.now() + days * 86400000);

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
    // Rebuild indexes so the 2dsphere index matches the current schema.
    await Property.syncIndexes();

    // User.create (not insertMany) so the pre-save hook hashes each password.
    const [, owner, owner2, consumer] = await User.create([
      { name: "Amina Rahman", email: "admin@basharthikana.local", phone: "01700000001", password: "Admin123!", role: "admin", isVerified: true },
      { name: "Mahmud Karim", email: "owner@basharthikana.local", phone: "01700000002", password: "Owner123!", role: "user", isVerified: true, about: "Owner of two family buildings in Nasirabad and Khulshi." },
      { name: "Farzana Chowdhury", email: "owner2@basharthikana.local", phone: "01700000004", password: "Owner123!", role: "user", isVerified: false },
      { name: "Nafis Ahmed", email: "consumer@basharthikana.local", phone: "01700000003", password: "Consumer123!", role: "consumer", isVerified: true },
    ]);

    const approved = { verificationStatus: "approved", isPublished: true };
    const pending = { verificationStatus: "pending", isPublished: false };

    // Coordinates are GeoJSON order: [longitude, latitude].
    const propertyData = [
      {
        ...approved, verified: true, owner: owner._id, title: "Bright family flat near Nasirabad Housing",
        description: "A well-kept three-bedroom flat on the fourth floor of a quiet residential building, with good morning light and a small balcony.",
        district: "Chattogram", area: "Nasirabad", address: "Road 2, Nasirabad Housing Society",
        location: { type: "Point", coordinates: [91.8135, 22.3677] },
        type: "full-flat", gender: "any", rent: 26000, rooms: 3, bathrooms: 2, totalBeds: 3, availableBeds: 3,
        washroom: "attached", balcony: true, furnishing: "semi-furnished", availableFrom: daysFromNow(10),
        facilities: ["Gas line", "Lift", "Security guard", "Generator / IPS backup", "24/7 water supply", "Parking"],
        images: [photo("1522708323590-d24dbb6b0267"), photo("1484154218962-a197022b5858"), photo("1505691938895-1758d7feb511")],
      },
      {
        ...approved, owner: owner2._id, title: "Shared room for students near GEC Circle",
        description: "A furnished shared room in a clean student mess with Wi-Fi, meal service and individual storage for every bed.",
        district: "Chattogram", area: "GEC Circle", address: "O.R. Nizam Road, GEC",
        location: { type: "Point", coordinates: [91.8188, 22.3594] },
        type: "shared-room", gender: "male", rent: 4500, rooms: 1, bathrooms: 1, totalBeds: 3, availableBeds: 2,
        washroom: "shared", balcony: false, furnishing: "furnished", availableFrom: daysFromNow(0),
        facilities: ["Wi-Fi", "Meal service", "Security guard", "24/7 water supply"],
        images: [photo("1555854877-bab0e564b8d5"), photo("1630699144867-37acec97df5a")],
      },
      {
        ...approved, verified: true, owner: owner._id, title: "Private room with balcony in Khulshi",
        description: "A furnished single room with an attached washroom and a balcony, in a family flat with kitchen access for working professionals.",
        district: "Chattogram", area: "Khulshi", address: "South Khulshi, Road 5",
        location: { type: "Point", coordinates: [91.8087, 22.3711] },
        type: "single-room", gender: "female", rent: 9000, rooms: 1, bathrooms: 1, totalBeds: 1, availableBeds: 1,
        washroom: "attached", balcony: true, furnishing: "furnished", availableFrom: daysFromNow(5),
        facilities: ["Wi-Fi", "Kitchen access", "Geyser", "CCTV"],
        images: [photo("1540518614846-7eded433c457"), photo("1536376072261-38c75010e6c9")],
      },
      {
        ...approved, owner: owner2._id, title: "Bed in ladies' hostel, Dhanmondi",
        description: "Bed-wise rental in a managed ladies' hostel with meals, laundry and a resident warden. Close to bus routes and coaching centres.",
        district: "Dhaka", area: "Dhanmondi", address: "Road 27 (old), Dhanmondi",
        location: { type: "Point", coordinates: [90.3742, 23.7465] },
        type: "bed", gender: "female", rent: 6500, rooms: 6, bathrooms: 4, totalBeds: 18, availableBeds: 4,
        washroom: "shared", balcony: false, furnishing: "furnished", availableFrom: daysFromNow(0),
        facilities: ["Wi-Fi", "Meal service", "Laundry", "Security guard", "CCTV"],
        images: [photo("1595526114035-0d45ed16cfbf"), photo("1616594039964-ae9021a400a0")],
      },
      {
        ...pending, owner: owner._id, title: "Single room near Muradpur bus stand",
        description: "Single room with attached washroom submitted for verification. Suits a student or job holder who wants a quiet place.",
        district: "Chattogram", area: "Muradpur", address: "Muradpur, Chattogram",
        location: { type: "Point", coordinates: [91.8361, 22.3717] },
        type: "single-room", gender: "male", rent: 8000, rooms: 1, bathrooms: 1, totalBeds: 1, availableBeds: 1,
        washroom: "attached", balcony: false, furnishing: "unfurnished", availableFrom: daysFromNow(14),
        facilities: ["24/7 water supply", "Near main road"],
        images: [photo("1598928506311-c55ded91a20c")],
      },
      {
        ...pending, owner: owner2._id, title: "Two-bedroom flat in Uttara Sector 7",
        description: "A two-bedroom flat with lift and parking that is waiting for admin review before it appears in search results.",
        district: "Dhaka", area: "Uttara", address: "Sector 7, Uttara",
        type: "full-flat", gender: "any", rent: 22000, rooms: 2, bathrooms: 2, totalBeds: 2, availableBeds: 2,
        washroom: "attached", balcony: true, furnishing: "unfurnished", availableFrom: daysFromNow(20),
        facilities: ["Lift", "Parking", "Generator / IPS backup"],
        images: [photo("1502672260266-1c1ef2d93688")],
      },
    ];

    // Demo listings count as already paid, so they show up in search and the admin review queue.
    const paid = (p) => ({ ...p, payment: { status: "paid", amount: LISTING_FEES[p.type], paidAt: new Date() } });
    const [nasirabad, gec, khulshi] = await Property.create(propertyData.map(paid));

    await Booking.create([
      { consumer: consumer._id, property: nasirabad._id, requestType: "visit", status: "requested", moveInDate: daysFromNow(8), message: "Can I visit after 5 PM?" },
      { consumer: consumer._id, property: gec._id, requestType: "booking", status: "under-review", moveInDate: daysFromNow(15), message: "I need one seat from next month." },
      { consumer: consumer._id, property: khulshi._id, requestType: "visit", status: "accepted", moveInDate: daysFromNow(20), message: "Please confirm a weekend visit." },
    ]);

    await Report.create({
      reportedBy: consumer._id, property: gec._id, reason: "Property is no longer available",
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

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
