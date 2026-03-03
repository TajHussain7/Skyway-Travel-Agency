import { useState } from "react";
import axios from "axios";
import SuccessToast from "./SuccessToast";

const PackageBookingModal = ({ offer, onClose, onSuccess }) => {
  const [personCount, setPersonCount] = useState(1);
  const [passengers, setPassengers] = useState([
    {
      name: "",
      age: "",
      gender: "male",
      email: "",
      phone: "",
      passportNumber: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handlePersonCountChange = (count) => {
    const newCount = parseInt(count);
    setPersonCount(newCount);

    // Adjust passengers array
    if (newCount > passengers.length) {
      const newPassengers = [...passengers];
      for (let i = passengers.length; i < newCount; i++) {
        newPassengers.push({
          name: "",
          age: "",
          gender: "male",
          email: "",
          phone: "",
          passportNumber: "",
        });
      }
      setPassengers(newPassengers);
    } else {
      setPassengers(passengers.slice(0, newCount));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const calculateTotalPrice = () => {
    if (offer.priceUnit === "per person") {
      return offer.price * personCount;
    }
    return offer.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        packageOfferId: offer._id,
        personCount,
        passengers: passengers.map((p) => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender,
          email: p.email || undefined,
          phone: p.phone || undefined,
          passportNumber: p.passportNumber || undefined,
        })),
      };

      const response = await axios.post(
        "http://localhost:8080/api/booking/package/create",
        bookingData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setToastMessage(
          `Booking created successfully! Your booking reference is ${
            response.data.data?.bookingReference ||
            "SKY-" + offer._id.slice(-8).toUpperCase()
          }`
        );
        setShowToast(true);

        // Close modal and call success after toast animation
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to create booking. Please try again.";
      setToastMessage(errorMsg);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessToast
        isVisible={showToast}
        title={
          toastMessage.includes("successfully") ? "Booking Confirmed!" : "Error"
        }
        message={toastMessage}
        duration={toastMessage.includes("successfully") ? 5000 : 4000}
        onClose={() => setShowToast(false)}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Book Package</h2>
                <p className="text-sm text-gray-100 mt-1">{offer.name}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Package Summary */}
            <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">{offer.name}</h3>
                  <p className="text-sm text-gray-600">{offer.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {offer.priceUnit === "percentage"
                      ? `${offer.price}% OFF`
                      : `$${offer.price.toLocaleString()}`}
                  </div>
                  <div className="text-sm text-gray-600">{offer.priceUnit}</div>
                </div>
              </div>
            </div>

            {/* Person Count */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Persons *
              </label>
              <select
                required
                value={personCount}
                onChange={(e) => handlePersonCountChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "Person" : "Persons"}
                  </option>
                ))}
              </select>
            </div>

            {/* Passenger Details */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Passenger Details
              </h3>
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Passenger {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Muhammad Ali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="120"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        required
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(index, "gender", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) =>
                          handlePassengerChange(index, "email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="skyway@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) =>
                          handlePassengerChange(index, "phone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={passenger.passportNumber}
                        onChange={(e) =>
                          handlePassengerChange(
                            index,
                            "passportNumber",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="AB1234567"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="bg-gradient-to-r from-success to-green-700 text-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Total Amount</p>
                  <p className="text-xs opacity-75 mt-1">
                    {personCount} {personCount === 1 ? "person" : "persons"}
                  </p>
                </div>
                <div className="text-3xl font-bold">
                  ${calculateTotalPrice().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-success to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PackageBookingModal;
