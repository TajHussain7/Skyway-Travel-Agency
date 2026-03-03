import { useEffect, useState, useCallback } from "react";
import { AnimatedTicket } from "./ui/TicketConfirmationCard";

const BookingSuccessAnimation = ({
  isVisible,
  onAnimationComplete,
  bookingDetails,
}) => {
  const [phase, setPhase] = useState(0);

  // Generate random booking ID if not provided
  const generateBookingId = useCallback(() => {
    return `SKY${Date.now().toString().slice(-10)}`;
  }, []);

  // Generate random barcode value if not provided
  const generateBarcodeValue = useCallback(() => {
    return Math.random().toString().slice(2, 16);
  }, []);

  // Default booking details with fallbacks (handle null/undefined)
  const safeBookingDetails = bookingDetails || {};
  const {
    ticketId = generateBookingId(),
    amount = 0,
    date = new Date(),
    cardHolder = "",
    last4Digits = "",
    barcodeValue = generateBarcodeValue(),
    title = "Booking Confirmed!",
    subtitle = "Your flight has been successfully booked. Get ready for your journey!",
  } = safeBookingDetails;

  useEffect(() => {
    if (isVisible) {
      setPhase(1);

      // Auto-close and complete after 5.5 seconds
      const completeTimer = setTimeout(() => {
        setPhase(2);
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
      }, 5500);

      return () => {
        clearTimeout(completeTimer);
      };
    } else {
      setPhase(0);
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible && phase === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-500 ${
        phase === 2 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => {
          setPhase(2);
          setTimeout(() => onAnimationComplete(), 500);
        }}
      />

      {/* Ticket Card */}
      <AnimatedTicket
        ticketId={ticketId}
        amount={amount}
        date={date instanceof Date ? date : new Date(date)}
        cardHolder={cardHolder}
        last4Digits={last4Digits}
        barcodeValue={barcodeValue}
        title={title}
        subtitle={subtitle}
        showPaymentInfo={!!(cardHolder && last4Digits)}
      />

      {/* Redirect indicator at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/80 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm z-20">
        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        <span className="text-sm">Redirecting to your dashboard...</span>
      </div>
    </div>
  );
};

export default BookingSuccessAnimation;
