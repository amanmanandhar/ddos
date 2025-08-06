import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

export default function BlockedIPs({ data }) {
  if (data.length === 0) {
    return <p>No blocked IPs 🚀</p>;
  }

  return (
    <List>
      {data.map((ip, index) => (
        <ListItem key={index} divider>
          <ListItemText
            primary={`IP: ${ip.ip_address}`}
            secondary={`Blocked at: ${new Date(
              ip.blocked_at
            ).toLocaleString()}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
