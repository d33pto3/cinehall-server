import "dotenv/config";
import mongoose from "mongoose";
import { createBooking } from "../src/controllers/booking.controller";
import { Booking, Movie, Screen, Seat, Show, User } from "../src/models";
import { Hall } from "../src/models/hall.model";
import { Request } from "express";
import { SeatStatus } from "../src/@types/enums";

// Mock Express Request and Response
const mockResponse = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.body = data;
    return res;
  };
  return res;
};

const runVerification = async () => {
  // Connect to DB (using the logic from config/db/index.ts but inline for simplicity or reuse)
  // Using the same URL as in the config file but it's hardcoded there, so duplicating here is fine.
  // However, I should assume environment variables are loaded if available.
  // The previous error didn't complain about conn string, but about validation.
  const url = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.4uzqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  try {
    await mongoose.connect(url);
    console.log("Connected to DB");
  } catch (error) {
    console.error("DB Connection failed", error);
    process.exit(1);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // Create Test Data
  let user, movie, screen, show, seat, hall;
  try {
    // Create dummy user
    user = await User.create(
      [
        {
          username: "TestUser",
          email: `test${Date.now()}@example.com`,
          password: "password123",
          role: "user",
          phone: "1234567890",
        },
      ],
      { session },
    );

    // Create Hall (required by Screen)
    hall = await Hall.create(
      [
        {
          name: `Test Hall ${Date.now()}`,
          address: "Test Address",
          ownerId: user[0]._id,
        },
      ],
      { session },
    );

    movie = await Movie.create(
      [
        {
          title: "Test Movie",
          duration: 120,
          genre: "Action", // String, not array
          releaseDate: new Date(), // Fixed key name
          language: "English",
          director: "Test Director", // Added required field
        },
      ],
      { session },
    );

    screen = await Screen.create(
      [
        {
          name: "Test Screen",
          capacity: 100,
          rows: 10,
          columns: 10,
          hallId: hall[0]._id, // Required relation
          type: "2D",
        },
      ],
      { session },
    );

    show = await Show.create(
      [
        {
          movieId: movie[0]._id,
          screenId: screen[0]._id,
          startTime: new Date(Date.now() + 3600000), // 1 hour later
          endTime: new Date(Date.now() + 7200000),
          basePrice: 100,
          totalSeats: 100,
          bookedSeats: [],
          slot: "MORNING",
        },
      ],
      { session },
    );

    seat = await Seat.create(
      [
        {
          showId: show[0]._id,
          seatNumber: "A1",
          row: "A",
          column: 1,
          status: SeatStatus.AVAILABLE,
          isHeld: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    console.log("Test data created");
  } catch (e) {
    await session.abortTransaction();
    console.error("Setup failed", e);
    if (e instanceof mongoose.Error.ValidationError) {
      console.error("Validation Errors:", e.errors);
    }
    process.exit(1);
  } finally {
    session.endSession();
  }

  // Now try to book concurrently
  console.log("Starting concurrent bookings...");

  const req1 = {
    body: {
      userId: user[0]._id,
      guestId: "guest1",
      showId: show[0]._id,
      screenId: screen[0]._id,
      movieId: movie[0]._id,
      seats: [seat[0]._id],
    },
  } as Request;

  const req2 = {
    body: {
      userId: user[0]._id, // Same user or different, doesn't matter
      guestId: "guest2",
      showId: show[0]._id,
      screenId: screen[0]._id,
      movieId: movie[0]._id,
      seats: [seat[0]._id],
    },
  } as Request;

  const res1 = mockResponse();
  const res2 = mockResponse();

  try {
    const p1 = createBooking(req1, res1);
    const p2 = createBooking(req2, res2);

    const results = await Promise.allSettled([p1, p2]);

    console.log("Results:");
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        console.log(
          `Req ${i + 1}: Success (Status: ${i === 0 ? res1.statusCode : res2.statusCode})`,
        );
        if (i === 0 && res1.statusCode !== 201)
          console.log(`Req 1 Payload:`, res1.body);
        if (i === 1 && res2.statusCode !== 201)
          console.log(`Req 2 Payload:`, res2.body);
      } else {
        console.log(`Req ${i + 1}: Failed (${r.reason})`);
      }
    });

    // Verification logic
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    if (successCount === 1) {
      console.log("SUCCESS: Only one booking succeeded.");
    } else if (successCount === 0) {
      console.log("FAILURE: Both failed.");
    } else {
      console.log("FAILURE: Race condition occurred! Both bookings succeeded.");
    }
  } catch (e) {
    console.error("Execution error", e);
  } finally {
    // Cleanup
    console.log("Cleaning up...");
    try {
      if (show && show[0]) await Booking.deleteMany({ showId: show[0]._id });
      if (show && show[0]) await Seat.deleteMany({ showId: show[0]._id });
      if (show && show[0]) await Show.deleteMany({ _id: show[0]._id });
      if (screen && screen[0]) await Screen.deleteMany({ _id: screen[0]._id });
      if (hall && hall[0]) await Hall.deleteMany({ _id: hall[0]._id });
      if (movie && movie[0]) await Movie.deleteMany({ _id: movie[0]._id });
      if (user && user[0]) await User.deleteMany({ _id: user[0]._id });
    } catch (err) {
      console.error("Cleanup error", err);
    }
    await mongoose.disconnect();
  }
};

runVerification();
