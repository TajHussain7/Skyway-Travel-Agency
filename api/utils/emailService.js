import pkg from "nodemailer";
const { createTransport } = pkg;

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, consider using services like SendGrid, AWS SES, etc.
  return createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Professional email template
const getEmailTemplate = (name, subject, response, queryMessage) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response from Skyway Travel Agency</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .query-reference {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .query-reference h3 {
            margin: 0 0 10px;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .query-reference p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }
        .response-section {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .response-section h3 {
            margin: 0 0 15px;
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }
        .response-text {
            color: #444;
            line-height: 1.8;
            font-size: 15px;
            white-space: pre-wrap;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
        }
        .contact-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .contact-info p {
            margin: 8px 0;
            color: #555;
            font-size: 14px;
        }
        .contact-info a {
            color: #667eea;
            text-decoration: none;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            font-size: 14px;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>✈️ Skyway Travel Agency</h1>
            <p>Your Trusted Travel Partner</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Dear ${name},
            </div>

            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Thank you for contacting Skyway Travel Agency. We have received your inquiry and are pleased to provide you with the following response:
            </p>

            <!-- Original Query Reference -->
            <div class="query-reference">
                <h3>📝 Your Query</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${queryMessage}</p>
            </div>

            <!-- Admin Response -->
            <div class="response-section">
                <h3>💬 Our Response</h3>
                <div class="response-text">${response}</div>
            </div>

            <div class="divider"></div>

            <p style="color: #555; line-height: 1.6;">
                If you have any further questions or need additional assistance, please don't hesitate to reach out to us. We're here to help make your travel experience exceptional!
            </p>

            <!-- Contact Information -->
            <div class="contact-info">
                <p><strong>📞 Phone:</strong> <a href="tel:+1234567890">+1 (234) 567-890</a></p>
                <p><strong>📧 Email:</strong> <a href="mailto:support@skywaytravelagency.com">support@skywaytravelagency.com</a></p>
                <p><strong>🌐 Website:</strong> <a href="https://skywaytravelagency.com">www.skywaytravelagency.com</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-weight: 600; color: #333;">Skyway Travel Agency</p>
            <p>Making Your Travel Dreams Come True Since 2020</p>
            <div class="social-links">
                <a href="#">Facebook</a> | 
                <a href="#">Twitter</a> | 
                <a href="#">Instagram</a> | 
                <a href="#">LinkedIn</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This email was sent in response to your inquiry. Please do not reply directly to this email.
            </p>
            <p style="font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} Skyway Travel Agency. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// Send response email to user
export const sendQueryResponseEmail = async (queryData, adminResponse) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Skyway Travel Agency",
        address: process.env.EMAIL_USER,
      },
      to: queryData.email,
      subject: `Re: ${queryData.subject}`,
      html: getEmailTemplate(
        queryData.name,
        queryData.subject,
        adminResponse,
        queryData.message,
      ),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Booking notification email template
const getBookingNotificationTemplate = (
  userName,
  bookingDetails,
  notificationType,
) => {
  const titles = {
    confirmation: "Booking Confirmed",
    cancellation: "Booking Cancelled",
    reminder: "Flight Reminder",
    seatChange: "Seat Assignment Update",
  };

  const icons = {
    confirmation: "✅",
    cancellation: "❌",
    reminder: "⏰",
    seatChange: "🪑",
  };

  const colors = {
    confirmation: "#10b981",
    cancellation: "#ef4444",
    reminder: "#f59e0b",
    seatChange: "#3b82f6",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titles[notificationType]} - Skyway Travel Agency</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .notification-badge {
            background-color: ${colors[notificationType]};
            color: white;
            padding: 15px 30px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .booking-details {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .booking-details h3 {
            margin: 0 0 15px;
            color: #667eea;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #666;
            font-weight: 500;
        }
        .detail-value {
            color: #333;
            font-weight: 600;
            text-align: right;
        }
        .seats-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .seat-badge {
            background-color: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
        }
        .contact-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .contact-info p {
            margin: 8px 0;
            color: #555;
            font-size: 14px;
        }
        .contact-info a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✈️ Skyway Travel Agency</h1>
            <p>Your Trusted Travel Partner</p>
        </div>
        
        <div class="notification-badge">
            ${icons[notificationType]} ${titles[notificationType]}
        </div>

        <div class="content">
            <div class="greeting">
                Dear ${userName},
            </div>

            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                ${getNotificationMessage(notificationType, bookingDetails)}
            </p>

            <div class="booking-details">
                <h3>📋 Booking Details</h3>
                ${
                  bookingDetails.ticketNumber
                    ? `<div class="detail-row">
                    <span class="detail-label">Ticket Number:</span>
                    <span class="detail-value">${bookingDetails.ticketNumber}</span>
                </div>`
                    : ""
                }
                ${
                  bookingDetails.bookingReference
                    ? `<div class="detail-row">
                    <span class="detail-label">Booking Reference:</span>
                    <span class="detail-value">${bookingDetails.bookingReference}</span>
                </div>`
                    : ""
                }
                <div class="detail-row">
                    <span class="detail-label">Flight:</span>
                    <span class="detail-value">${bookingDetails.flightNumber || "N/A"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Route:</span>
                    <span class="detail-value">${bookingDetails.origin || "N/A"} → ${bookingDetails.destination || "N/A"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Departure:</span>
                    <span class="detail-value">${bookingDetails.departureTime ? new Date(bookingDetails.departureTime).toLocaleString() : "N/A"}</span>
                </div>
                ${
                  bookingDetails.seats && bookingDetails.seats.length > 0
                    ? `<div class="detail-row">
                    <span class="detail-label">Seat(s):</span>
                    <div class="seats-list">
                        ${bookingDetails.seats.map((seat) => `<span class="seat-badge">${seat}</span>`).join("")}
                    </div>
                </div>`
                    : ""
                }
                <div class="detail-row">
                    <span class="detail-label">Passengers:</span>
                    <span class="detail-value">${bookingDetails.passengerCount || 1}</span>
                </div>
                ${
                  bookingDetails.totalPrice
                    ? `<div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">Rs. ${bookingDetails.totalPrice.toLocaleString()}</span>
                </div>`
                    : ""
                }
            </div>

            ${
              notificationType === "reminder"
                ? `<p style="color: #d97706; background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                ⚠️ <strong>Important:</strong> Please arrive at the airport at least 2 hours before departure.
            </p>`
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/user/bookings" class="action-button">
                    View My Bookings
                </a>
            </div>

            <div class="contact-info">
                <p><strong>Need Assistance?</strong></p>
                <p>📞 Phone: <a href="tel:+922345672540">+92-234-5672540</a></p>
                <p>📧 Email: <a href="mailto:info@skyway.com">info@skyway.com</a></p>
                <p>🌐 Website: <a href="https://skyway.com">www.skyway.com</a></p>
            </div>
        </div>

        <div class="footer">
            <p style="font-weight: 600; color: #333;">Skyway Travel Agency</p>
            <p>Making Your Travel Dreams Come True Since 2020</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated notification email. Please do not reply directly.
            </p>
            <p style="font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} Skyway Travel Agency. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// Helper function for notification messages
const getNotificationMessage = (type, bookingDetails) => {
  switch (type) {
    case "confirmation":
      return "Your flight booking has been successfully confirmed! We're excited to have you travel with us. Below are your booking details for your reference.";
    case "cancellation":
      const reasonText = bookingDetails.cancellationReason
        ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
             <p style="margin: 0; color: #991b1b; font-weight: 600;">Cancellation Reason:</p>
             <p style="margin: 10px 0 0; color: #7f1d1d; line-height: 1.6;">${bookingDetails.cancellationReason}</p>
           </div>`
        : "";
      return `Your booking has been cancelled. We apologize for any inconvenience this may cause. ${reasonText} If you have any questions or concerns, please contact our support team immediately.`;
    case "reminder":
      return `This is a friendly reminder that your flight is scheduled to depart soon. Please ensure you arrive at the airport with adequate time for check-in and security procedures.`;
    case "seatChange":
      return "Your seat assignment has been updated by our team. Please review the new seat details below and contact us if you have any concerns.";
    default:
      return "This is a notification regarding your booking.";
  }
};

// Send booking notification email
export const sendBookingNotification = async (
  userEmail,
  userName,
  bookingDetails,
  notificationType,
  cancellationReason = null,
) => {
  // Add cancellation reason to booking details if provided
  if (cancellationReason) {
    bookingDetails.cancellationReason = cancellationReason;
  }
  try {
    const transporter = createTransporter();

    const subjects = {
      confirmation: "✅ Booking Confirmed",
      cancellation: "Booking Cancelled",
      reminder: "⏰ Flight Reminder",
      seatChange: "Seat Assignment Update",
    };

    const mailOptions = {
      from: {
        name: "Skyway Travel Agency",
        address: process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: `${subjects[notificationType]} - ${bookingDetails.flightNumber || "Flight"} | Skyway Travel`,
      html: getBookingNotificationTemplate(
        userName,
        bookingDetails,
        notificationType,
      ),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `${notificationType} email sent successfully to ${userEmail}:`,
      info.messageId,
    );
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending booking notification:", error);
    throw new Error(`Failed to send booking notification: ${error.message}`);
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};

export default {
  sendQueryResponseEmail,
  sendBookingNotification,
  testEmailConfig,
};
