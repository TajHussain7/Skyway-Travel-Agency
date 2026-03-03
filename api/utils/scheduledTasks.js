import cron from "node-cron";
import { archivePastBookings, archivePastFlights } from "./archiveBookings.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Settings from "../models/Settings.js";
import { sendBookingNotification } from "./emailService.js";

export const initializeScheduledTasks = () => {
  // Schedule archiving job to run daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("Running scheduled archiving job at", new Date().toISOString());
    try {
      const bookingResult = await archivePastBookings();
      const flightResult = await archivePastFlights();
      console.log(`Successfully archived:`, {
        bookings: bookingResult,
        flights: flightResult,
      });
    } catch (error) {
      console.error("Error in scheduled archiving job:", error);
    }
  });

  // Schedule flight reminder job to run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running flight reminder job at", new Date().toISOString());
    try {
      await sendFlightReminders();
    } catch (error) {
      console.error("Error in flight reminder job:", error);
    }
  });

  console.log(
    "✅ Scheduled tasks initialized: Archiving (daily at 2 AM) and Flight Reminders (hourly)",
  );
};

const sendFlightReminders = async () => {
  try {
    // Get notification settings
    const settings = await Settings.findOne();

    if (
      !settings?.notification?.emailNotifications ||
      !settings?.notification?.flightReminders
    ) {
      console.log("📧 Flight reminders are disabled in settings");
      return { sent: 0, message: "Flight reminders disabled" };
    }

    const reminderHours = settings.notification.reminderBeforeHours || 24;

    // Calculate the time window for reminders
    const now = new Date();
    const reminderTime = new Date(
      now.getTime() + reminderHours * 60 * 60 * 1000,
    );
    const nextHourTime = new Date(
      now.getTime() + (reminderHours + 1) * 60 * 60 * 1000,
    );

    // Find flights departing within the reminder window
    const upcomingFlights = await Flight.find({
      departureTime: {
        $gte: reminderTime,
        $lt: nextHourTime,
      },
      status: { $in: ["scheduled", "active"] },
      isArchived: { $ne: true },
    });

    if (upcomingFlights.length === 0) {
      console.log(`📧 No flights found departing in ${reminderHours} hours`);
      return { sent: 0, message: "No upcoming flights" };
    }

    console.log(
      `📧 Found ${upcomingFlights.length} flight(s) departing in ~${reminderHours} hours`,
    );

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each flight
    for (const flight of upcomingFlights) {
      // Find all confirmed bookings for this flight
      const bookings = await Booking.find({
        flightId: flight._id,
        status: "confirmed",
        isArchived: { $ne: true },
      }).populate("userId", "name email");

      if (bookings.length === 0) {
        console.log(`  ⏭️  No confirmed bookings for flight ${flight.number}`);
        continue;
      }

      console.log(
        `  📨 Sending reminders to ${bookings.length} passenger(s) for flight ${flight.number}`,
      );

      // Send reminder to each passenger
      for (const booking of bookings) {
        try {
          if (!booking.userId || !booking.userId.email) {
            console.log(
              `    ⚠️  Skipping booking ${booking.ticketNumber}: No user email`,
            );
            continue;
          }

          const bookingDetails = {
            ticketNumber: booking.ticketNumber,
            flightNumber: flight.number,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            airline: flight.airline,
            seatCount: booking.seatCount,
            seatNumbers: booking.seatNumbers,
            totalPrice: booking.totalPrice,
            passengers: booking.passengerDetails,
          };

          await sendBookingNotification(
            booking.userId.email,
            booking.userId.name,
            bookingDetails,
            "reminder",
            null,
          );

          emailsSent++;
          console.log(
            `    ✅ Reminder sent to ${booking.userId.email} (Ticket: ${booking.ticketNumber})`,
          );
        } catch (emailError) {
          emailsFailed++;
          console.error(
            `    ❌ Failed to send reminder to ${booking.userId.email}:`,
            emailError.message,
          );
        }
      }
    }

    const summary = {
      sent: emailsSent,
      failed: emailsFailed,
      flights: upcomingFlights.length,
      message: `Sent ${emailsSent} reminder(s) for ${upcomingFlights.length} flight(s)`,
    };

    console.log(`📧 Flight reminder job completed: ${summary.message}`);
    return summary;
  } catch (error) {
    console.error("❌ Error in sendFlightReminders:", error);
    throw error;
  }
};

export const runArchivingJobNow = async () => {
  console.log("Running archiving job manually at", new Date().toISOString());
  try {
    const bookingResult = await archivePastBookings();
    const flightResult = await archivePastFlights();
    const result = {
      bookings: bookingResult,
      flights: flightResult,
    };
    console.log("Archive job completed:", result);
    return result;
  } catch (error) {
    console.error("Error in manual archiving job:", error);
    throw error;
  }
};
