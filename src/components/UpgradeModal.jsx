import React from "react";

const UpgradeModal = ({ show, onClose, onUpgrade }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h3>💳 Upgrade to Premium</h3>
        <p>Unlock unlimited ADR reports and medication reminders!</p>
        <button
          onClick={onUpgrade}
          style={{
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Upgrade Now
        </button>
        <br />
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#f87171",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
