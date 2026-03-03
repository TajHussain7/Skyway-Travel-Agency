import { useState, useEffect } from "react";
import axios from "axios";

const SeatSelectionModal = ({
  isOpen,
  onClose,
  flight,
  seatCount,
  onConfirm,
}) => {
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && flight) {
      loadBookedSeats();
    }
  }, [isOpen, flight]);

  useEffect(() => {
    if (flight) {
      generateSeatMap();
    }
  }, [flight, bookedSeats]);

  const loadBookedSeats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/booking/flight/${flight._id}/seats`,
        {
          withCredentials: true,
        }
      );
      const booked = response.data.bookedSeats || [];
      setBookedSeats(booked);
    } catch (error) {
      console.error("Error loading booked seats:", error);
      setBookedSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSeatMap = () => {
    if (!flight) return;

    const rows = Math.ceil(flight.totalSeats / 6);
    const seatLayout = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 6; col++) {
        const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
        const seatIndex = (row - 1) * 6 + col + 1;

        if (seatIndex <= flight.totalSeats) {
          const isBooked = bookedSeats.includes(seatNumber);
          rowSeats.push({
            number: seatNumber,
            index: seatIndex,
            status: isBooked ? "booked" : "available",
          });
        }
      }
      seatLayout.push(rowSeats);
    }

    setSeatMap(seatLayout);
  };

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") return;

    if (selectedSeats.includes(seat.number)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.number));
    } else {
      if (selectedSeats.length < seatCount) {
        setSelectedSeats([...selectedSeats, seat.number]);
      }
    }
  };

  const getSeatClass = (seat) => {
    const baseClass =
      "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer";

    if (seat.status === "booked") {
      return `${baseClass} bg-gray-400 border-gray-500 text-white cursor-not-allowed opacity-60`;
    }

    if (selectedSeats.includes(seat.number)) {
      return `${baseClass} bg-blue-500 border-blue-600 text-white hover:bg-blue-600 ring-2 ring-blue-300`;
    }

    return `${baseClass} bg-green-500 border-green-600 text-white hover:bg-green-600`;
  };

  const handleConfirm = () => {
    if (selectedSeats.length === seatCount) {
      onConfirm(selectedSeats);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-chair"></i>
                Select Your Seats
              </h2>
              <p className="mt-1 text-white/90">
                Choose {seatCount} seat{seatCount > 1 ? "s" : ""} for your
                flight
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Flight Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Flight</p>
              <p className="text-lg font-bold text-gray-900">
                {flight?.number}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Route</p>
              <p className="text-lg font-bold text-gray-900">
                {flight?.origin} → {flight?.destination}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedSeats.length} / {seatCount}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-b bg-white">
          <div className="flex gap-6 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded ring-2 ring-blue-300"></div>
              <span className="text-sm text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500 rounded opacity-60"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-inner">
              {/* Cockpit */}
              <div className="mb-6 text-center">
                <div className="inline-block bg-gradient-to-b from-gray-700 to-gray-600 text-white px-8 py-3 rounded-t-full shadow-lg">
                  <i className="fas fa-plane text-xl"></i>
                  <p className="text-xs mt-1">Cockpit</p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex flex-col items-center space-y-2">
                {seatMap.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {/* Left side (A, B, C) */}
                    {row.slice(0, 3).map((seat, seatIndex) => (
                      <button
                        key={seatIndex}
                        onClick={() => handleSeatClick(seat)}
                        className={getSeatClass(seat)}
                        title={`Seat ${seat.number} - ${seat.status}`}
                        disabled={seat.status === "booked"}
                      >
                        {seat.number}
                      </button>
                    ))}

                    {/* Aisle */}
                    <div className="w-6 sm:w-8 flex items-center justify-center text-gray-400">
                      <div className="h-full w-1 bg-gray-200"></div>
                    </div>

                    {/* Right side (D, E, F) */}
                    {row.slice(3, 6).map((seat, seatIndex) => (
                      <button
                        key={seatIndex + 3}
                        onClick={() => handleSeatClick(seat)}
                        className={getSeatClass(seat)}
                        title={`Seat ${seat.number} - ${seat.status}`}
                        disabled={seat.status === "booked"}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Selected Seats Display */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Selected Seats:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-between items-center sticky bottom-0">
          <div className="text-sm text-gray-600">
            {selectedSeats.length < seatCount ? (
              <span className="text-orange-600 font-medium">
                Please select {seatCount - selectedSeats.length} more seat
                {seatCount - selectedSeats.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                <i className="fas fa-check-circle mr-1"></i>
                All seats selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedSeats.length !== seatCount}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedSeats.length === seatCount
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
