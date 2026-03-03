import * as React from "react";
import { cn } from "../../lib/utils";

// --- SVG Icons ---

const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MastercardIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="36"
    height="24"
  >
    <circle cx="8" cy="12" r="7" fill="#EA001B"></circle>
    <circle cx="16" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"></circle>
  </svg>
);

const PlaneIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

// --- Helper Components ---

const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-gray-200"
    aria-hidden="true"
  />
);

const Barcode = ({ value }) => {
  const hashCode = (s) =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  const seed = hashCode(value);
  const random = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth =
    bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 70;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for value ${value}`}
        className="fill-current text-gray-800"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return (
            <rect key={index} x={x} y="10" width={bar.width} height="50" />
          );
        })}
      </svg>
      <p className="text-sm text-gray-500 tracking-[0.3em] mt-2">{value}</p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const confettiCount = 100;
  const colors = [
    "#667eea",
    "#764ba2",
    "#22c55e",
    "#eab308",
    "#8b5cf6",
    "#f97316",
  ];

  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti-fall ${2.5 + Math.random() * 2.5}s ${
                Math.random() * 2
              }s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// --- Main Ticket Component ---

const AnimatedTicket = React.forwardRef(
  (
    {
      className,
      ticketId,
      amount,
      date,
      cardHolder,
      last4Digits,
      barcodeValue,
      title = "Booking Confirmed!",
      subtitle = "Your flight has been successfully booked",
      showPaymentInfo = true,
      icon,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      const mountTimer = setTimeout(() => setShowConfetti(true), 100);
      const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(",", " •");

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-white text-gray-800 rounded-2xl shadow-2xl font-sans z-10",
            "animate-[popup-enter_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]",
            className
          )}
          {...props}
        >
          {/* Ticket cut-out effect */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100" />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Icon with Skyway branding */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary-dark rounded-full animate-[zoom-in_0.5s_ease-out_0.3s_forwards] opacity-0 scale-50">
              {icon || <CheckCircleIcon className="w-10 h-10 text-white" />}
            </div>

            {/* Skyway Brand */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <PlaneIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                SKYWAY
              </span>
            </div>

            <h1 className="text-2xl font-semibold mt-3 text-gray-800">
              {title}
            </h1>
            <p className="text-gray-500 mt-1">{subtitle}</p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            <DashedLine />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Booking ID
                </p>
                <p className="font-mono font-medium text-gray-700">
                  {ticketId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Amount
                </p>
                <p className="font-semibold text-lg text-primary">
                  {formattedAmount}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Date & Time
              </p>
              <p className="font-medium text-gray-700">{formattedDate}</p>
            </div>

            {showPaymentInfo && cardHolder && last4Digits && (
              <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
                <MastercardIcon />
                <div>
                  <p className="font-semibold text-gray-700">{cardHolder}</p>
                  <p className="text-gray-500 font-mono text-sm tracking-wider">
                    •••• {last4Digits}
                  </p>
                </div>
              </div>
            )}

            <DashedLine />

            <Barcode value={barcodeValue} />

            {/* Footer message */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Thank you for choosing Skyway Travel Agency
              </p>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes popup-enter {
              0% {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            
            @keyframes zoom-in {
              0% {
                opacity: 0;
                transform: scale(0.5);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export { AnimatedTicket };
