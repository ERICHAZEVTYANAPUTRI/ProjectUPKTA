import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const ChatBubble = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#ffffff",
  color: "#333",
  padding: "8px 16px",
  borderRadius: "16px",
  fontWeight: 500,
  fontSize: "0.9rem",
  boxShadow: theme.shadows[1],
  maxWidth: "200px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  "::after": {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderTop: "8px solid #ffffff",
  },
}));
