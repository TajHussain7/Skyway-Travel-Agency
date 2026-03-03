import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TicketViewer = ({ booking, isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    if (booking && isOpen) {
      generateQRCode();
    }
  }, [booking, isOpen]);

  const generateQRCode = async () => {
    if (!booking) return;

    const isPackage = booking.bookingType === "package";
    const passengerDetails = booking.passengerDetails || [];
    const currentPassenger =
      passengerDetails[booking.currentPassengerIndex || 0] ||
      passengerDetails[0];

    // Create a unique ticket data string for QR code
    const ticketData = JSON.stringify({
      ticketId: booking._id,
      bookingRef: `SKY-${booking._id?.slice(-8).toUpperCase()}`,
      passenger: currentPassenger?.name || booking.userId?.name || "N/A",
      type: isPackage ? "package" : "flight",
      ...(isPackage
        ? {
            packageName: booking.packageOfferId?.name,
            category: booking.packageOfferId?.category,
            duration: booking.packageOfferId?.duration,
            persons: booking.personCount,
          }
        : {
            flight: booking.flightId?.number,
            from: booking.flightId?.origin,
            to: booking.flightId?.destination,
            date: booking.flightId?.departureTime,
            seats: booking.seatCount,
          }),
      status: booking.status,
      verified: true,
    });

    try {
      const url = await QRCode.toDataURL(ticketData, {
        width: 150,
        margin: 1,
        color: {
          dark: "#1a1a2e",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: ticketRef.current.scrollWidth,
        windowHeight: ticketRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // Ticket dimensions (boarding pass style - landscape)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [210, 106], // A4 width, adjusted height for new ticket size
      });

      pdf.addImage(imgData, "PNG", 0, 0, 210, 106);

      // Create filename from passenger name (sanitize for valid filename)
      const currentPassengerName =
        currentPassenger?.name || booking.userId?.name || "Ticket";
      const passengerFileName = currentPassengerName
        .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .trim();

      pdf.save(`${passengerFileName}_${bookingRef}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !booking) return null;

  const isPackage = booking.bookingType === "package";
  const bookingRef = `SKY-${
    booking._id?.slice(-8).toUpperCase() || "00000000"
  }`;

  // Get passenger details
  const passengerDetails = booking.passengerDetails || [];
  const currentPassenger =
    passengerDetails[booking.currentPassengerIndex || 0] || passengerDetails[0];
  const passengerName = currentPassenger?.name || booking.userId?.name || "N/A";
  const totalPassengers = passengerDetails.length;

  // Flight-specific variables
  const flightNumber = booking.flightId?.number || "N/A";
  const origin = booking.flightId?.origin || "N/A";
  const destination = booking.flightId?.destination || "N/A";
  const departureTime = booking.flightId?.departureTime;
  const arrivalTime = booking.flightId?.arrivalTime;
  const airline = booking.flightId?.airline || "SkyWay Airlines";
  const seatCount = booking.seatCount || 1;

  // Package-specific variables
  const packageName = booking.packageOfferId?.name || "Package Offer";
  const packageCategory = booking.packageOfferId?.category || "Package";
  const packageDuration = booking.packageOfferId?.duration || "N/A";
  const packageDescription = booking.packageOfferId?.description || "";
  const personCount = booking.personCount || 1;

  // Common variables
  const totalPrice = booking.totalPrice || 0;
  const status = booking.status || "confirmed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full z-10">
        {/* Modal Header */}
        <div
          className={`bg-gradient-to-r ${
            isPackage
              ? "from-purple-500 to-purple-700"
              : "from-primary to-primary-dark"
          } text-white p-4 flex justify-between items-center rounded-t-2xl`}
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas ${
                isPackage ? "fa-tags" : "fa-ticket-alt"
              } text-2xl`}
            ></i>
            <div>
              <h2 className="text-xl font-bold">
                {isPackage ? "Your Package Receipt" : "Your Flight Ticket"}
              </h2>
              <p className="text-sm text-white/80">Booking Ref: {bookingRef}</p>
              {totalPassengers > 1 && (
                <p className="text-xs text-white/70 mt-1">
                  Passenger {(booking.currentPassengerIndex || 0) + 1} of{" "}
                  {totalPassengers}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadTicket}
              disabled={downloading}
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Ticket Preview */}
        <div className="p-6 bg-gray-100">
          {/* Actual Ticket - Fixed dimensions for proper rendering */}
          <div
            ref={ticketRef}
            className="bg-white rounded-xl overflow-hidden shadow-lg mx-auto"
            style={{ width: "750px", height: "380px" }}
          >
            <div className="flex h-full">
              {/* Left Section - Main Info */}
              <div
                className="flex-1 p-6 flex flex-col"
                style={{ width: "550px" }}
              >
                {/* Header with Logo */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${
                        isPackage
                          ? "from-purple-500 to-purple-700"
                          : "from-primary to-primary-dark"
                      } rounded-xl flex items-center justify-center shadow-md`}
                    >
                      {isPackage ? (
                        <svg
                          className="w-7 h-7 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-7 h-7 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-primary tracking-tight">
                        SKYWAY
                      </h1>
                      <p className="text-xs text-gray-500 -mt-0.5">
                        Travel Agency
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      status === "confirmed"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : status === "pending"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {status.toUpperCase()}
                  </div>
                </div>

                {isPackage ? (
                  /* Package Details - Center section */
                  <>
                    <div className="flex-1 flex flex-col justify-center py-4">
                      <div className="text-center mb-4">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                          {packageName}
                        </h2>
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-box-open text-purple-600"></i>
                            <span className="text-lg font-semibold">
                              {packageCategory}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-clock text-purple-600"></i>
                            <span className="text-lg font-semibold">
                              {packageDuration}
                            </span>
                          </div>
                        </div>
                      </div>
                      {packageDescription && (
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                          <p className="text-sm text-gray-700 text-center">
                            {packageDescription}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Package Details - Footer */}
                    <div className="grid grid-cols-4 gap-4 pt-4 mt-auto border-t-2 border-dashed border-gray-200">
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Passenger
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {passengerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Booking Date
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Persons
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {personCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {packageDuration}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Flight Details - Center section */
                  <>
                    <div className="flex-1 flex items-center py-4">
                      <div className="flex items-center justify-between w-full">
                        {/* Origin */}
                        <div className="text-left">
                          <p className="text-4xl font-bold text-gray-800">
                            {origin}
                          </p>
                          <p className="text-lg text-gray-600 font-medium">
                            {formatTime(departureTime)}
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Departure
                          </p>
                        </div>

                        {/* Flight Path */}
                        <div className="flex-1 px-6">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-full h-[2px] bg-gradient-to-r from-gray-200 via-primary to-gray-200"></div>
                            <div className="relative bg-white px-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p className="text-center text-sm text-gray-600 font-semibold mt-2">
                            {flightNumber}
                          </p>
                        </div>

                        {/* Destination */}
                        <div className="text-right">
                          <p className="text-4xl font-bold text-gray-800">
                            {destination}
                          </p>
                          <p className="text-lg text-gray-600 font-medium">
                            {formatTime(arrivalTime)}
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Arrival
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Passenger & Flight Details - Footer */}
                    <div className="grid grid-cols-4 gap-4 pt-4 mt-auto border-t-2 border-dashed border-gray-200">
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Passenger
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {passengerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Date
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {formatDate(departureTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Seat Number
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {booking.seatNumbers && booking.seatNumbers.length > 0
                            ? booking.seatNumbers.join(", ")
                            : seatCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                          Airline
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {airline}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Divider with cut-out effect */}
              <div className="relative w-6 flex flex-col items-center justify-center bg-white">
                <div className="absolute -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
                <div className="h-full border-l-2 border-dashed border-gray-300"></div>
                <div className="absolute -bottom-3 w-6 h-6 bg-gray-100 rounded-full"></div>
              </div>

              {/* Right Section - QR & Booking Info */}
              <div className="w-44 bg-gradient-to-b from-gray-50 to-white p-4 flex flex-col items-center justify-between">
                {/* QR Code */}
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Ticket QR Code"
                      className="w-28 h-28"
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center bg-gray-100 rounded">
                      <i className="fas fa-qrcode text-4xl text-gray-300"></i>
                    </div>
                  )}
                </div>

                {/* Booking Reference */}
                <div className="text-center mt-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Booking Ref
                  </p>
                  <p className="text-base font-bold text-primary font-mono">
                    {bookingRef}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center pt-3 border-t border-gray-200 w-full">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Total Fare
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-500 rounded-b-2xl">
          <p>
            <i className="fas fa-info-circle mr-1"></i>
            {isPackage
              ? "Please keep this receipt for your records. Contact us for any package-related queries."
              : "Please present this ticket (printed or digital) at the airport check-in counter."}
          </p>
          <p className="text-xs mt-1">
            SkyWay Travel Agency • support@skyway.com •{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketViewer;
