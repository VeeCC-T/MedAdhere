import React from "react";

const Premium = () => {
  const handlePayment = () => {
    // Simulate Paystack test checkout
    window.location.href = "https://paystack.com/pay/testcheckout";
  };

  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <h2>Upgrade to MedAdhere Premium 🌟</h2>
      <p>
        Unlock <strong>unlimited medications</strong>, <strong>ADR reports</strong>,
        and future <strong>cloud sync</strong> features.
      </p>
      <h3>₦2,500 / month</h3>
      <button
        onClick={handlePayment}
        style={{
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Pay with Paystack 💳
      </button>
      <p style={{ marginTop: "1rem", color: "#555" }}>
        Secure checkout powered by Paystack.
      </p>
    </div>
  );
};

export default Premium;
