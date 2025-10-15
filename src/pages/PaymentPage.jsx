import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get plan details from Upgrade page
  const { planName, price } = location.state || {
    planName: "Pro",
    price: 4.99,
  };

  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handleConfirmPayment = () => {
    alert("✅ Payment successful! You are now a Premium user.");
    navigate("/premium");
  };

  const handleBack = () => {
    navigate("/upgrade");
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Payment for {planName} Plan</h1>
      <p style={{ color: "#555" }}>
        Please review your plan and proceed with secure checkout.
      </p>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: "1px solid #eee",
          marginTop: 20,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ margin: 0 }}>{planName} Plan</h3>
        <p style={{ color: "#666" }}>
          ${price} / month — includes all premium features.
        </p>

        {!showPayment ? (
          <>
            <button
              onClick={handleCheckout}
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={handleBack}
              style={{
                marginLeft: 10,
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#f3f4f6",
                color: "#333",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              ← Back to Plans
            </button>
          </>
        ) : (
          <>
            <div style={{ marginTop: 20 }}>
              <h4>Enter Card Details</h4>
              <input
                type="text"
                placeholder="Card Number"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="MM/YY"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <button
                onClick={handleConfirmPayment}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Confirm Payment
              </button>

              <button
                onClick={handleBack}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: "#f3f4f6",
                  color: "#333",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                ← Back to Plans
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 28, color: "#666", fontSize: 13 }}>
        <strong>Accepted:</strong> Visa, MasterCard, AmEx, PayPal.
        <br />
        This is a simulated checkout for demo purposes.
      </div>
    </div>
  );
};

export default PaymentPage;
