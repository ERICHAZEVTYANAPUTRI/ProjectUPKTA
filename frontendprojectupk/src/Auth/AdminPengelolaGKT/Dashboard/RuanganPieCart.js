import { Box, Card, Typography } from "@mui/material";
import { FaDoorClosed, FaDoorOpen, FaTools } from "react-icons/fa";

const cards = [
    {
        label: "Dipinjam",
        icon: <FaDoorOpen size={20} />,
        color: "#ef5350",
        key: "dipinjam",
    },
    {
        label: "Diperbaiki",
        icon: <FaTools size={20} />,
        color: "#42a5f5",
        key: "diperbaiki",
    },
    {
        label: "Kosong",
        icon: <FaDoorClosed size={20} />,
        color: "#66bb6a",
        key: "kosong",
    },
];

const StatusSummaryCards = ({ data }) => {
    const total = {
        dipinjam: 0,
        diperbaiki: 0,
        kosong: 0,
    };

    data.forEach((entry) => {
        total.dipinjam += entry.dipinjam || 0;
        total.diperbaiki += entry.diperbaiki || 0;
        total.kosong += entry.kosong || 0;
    });

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                mb: 3,
            }}
        >
            {cards.map((item, idx) => (
                <Card
                    key={idx}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 3,
                        background: "#1e1e1e",
                        color: "#fff",
                        boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                        minWidth: 160,
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: item.color,
                            borderRadius: "50%",
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                        }}
                    >
                        {item.icon}
                    </Box>
                    <Box>
                        <Typography fontSize={13} sx={{ color: "#bbb" }}>
                            {item.label}
                        </Typography>
                        <Typography fontWeight="bold" fontSize={18}>
                            {total[item.key]}
                        </Typography>
                    </Box>
                </Card>
            ))}
        </Box>
    );
};

export default StatusSummaryCards;
