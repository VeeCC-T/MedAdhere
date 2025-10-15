// src/pages/Upgrade.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Upgrade = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: "pro",
      name: "Pro",
      price: 4.99,
      desc: "Unlimited medication tracking, unlimited ADR reports, device sync.",
    },
    {
      id: "org",
      name: "Organization",
      price: 19.99,
      desc: "Multi-user access, analytics, and priority support for health organizations.",
    },
  ];

  const goToPayment = (plan) => {
    // Navigate to PaymentPage and pass selected plan details
    navigate("/payment", {
      state: { planId: plan.id, planName: plan.name, price: plan.price },
    });
  };

  const returnToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Upgrade to Premium 💳</h1>
      <p style={{ color: "#555" }}>
        Choose a plan below. Prices are in USD — but payments can be made with
        any major card in your local currency.
      </p>

      {/* Pricing Plans */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Free Plan */}
        <div
          style={{
            minWidth: 260,
            padding: 18,
            borderRadius: 12,
            border: "1px solid #e6e6e6",
            background: "#f9f9f9",
          }}
        >
          <h3 style={{ margin: 0 }}>Free</h3>
          <p style={{ color: "#666", marginTop: 8 }}>
            Track up to 3 medications <br />
            Submit up to 3 ADR reports <br />
            Basic reminders
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              disabled
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#ddd",
                border: "none",
                cursor: "not-allowed",
              }}
            >
              Current plan
            </button>
          </div>
        </div>

        {/* Premium Plans */}
        {plans.map((p) => (
          <div
            key={p.id}
            style={{
              minWidth: 260,
              padding: 18,
              borderRadius: 12,
              border: "1px solid #e6e6e6",
              background: "#fff",
              boxShadow: "0 6px 18px rgba(16,24,40,0.04)",
            }}
          >
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <p style={{ color: "#666", marginTop: 8 }}>{p.desc}</p>
            <p style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
              ${p.price}{" "}
              <span style={{ fontSize: 12, fontWeight: 400 }}>/month</span>
            </p>

            <button
              onClick={() => goToPayment(p)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Upgrade to {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 28,
          color: "#666",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <strong>Accepted:</strong> Visa, MasterCard, AmEx, PayPal, and local
        bank cards (via gateway).
        <br />
        This is a simulated checkout — once complete, your account will be
        upgraded locally.
      </div>

      {/* Return Button */}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={returnToDashboard}
          style={{
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Upgrade;
