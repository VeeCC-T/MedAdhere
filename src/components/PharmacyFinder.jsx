import React, { useState } from "react";

const PharmacyFinder = () => {
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);

  const findPharmacies = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=pharmacy&addressdetails=1&limit=10&extratags=1&viewbox=${longitude - 0.05},${latitude + 0.05},${longitude + 0.05},${latitude - 0.05}`
          );
          const data = await res.json();
          setPharmacies(data);
        } catch (error) {
          console.error("Error fetching pharmacies:", error);
          alert("Could not fetch nearby pharmacies.");
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert("Unable to access your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Pharmacy Finder 🏥</h2>
      <p>Find nearby pharmacies using your location.</p>

      <button
        onClick={findPharmacies}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        Find Nearby Pharmacies
      </button>

      {loading && <p>Searching for pharmacies near you...</p>}

      {pharmacies.length > 0 && (
        <div>
          <h3>Results near you:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {pharmacies.map((p, index) => (
              <li
                key={index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  margin: "10px 0",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <strong>{p.display_name.split(",")[0]}</strong>
                <br />
                <small>{p.display_name}</small>
                <br />
                <a
                  href={`https://www.google.com/maps?q=${p.lat},${p.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff" }}
                >
                  View on Map
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PharmacyFinder;
