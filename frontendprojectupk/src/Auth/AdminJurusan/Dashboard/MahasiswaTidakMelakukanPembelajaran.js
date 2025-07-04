import { Box, Card, CardContent, CardHeader, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

const TabelPeminjamanPending = ({ open }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8000/api/peminjamanpendingadminjurusan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setRows(res.data))
      .catch((err) => console.error("Gagal ambil data:", err));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: -2,
        px: 2,
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: {
            xs: "100%",
            sm: "95%",
            md: open ? "950px" : "1150px",
          },
          borderRadius: 2,
          background: "linear-gradient(to top left, #ffffff, #e3f2fd)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
        }}
      >
        <CardHeader
          title="Daftar Kelas Belum Melakukan Perkuliahan Hari ini"
          titleTypographyProps={{
            variant: "h6",
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
          sx={{ backgroundColor: "#e3f2fd", py: 2 }}
        />
        <CardContent>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              maxHeight: "550px",
              background: "linear-gradient(to top left, #f9fcff, #e3f2fd)",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#bbdefb" }}>
                  {["No", "Hari", "Jam", "Ruangan", "Matakuliah", "Kelas", "Dosen", "Status"].map((head, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        color: "#0d47a1",
                        borderBottom: "2px solid #90caf9",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, i) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        transition: "all 0.2s",
                        backgroundColor: i % 2 === 0 ? "#f5faff" : "#ffffff",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                          transform: "scale(1.005)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.hari}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {row.jammulai?.slice(0, 5)} - {row.jamselesai?.slice(0, 5)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.ruangan?.name ?? "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 130, wordBreak: "break-word" }}>
                        <Tooltip title={row.kodematakuliah}>
                          <span>{row.kodematakuliah}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.kelas?.nama ?? "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 150, wordBreak: "break-word" }}>{row.dosen?.nama ?? "-"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.statuspeminjaman ?? "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: "#aaa" }}>
                      Tidak ada kelas yang tidak melakukan perkuliahan saat ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TabelPeminjamanPending;
