const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  carId: String,
  carName: String,
  fullname: String,
  license: String,
  age: Number,
  address: String,
  phone: String,
  pickup: String,
  drop: String,
  date: String,
  hours: Number,
  totalPrice: Number
});

module.exports = mongoose.model("Booking", bookingSchema);

const Booking = require("./models/Booking");

// BOOKING API
app.post("/book", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true, message: "Booking added!" });
  } catch (err) {
    console.log("Booking error:", err);
    res.status(500).json({ success: false });
  }
});

// FETCH BOOKING HISTORY
app.get("/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});
