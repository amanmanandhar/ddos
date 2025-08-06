import React, { useEffect, useState } from "react";
import { Grid, Paper, Container, Typography } from "@mui/material";
import TrafficChart from "./TrafficChart";
import BlockedIPs from "./BlockedIPs";
import NavbarSuccess from "./NavbarSuccess";

export default function Dashboard({ onLogout }) {
  const [trafficData, setTrafficData] = useState([]);
  const [blockedData, setBlockedData] = useState([]);
  const [ipInput, setIpInput] = useState("");
  const [logStatus, setLogStatus] = useState(null);

  const fetchData = async () => {
    try {
      const [trafficRes, blockedRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/traffic_stats/"),
        fetch("http://127.0.0.1:8000/api/blocked_ips/"),
      ]);

      const trafficJson = await trafficRes.json();
      const blockedJson = await blockedRes.json();

      setTrafficData(trafficJson);
      setBlockedData(blockedJson);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // 🔹 Handle log_request call
  const handleLogRequest = async (e) => {
    e.preventDefault();
    setLogStatus(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/log_request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip_address: ipInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLogStatus({ type: "error", message: data.error || "Request failed" });
      } else {
        setLogStatus({
          type: data.status === "blocked" ? "error" : "success",
          message: `IP ${data.ip} → ${data.status}`,
        });
        fetchData(); // refresh stats after logging request
      }
    } catch (err) {
      setLogStatus({ type: "error", message: "Something went wrong" });
    }
    setIpInput("");
  };

  return (
    <div>
      <NavbarSuccess onLogout={onLogout} />

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Traffic Overview
              </Typography>
              <TrafficChart data={trafficData} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Blocked IPs
              </Typography>
              <BlockedIPs data={blockedData} />
            </Paper>
          </Grid>

          {/* 🔹 New Section: Log Request */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Simulate Log Request
              </Typography>
              <form
                onSubmit={handleLogRequest}
                style={{ display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  placeholder="Enter IP Address"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Log Request
                </button>
              </form>

              {logStatus && (
                <Typography
                  sx={{ mt: 2 }}
                  color={logStatus.type === "error" ? "error" : "green"}
                >
                  {logStatus.message}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
