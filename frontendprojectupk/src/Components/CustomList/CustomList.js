import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const CustomListItem = ({ to, icon, label, open, activePaths = [] }) => {
    const location = useLocation();
    const isActive = [to, ...activePaths].some((path) =>
        location.pathname.startsWith(path)
    );
    return (
        <ListItemButton
            component={Link}
            to={to}
            selected={isActive}
            sx={{
                px: open ? 2.5 : 1.7,
                py: 0.75,
                fontSize: "0.70rem",
                minHeight: 40,
                color: isActive ? "#1860eb" : "#4f4f4f",
                "&.Mui-selected": {
                    backgroundColor: "rgba(24, 96, 235, 0.1)",
                },
                "&:hover": {
                    backgroundColor: "rgba(24, 96, 235, 0.15)",
                },
                "&::before": isActive
                    ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 8,
                          bottom: 8,
                          width: "4px",
                          borderRadius: "0 4px 4px 0",
                          backgroundColor: "#1860eb",
                      }
                    : {},
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 42,
                    color: isActive ? "#1860eb" : "#8687A7",
                }}
            >
                {icon}
            </ListItemIcon>
            {open && (
                <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                    }}
                />
            )}
        </ListItemButton>
    );
};

export default CustomListItem;
