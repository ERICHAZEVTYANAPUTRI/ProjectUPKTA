import { Box, Card, Divider, Skeleton } from "@mui/material";

const SkeletonProfileCard = ({ open }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                width: "100%",
                justifyContent: "center",
            }}
        >
            <Card
                sx={{
                    width: {
                        xs: "80%",
                        sm: "88%",
                        md: open ? "480px" : "595px",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 2,
                    background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                            minWidth: 160,
                        }}
                    >
                        <Skeleton variant="circular" width={140} height={140} />
                        <Skeleton
                            variant="rectangular"
                            width={100}
                            height={32}
                        />
                        <Skeleton variant="text" width={120} height={10} />
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2,
                        }}
                    >
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Box key={i} sx={{ gridColumn: "span 1" }}>
                                <Skeleton
                                    variant="text"
                                    width="50%"
                                    height={20}
                                />
                                <Skeleton variant="rectangular" height={39} />
                            </Box>
                        ))}

                        <Box
                            sx={{
                                gridColumn: "span 2",
                                textAlign: "right",
                                mt: 1,
                            }}
                        >
                            <Skeleton
                                variant="rectangular"
                                width={100}
                                height={36}
                                sx={{ ml: "auto" }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* Card Password */}
            <Card
                sx={{
                    width: {
                        xs: "80%",
                        sm: "88%",
                        md: open ? "350px" : "450px",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 2,
                    background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                }}
            >
                <Skeleton variant="text" width="40%" height={24} />
                <Divider sx={{ border: 1, color: "#ccc", mt: 1, mb: 2 }} />

                {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ mt: i > 0 ? 2 : 0 }}>
                        <Skeleton variant="text" width="50%" height={20} />
                        <Skeleton variant="rectangular" height={39} />
                    </Box>
                ))}

                <Box sx={{ mt: 3, textAlign: "right" }}>
                    <Skeleton variant="rectangular" width={100} height={36} />
                </Box>
            </Card>
        </Box>
    );
};

export default SkeletonProfileCard;
