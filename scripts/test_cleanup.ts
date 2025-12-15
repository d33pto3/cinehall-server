
import "dotenv/config";
import mongoose from "mongoose";
import { cleanupExpiredBookings } from "../src/controllers/booking.controller";
import { Booking, Movie, Screen, Seat, Show, User } from "../src/models";
import { Hall } from "../src/models/hall.model";
import { SeatStatus, PaymentStatus } from "../src/@types/enums";
    
const runCleanupTest = async () => {
    // Connect to DB
    const url = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.4uzqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    try {
        await mongoose.connect(url);
        console.log("Connected to DB");
        
        // Ensure collections exist
        await User.createCollection();
        await Hall.createCollection();
        await Movie.createCollection();
        await Screen.createCollection();
        await Show.createCollection();
        await Seat.createCollection();
        await Booking.createCollection();
        
    } catch (error) {
        console.error("DB Connection/Setup failed", error);
        // process.exit(1); 
    }
    
    // Create Test Data with a PAST creation time
    let bookingId, seatId;

    try {
        // Create dummy user
        const user = await User.create({
            username: "CleanupUser",
            email: `cleanup${Date.now()}@example.com`,
            password: "password123",
            role: "user",
            phone: "1234567890" 
        });

        const hall = await Hall.create({
           name: `Cleanup Hall ${Date.now()}`,
           address: "Test Address",
           ownerId: user._id
        });

        const movie = await Movie.create({
             title: "Cleanup Movie",
             duration: 120,
             genre: "Action",
             releaseDate: new Date(),
             language: "English",
             director: "Test Director"
        });
        
        const screen = await Screen.create({
            name: "Cleanup Screen",
            capacity: 100,
            rows: 10,
            columns: 10,
            hallId: hall._id,
            type: "2D"
        }); 

        const show = await Show.create({
             movieId: movie._id,
             screenId: screen._id,
             startTime: new Date(Date.now() + 3600000), 
             endTime: new Date(Date.now() + 7200000),
             basePrice: 100,
             totalSeats: 100,
             bookedSeats: [],
             slot: "EVENING"
        });

        const seat = await Seat.create({
            showId: show._id,
            seatNumber: "C1",
            row: "C",
            column: 1,
            status: SeatStatus.BLOCKED,
            isHeld: true,
            heldBy: user._id,
            heldUntil: new Date(Date.now() - 1000) // Expired hold
        });
        
        seatId = seat._id;

        // Create an expired booking
        const booking = await Booking.create({
            userId: user._id,
            guestId: "guestC",
            showId: show._id,
            screenId: screen._id,
            movieId: movie._id,
            seats: [seat._id],
            totalPrice: 100,
            paymentStatus: PaymentStatus.PENDING,
            expiresAt: new Date(Date.now() - 1000), // Expired!
        });
        
        bookingId = booking._id;

        console.log("Expired booking created:", bookingId);

    } catch (e) {
        console.error("Setup failed", e);
        process.exit(1);
    }
    
    // Verify initial state
    const seatBefore = await Seat.findById(seatId);
    console.log("Seat Status Before Cleanup:", seatBefore?.status, "IsHeld:", seatBefore?.isHeld);

    if (seatBefore?.status !== SeatStatus.BLOCKED || !seatBefore?.isHeld) {
        console.error("Test setup failed: Seat should be BLOCKED and Held");
        process.exit(1);
    }

    // Run Cleanup
    console.log("Running cleanup...");
    await cleanupExpiredBookings();

    // Verify final state
    const seatAfter = await Seat.findById(seatId);
    const bookingAfter = await Booking.findById(bookingId);

    console.log("Seat Status After Cleanup:", seatAfter?.status, "IsHeld:", seatAfter?.isHeld);
    console.log("Booking After Cleanup:", bookingAfter);

    if (seatAfter?.status === SeatStatus.AVAILABLE && !seatAfter?.isHeld && !bookingAfter) {
        console.log("SUCCESS: Booking deleted and seat released.");
    } else {
        console.error("FAILURE: Cleanup did not work as expected.");
    }
    
    await mongoose.disconnect();
};

runCleanupTest();
