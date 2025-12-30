import "dotenv/config";
import mongoose from "mongoose";
import { createBooking } from "../src/controllers/booking.controller";
import { Booking, Movie, Screen, Seat, Show, User } from "../src/models";
import { Hall } from "../src/models/hall.model";
import { SeatStatus } from "../src/@types/enums";
import { Request } from "express";

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

const runHoldPolicyTest = async () => {
  // Connect to DB
  const url = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.4uzqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  try {
    await mongoose.connect(url);
    console.log("Connected to DB");

    await User.createCollection();
    await Hall.createCollection();
    await Movie.createCollection();
    await Screen.createCollection();
    await Show.createCollection();
    await Seat.createCollection();
    await Booking.createCollection();
  } catch (error) {
    console.error("DB Connection/Setup failed", error);
  }

  let userA, userB, show, seat;
  const guestId = "guest_12345";

  try {
    // Create dummy users
    userA = await User.create({
      username: "UserA",
      email: `usera${Date.now()}@example.com`,
      password: "password123",
      role: "user",
      phone: "1234567890",
    });

    userB = await User.create({
      username: "UserB",
      email: `userb${Date.now()}@example.com`,
      password: "password123",
      role: "user",
      phone: "0987654321",
    });

    const hall = await Hall.create({
      name: `Hold Policy Hall ${Date.now()}`,
      address: "Test Address",
      ownerId: userA._id,
    });

    const movie = await Movie.create({
      title: "Hold Policy Movie",
      duration: 120,
      genre: "Action",
      releaseDate: new Date(),
      language: "English",
      director: "Test Director",
    });

    const screen = await Screen.create({
      name: "Hold Policy Screen",
      capacity: 100,
      rows: 10,
      columns: 10,
      hallId: hall._id,
      type: "2D",
    });

    show = await Show.create({
      movieId: movie._id,
      screenId: screen._id,
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 7200000),
      basePrice: 100,
      totalSeats: 100,
      bookedSeats: [],
      slot: "EVENING",
    });

    // Scenario: Seat held by GUEST_ID (User A in guest mode)
    seat = await Seat.create({
      showId: show._id,
      seatNumber: "H1",
      row: "H",
      column: 1,
      status: SeatStatus.AVAILABLE, // Initially available but held
      isHeld: true,
      heldBy: guestId, // Held by GUEST
      heldUntil: new Date(Date.now() + 5 * 60 * 1000), // Valid hold
    });

    console.log("Setup Complete: Seat held by", guestId);

    // Test 1: User B tries to book (Should Fail)
    console.log("Test 1: User B tries to book seat held by Guest...");
    const reqB = {
      body: {
        userId: userB._id,
        guestId: "guest_different",
        showId: show._id,
        screenId: screen._id,
        movieId: movie._id,
        seats: [seat._id],
      },
    } as Request;
    const resB = mockResponse();

    try {
      await createBooking(reqB, resB);
      console.log("Test 1 Result: Success (Unexpected)", resB.statusCode);
    } catch (e: any) {
      console.log("Test 1 Result: Failed (Expected)", e.message);
    }

    // Test 2: User A (Logged in) tries to book with matching Guest ID (Should Succeed)
    console.log("Test 2: User A tries to book seat with matching Guest ID...");
    const reqA = {
      body: {
        userId: userA._id,
        guestId: guestId, // Matches hold!
        showId: show._id,
        screenId: screen._id,
        movieId: movie._id,
        seats: [seat._id],
      },
    } as Request;
    const resA = mockResponse();

    try {
      await createBooking(reqA, resA);
      console.log("Test 2 Result: Success (Expected)", resA.statusCode);

      // Verify hold is transferred to User A
      const updatedSeat = await Seat.findById(seat._id);
      console.log("Updated Seat heldBy:", updatedSeat?.heldBy);
      // In createBooking, we overwrite heldBy with userId.
      // Let's check if heldBy is now userA._id

      if (
        updatedSeat?.heldBy &&
        updatedSeat.heldBy.toString() === userA._id.toString()
      ) {
        console.log("SUCCESS: Hold transferred to User A");
      } else {
        console.log(
          "FAILURE: Hold not transferred properly. HeldBy:",
          updatedSeat?.heldBy,
        );
      }
    } catch (e: any) {
      console.log("Test 2 Result: Failed (Unexpected)", e.message);
    }
  } catch (e) {
    console.error("Test execution failed", e);
  } finally {
    // Cleanup
    console.log("Cleaning up...");
    try {
      if (show) await Booking.deleteMany({ showId: show._id });
      if (show) await Seat.deleteMany({ showId: show._id });
      if (show) await Show.deleteMany({ _id: show._id });
      if (userA) await User.deleteMany({ _id: userA._id });
      if (userB) await User.deleteMany({ _id: userB._id });
      // ... other cleanups
    } catch (err) {
      console.error("Cleanup error", err);
    }
    await mongoose.disconnect();
  }
};

runHoldPolicyTest();
