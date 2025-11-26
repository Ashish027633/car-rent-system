const mongoose = require("mongoose");

// mongoose
//   .connect("mongodb://127.0.0.1:27017/rentcar", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB error", err));

mongoose.connect("mongodb://127.0.0.1:27017/rentcar")
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB error", err));


const carSchema = new mongoose.Schema({
  name: String,
  type: String,
  pricePerHour: Number,
  available: Boolean,
  rating: Number,
  category: String,
  description: String,
  isSport: Boolean,
});

// 
const bookingSchema = new mongoose.Schema({
  carId: Number,
  carName: String,

  // NEW FIELDS
  fullname: String,
  license: String,
  age: Number,
  address: String,
  phone: String,
  pickup: String,
  drop: String,

  durationHours: Number,
  pricePerHour: Number,
  totalCost: Number,
  date: String,
});

const Car = mongoose.model("Car", carSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Dummy user
const USER = {
  username: "admin",
  password: "1234",
};

// In-memory cars data
let nextCarId = 13;

let cars = [
  // 2-WHEELERS
  {
    id: 1,
    name: "Honda Activa",
    type: "2-wheeler",
    pricePerHour: 50,
    available: true,
    rating: 4.4,
    category: "Scooter",
    description: "Lightweight and easy to ride, perfect for daily city trips.",
    isSport: false,
  },
  {
    id: 2,
    name: "Bajaj Pulsar",
    type: "2-wheeler",
    pricePerHour: 70,
    available: true,
    rating: 4.6,
    category: "Bike",
    description: "Sporty commuter bike with good power and mileage.",
    isSport: false,
  },
  {
    id: 3,
    name: "Royal Enfield Classic 350",
    type: "2-wheeler",
    pricePerHour: 85,
    available: true,
    rating: 4.7,
    category: "Cruiser",
    description: "Iconic thump and comfort for highway rides.",
    isSport: false,
  },
  {
    id: 4,
    name: "Yamaha R15",
    type: "2-wheeler",
    pricePerHour: 120,
    available: true,
    rating: 4.8,
    category: "Sport Bike",
    description: "Sharp handling sport machine for enthusiasts.",
    isSport: true,
  },

  // NORMAL CARS / SUV
  {
    id: 5,
    name: "Hyundai i20",
    type: "4-wheeler",
    pricePerHour: 200,
    available: true,
    rating: 4.5,
    category: "Hatchback",
    description: "Premium hatchback with feature-rich interior.",
    isSport: false,
  },
  {
    id: 6,
    name: "Maruti Swift",
    type: "4-wheeler",
    pricePerHour: 180,
    available: true,
    rating: 4.3,
    category: "Hatchback",
    description: "Popular and reliable car with great mileage.",
    isSport: false,
  },
  {
    id: 7,
    name: "Tata Nexon",
    type: "4-wheeler",
    pricePerHour: 250,
    available: true,
    rating: 4.6,
    category: "SUV",
    description: "Safe and strong compact SUV for family trips.",
    isSport: false,
  },
  {
    id: 8,
    name: "Mahindra Thar",
    type: "4-wheeler",
    pricePerHour: 320,
    available: true,
    rating: 4.7,
    category: "Off-Road SUV",
    description: "Rugged off-roader, perfect for adventure drives.",
    isSport: false,
  },

  // SPORTS / PREMIUM CARS
  {
    id: 9,
    name: "BMW M4 Coupe",
    type: "4-wheeler",
    pricePerHour: 650,
    available: true,
    rating: 4.9,
    category: "Sports Coupe",
    description: "High-performance BMW with aggressive styling.",
    isSport: true,
  },
  {
    id: 10,
    name: "Audi R8",
    type: "4-wheeler",
    pricePerHour: 900,
    available: false,
    rating: 4.9,
    category: "Supercar",
    description: "Audi’s flagship mid-engine supercar with V10 power.",
    isSport: true,
  },
  {
    id: 11,
    name: "Porsche 911 Turbo",
    type: "4-wheeler",
    pricePerHour: 1100,
    available: true,
    rating: 5.0,
    category: "Supercar",
    description: "Iconic 911 with brutal acceleration and style.",
    isSport: true,
  },
  {
    id: 12,
    name: "Lamborghini Huracán",
    type: "4-wheeler",
    pricePerHour: 1500,
    available: false,
    rating: 5.0,
    category: "Supercar",
    description: "Cinematic Italian supercar, pure drama and speed.",
    isSport: true,
  },
];

let bookings = [];

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // if (username === USER.username && password === USER.password)
  if (username === "Ashish" && password === "rentcar") 
 {
    return res.json({ success: true, message: "Login successful" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// GET ALL CARS
app.get("/cars", (req, res) => {
  res.json(cars);
});

// ADD CAR (Admin)
app.post("/cars", (req, res) => {
  const { name, type, pricePerHour, available = true, category, description, isSport = false } = req.body;

  if (!name || !type || !pricePerHour) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const newCar = {
    id: nextCarId++,
    name,
    type,
    pricePerHour: Number(pricePerHour),
    available: Boolean(available),
    rating: 4.5,
    category: category || "Standard",
    description: description || "Newly added rental car.",
    isSport: Boolean(isSport),
  };

  cars.push(newCar);
  res.json({ success: true, car: newCar });
});

// TOGGLE AVAILABILITY (Admin)
app.post("/toggle-availability", (req, res) => {
  const { carId } = req.body;
  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return res.status(404).json({ success: false, message: "Car not found" });
  }

  car.available = !car.available;
  res.json({ success: true, car });
});

// CREATE BOOKING
// app.post("/book", (req, res) => {
//   const { carId, customerName, durationHours } = req.body;

//   const car = cars.find((c) => c.id === carId);
//   if (!car) {
//     return res.status(404).json({ success: false, message: "Car not found" });
//   }

//   if (!car.available) {
//     return res.status(400).json({ success: false, message: "Car not available" });
//   }

//   const bookingId = bookings.length + 1;

//   const booking = {
//     id: bookingId,
//     carId: car.id,
//     carName: car.name,
//     customerName,
//     durationHours,
//     pricePerHour: car.pricePerHour,
//     totalCost: durationHours * car.pricePerHour,
//     date: new Date().toLocaleString(),
//   };

//   bookings.push(booking);

//   // Optionally mark car unavailable
//   car.available = false;

//   res.json({ success: true, message: "Booking successful", booking });
// });
app.post("/book", (req, res) => {
  const { 
    carId,
    fullname,
    license,
    age,
    address,
    phone,
    pickup,
    drop,
    durationHours
  } = req.body;

  const car = cars.find((c) => c.id === carId);
  if (!car) return res.status(404).json({ success: false, message: "Car not found" });

  if (!car.available)
    return res.status(400).json({ success: false, message: "Car not available" });

  const bookingId = bookings.length + 1;

  const booking = {
    id: bookingId,
    carId: car.id,
    carName: car.name,

    fullname,
    license,
    age,
    address,
    phone,
    pickup,
    drop,

    durationHours,
    pricePerHour: car.pricePerHour,
    totalCost: durationHours * car.pricePerHour,
    date: new Date().toLocaleString(),
  };

  bookings.push(booking);
  car.available = false;

  res.json({ success: true, message: "Booking successful", booking });
});

// BOOKING HISTORY
app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
