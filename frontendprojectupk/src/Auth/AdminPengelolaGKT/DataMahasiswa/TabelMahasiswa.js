import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Divider, MenuItem, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSearch, BsTrash } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const TabelMahasiswa = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const location = useLocation();
  const [selectedPageOption, setSelectedPageOption] = useState(null);
  const [selectedPageLabel, setSelectedPageLabel] = useState("");
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
  };
  useEffect(() => {
    const current = pageOptions.find((option) => option.value === location.pathname);
    setSelectedPageOption(current || null);
  }, [location.pathname]);

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    const sorted = [...data].sort((a, b) => {
      if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setOrder(newOrder);
    setOrderBy(column);
    setData(sorted);
  };
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const pageOptions = [
    { value: "/TabelMahasiswa", label: "Mahasiswa" },
    { value: "/TabelPengelelolaGKT", label: "Pengelola GKT" },
    { value: "/TabelAdminJurusan", label: "Admin Jurusan" },
  ];
  const handlePageChange1 = (selectedOption) => {
    if (selectedOption) {
      setSelectedPageOption(selectedOption);
      navigate(selectedOption.value);
    } else {
      setSelectedPageOption(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, prodiRes] = await Promise.all([axios.get("http://localhost:8000/api/users"), axios.get("http://localhost:8000/api/prodi")]);
        const filteredData = userRes.data.filter((user) => user.role === "mahasiswa");
        setData(filteredData);
        setProdiList(prodiRes.data);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNamaProdi = (prodiId) => {
    const prodi = prodiList.find((p) => p.id === Number(prodiId));
    return prodi ? prodi.namaprodi : "-";
  };

  const filteredData = data.filter((row) => {
    const search = searchTerm.toLowerCase();

    const jurusan = row.jurusan && row.jurusan.namajurusan ? row.jurusan.namajurusan.toLowerCase() : "";
    const username = (row.username || "").toLowerCase();
    const namaLengkap = (row.nama_lengkap || "").toLowerCase();
    const prodi = row.prodi && row.prodi.namaprodi ? row.prodi.namaprodi.toLowerCase() : "";
    const kelas = row.kelas && row.kelas.nama ? row.kelas.nama.toLowerCase() : "";
    const nim = (row.nim || "").toLowerCase();
    const notlp = (row.notlp || "").toLowerCase();

    return username.includes(search) || namaLengkap.includes(search) || prodi.includes(search) || kelas.includes(search) || nim.includes(search) || jurusan.includes(search) || notlp.includes(search);
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleDelete = async (id) => {
    // Show SweetAlert1 confirmation dialog
    swal({
      title: "Apakah kamu Yakin?",
      text: "Setelah Dihapus Data Mahasiswa Tidak dapat Dikembalikan Lagi!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/users/${id}`);
          setData(data.filter((user) => user.id !== id));
          swal("Berhasil!", "Mahasiswa Telah Dihapus.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          swal("Error!", "Gagal Menghapus Mahasiswa.", "error");
        }
      } else {
        swal("Mahasiswa Masih Tersimpan!");
      }
    });
  };
  const CustomSortLabel = ({ active, direction, onClick, label }) => (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        justifyContent: "space-between",
        cursor: "pointer",
        color: "#FFFFFF", // label selalu putih
        fontWeight: 600,
      }}
    >
      {label}
      <Box sx={{ display: "flex", gap: "0px", ml: 0.5, mr: -1.5 }}>
        <span style={{ color: direction === "asc" && active ? "#FFFFFF" : "#aaa" }}>↑</span>
        <span style={{ color: direction === "desc" && active ? "#FFFFFF" : "#aaa" }}>↓</span>
      </Box>
    </Box>
  );

  return (
    <>
      <Navbar />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
          <Select
            options={pageOptions}
            value={selectedPageOption}
            onChange={handlePageChange1}
            placeholder="Pilih Halaman"
            isClearable
            styles={{
              container: (base) => ({
                ...base,
                minWidth: 120,
                maxWidth: 250,
                fontSize: "0.80rem",
              }),
            }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          {/* Show entries */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "-10px" }}>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#4f4f4f", // Warna teks
                fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
              }}
              variant="body2"
            >
              Show
            </Typography>
            <MuiSelect
              size="small"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              sx={{ fontSize: "12px", height: "25px", width: "60px" }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 120,
                    width: "60px",
                    mt: 0.5,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  },
                },
              }}
            >
              {[5, 10, 25].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{
                    fontSize: "13px",
                    py: 0.5,
                    minHeight: "unset",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  {value}
                </MenuItem>
              ))}
            </MuiSelect>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#4f4f4f", // Warna teks
                fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
              }}
              variant="body2"
            >
              entries
            </Typography>
          </Box>
          {/* Search */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", ml: 2 }}>
            <TextField
              size="small"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{
                width: "70%", // ⬅️ Ganti panjang sesuai kebutuhan
                fontSize: "0.75rem",
                "& input": { fontSize: "0.75rem", py: 0.7 }, // perkecil input text
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    sx={{
                      padding: "4.5px 9px",
                      fontSize: "0.7rem",
                      ml: 1,
                      backgroundColor: "#0C20B5",
                      "&:hover": { backgroundColor: "#081780" },
                    }}
                    onChange={(e) => handleSearch(e.target.value)}
                  >
                    <BsSearch size={14} />
                  </Button>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>

      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          border: "1px solid #e5e6ed",
          borderRadius: 1,
          "&::-webkit-scrollbar": {
            height: "4px", // TIPIS
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1", // warna thumb
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", // warna background track
          },

          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#c1c1c1 #f1f1f1", // Firefox
        }}
      >
        <Table aria-label="Tabel Mahasiswa" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "username"} direction={order} onClick={() => handleSort("username")} label="Username" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nama_lengkap"} direction={order} onClick={() => handleSort("nama_lengkap")} label="Nama" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "kelas_id"} direction={order} onClick={() => handleSort("kelas_id")} label="Kelas" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nim"} direction={order} onClick={() => handleSort("nim")} label="Nim" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "notlp"} direction={order} onClick={() => handleSort("notlp")} label="No.Telpon" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "jurusanmahasiswa_id"} direction={order} onClick={() => handleSort("jurusanmahasiswa_id")} label="Jurusan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "prodi_id"} direction={order} onClick={() => handleSort("prodi_id")} label="Prodi" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedItems.map((mahasiswa, index) => (
              <TableRow key={mahasiswa.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff", borderBottom: "1px solid #ccc" }}>
                <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa.username || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa.nama_lengkap || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa?.kelas?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa.nim || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa.notlp || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa?.jurusan?.namajurusan || "-"}</TableCell>
                <TableCell sx={cellStyle}>{mahasiswa?.prodi?.namaprodi || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Hapus data" arrow>
                      <Box
                        onClick={() => handleDelete(mahasiswa.id)}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          border: "1.5px solid #DC3545",
                          color: "#DC3545",
                          fontWeight: 600,
                          padding: "2px 6px", // kecilkan sedikit
                          borderRadius: 1,
                          backgroundColor: "#fff0f0",
                          fontSize: "12px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#DC3545",
                            color: "#fff",
                          },
                        }}
                      >
                        <BsTrash size={18} />
                      </Box>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {displayedItems.length === 0 && (
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: "13px",
                    color: "#4f4f4f", // Warna teks
                    fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
                  }}
                  colSpan={8}
                  align="center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StyledPaginateContainer>
        <ReactPaginate
          previousLabel={<ChevronLeft />}
          nextLabel={<ChevronRight />}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          containerClassName={"pagination"} // penting agar selector `& ul` bekerja
          activeClassName={"active"}
          pageRangeDisplayed={1} // hanya 1 halaman di kiri-kanan current
          marginPagesDisplayed={1} // hanya tampil halaman paling awal dan akhir (optional)
          breakLabel={"..."}
        />
      </StyledPaginateContainer>
    </>
  );
};
const StyledPaginateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(1),
  "& ul": {
    display: "flex",
    listStyle: "none",
    padding: 0,
    gap: 0,
  },
  "& li": {
    border: "1px solid #d0d0d0",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333",
    transition: "all 0.2s ease",
  },
  "& li:hover": {
    backgroundColor: "#e0e0e0",
  },
  "& li.active": {
    backgroundColor: "#0C20B5",
    color: "#fff",
    fontWeight: 600,
    border: "1px solid #0C20B5",
  },
}));

const headStyle = {
  color: "white",
  fontWeight: "bold",
  paddingTop: 1,
  fontSize: "13px",
  paddingBottom: 1,
  borderRight: "1.5px solid white",
  whiteSpace: "nowrap", // Cegah teks membungkus
  overflow: "hidden", // Sembunyikan overflow
  textOverflow: "ellipsis", // Tambahkan "..." kalau teks kepanjangan
};

const cellStyle = {
  borderRight: "1.5px solid #DBDFE1",
  fontSize: "13px",
  color: "#4f4f4f", // Warna teks
  fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
  paddingTop: "17px", // Lebih kecil
  paddingBottom: "17px",
  verticalAlign: "top", // ⬅️ Tambahkan ini
};

export default TabelMahasiswa;
