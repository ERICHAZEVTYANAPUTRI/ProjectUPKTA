import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const CustomDropdownMenu = ({
    label,
    icon,
    items,
    open,
    isOpen,
    setIsOpen,
}) => {
    const location = useLocation();

    const isAnyItemActive = items.some(({ to, activePaths = [] }) =>
        [to, ...activePaths].some((path) => location.pathname.startsWith(path))
    );

    const showActiveOnParent = isAnyItemActive && !isOpen;

    return (
        <>
            <ListItemButton
                onClick={() => setIsOpen(!isOpen)}
                selected={showActiveOnParent}
                sx={{
                    px: open ? 2.5 : 1.7,
                    py: 0.75,
                    fontSize: "0.65rem",
                    minHeight: 40,
                    color: showActiveOnParent ? "#1860eb" : "#4f4f4f",
                    "&.Mui-selected": {
                        backgroundColor: "rgba(24, 96, 235, 0.1)",
                    },
                    "&:hover": {
                        backgroundColor: "rgba(24, 96, 235, 0.15)",
                    },
                    "&::before": showActiveOnParent
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
                        color: showActiveOnParent ? "#1860eb" : "#8687A7",
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
                {open &&
                    (isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {items.map(({ to, label, activePaths = [] }) => {
                        const isActive = [to, ...activePaths].some((path) =>
                            location.pathname.startsWith(path)
                        );

                        return (
                            <ListItemButton
                                key={to}
                                component={Link}
                                to={to}
                                selected={isActive}
                                sx={{
                                    pl: 4,
                                    py: 0.75,
                                    fontSize: "0.70rem",
                                    color: isActive ? "#1860eb" : "#4f4f4f",
                                    position: "relative",
                                    "&.Mui-selected": {
                                        backgroundColor:
                                            "rgba(24, 96, 235, 0.1)",
                                    },
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(24, 96, 235, 0.15)",
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
                    })}
                </List>
            </Collapse>
        </>
    );
};

export default CustomDropdownMenu;
