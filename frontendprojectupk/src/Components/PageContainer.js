import { Box } from "@mui/material";
import { useState } from "react";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./Sidebar/Sidebar";

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const sidebarWidth = sidebarOpen ? 280 : 60;
    const sidebarMargin = 30;

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Navbar />
            <Box sx={{ display: "flex" }}>
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

                <Box
                    component="main"
                    sx={{
                        paddingTop: "180px",
                        height: "calc(100vh - 158px)",
                        overflowY: "auto",
                        px: 3,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        ml: { xs: 0, sm: `${sidebarWidth + sidebarMargin}px` },
                        width: {
                            xs: "100%",
                            sm: `calc(100% - ${
                                sidebarWidth + sidebarMargin * 2
                            }px)`,
                        },
                        transition: "all 0.3s ease",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
