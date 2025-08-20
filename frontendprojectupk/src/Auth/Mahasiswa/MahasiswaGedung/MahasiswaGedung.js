import { Box, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import EmptyGedungState from "./EmpetyGedungState";
import GedungCard from "./GedungCard";
import GedungCardSkeleton from "./GedungCradSkeleton";

const MahasiswaGedung = () => {
    const [gedungs, setGedungs] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGedungs();
    }, []);

    const fetchGedungs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8000/api/gedungjumlahldanr"
            );
            setGedungs(response.data);
        } catch (error) {
            console.error("Error fetching gedungs:", error);
            setGedungs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMoreInfo = (gedungId) => {
        navigate(`/ruanganmahasiswa/lihat/${gedungId}`);
    };

    return (
        <>
            <Navbar />
            <Box sx={{ backgroundColor: "#f0f4ff", minHeight: "100%", pt: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 3,
                        px: 2,
                    }}
                >
                    <Box
                        sx={{
                            background:
                                "linear-gradient(90deg, #1446a0, #1e88e5)",
                            px: { xs: 2, sm: 4 },
                            py: 0.8,
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                            textAlign: "center",
                            width: "100%",

                            maxWidth: "1200px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#fff",
                                fontWeight: "700",
                                letterSpacing: "0.5px",
                                fontSize: { xs: "0.9rem", sm: "1.2rem" },
                                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            Gedung Perkuliahan Politeknik Negeri Banyuwangi
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",

                        maxWidth: "1200px",
                        margin: "auto",
                        gridTemplateColumns: {
                            xs: "repeat(auto-fill, minmax(230px, 1fr))",
                            sm: "repeat(auto-fill, minmax(230px, 1fr))",
                        },
                        gap: 5,
                        px: { xs: 2, sm: 3 },
                        pb: 4,
                        minHeight: 200,
                    }}
                >
                    {loading &&
                        Array.from(new Array(6)).map((_, idx) => (
                            <GedungCardSkeleton key={idx} />
                        ))}

                    {!loading &&
                        gedungs.length > 0 &&
                        gedungs.map((gedung) => (
                            <GedungCard
                                key={gedung.id}
                                gedung={gedung}
                                onClick={() => handleMoreInfo(gedung.id)}
                            />
                        ))}

                    {!loading && gedungs.length === 0 && <EmptyGedungState />}
                </Box>
            </Box>
        </>
    );
};

export default MahasiswaGedung;
