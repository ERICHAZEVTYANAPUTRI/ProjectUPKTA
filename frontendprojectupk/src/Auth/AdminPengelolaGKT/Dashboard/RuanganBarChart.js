import { Box, Typography } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "#111",
          color: "#fff",
          px: 2,
          py: 1.5,
          borderRadius: 2,
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>Jam: {label}</div>
        {payload.map((entry) => (
          <div key={entry.dataKey} style={{ color: entry.stroke, fontWeight: 600 }}>
            {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {entry.value}
          </div>
        ))}
      </Box>
    );
  }
  return null;
};

const RuanganLineChart = ({ data }) => {
  // Buat jam 7 sampai 16
  // Tambahkan jam 6 sebagai titik awal dummy
  const dummyStart = {
    jam: 6,
    dipinjam: 0,
    diperbaiki: 0,
    kosong: 0,
  };

  // Jam 7 sampai 16
  const fullHours = Array.from({ length: 10 }, (_, i) => 7 + i); // [7, 8, ..., 16]

  // Proses data asli
  const processedData = fullHours.map((jam) => {
    const found = data.find((d) => Number(d.jam) === jam);
    return {
      jam,
      dipinjam: found && found.dipinjam !== null && found.dipinjam !== "null" ? Number(found.dipinjam) : null,
      diperbaiki: found && found.diperbaiki !== null && found.diperbaiki !== "null" ? Number(found.diperbaiki) : null,
      kosong: found && found.kosong !== null && found.kosong !== "null" ? Number(found.kosong) : null,
    };
  });

  // Gabungkan dummy jam 6 + hasil asli
  const finalData = [dummyStart, ...processedData];

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#fff",
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        Status Ruangan Hari Ini
      </Typography>
      <Typography sx={{ color: "#666", mb: 2, fontSize: "0.85rem" }}>Jumlah ruangan berdasarkan status tiap jam.</Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={finalData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="dipinjamGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f44336" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f44336" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="diperbaikiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2196f3" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#2196f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="kosongGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4caf50" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#4caf50" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#ccc" />
          <XAxis dataKey="jam" type="number" domain={[6, 16]} ticks={[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]} tickFormatter={(v) => `${v}`} tick={{ fontSize: 12, fontWeight: 600 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 600 }} />
          <Tooltip content={<CustomTooltip />} />

          <Line
            type="linear"
            dataKey="dipinjam"
            stroke="#f44336"
            strokeWidth={3}
            dot={false}
            fill="url(#dipinjamGradient)"
            connectNulls={false} // ⬅️ penting
          />
          <Line type="linear" dataKey="diperbaiki" stroke="#2196f3" strokeWidth={3} dot={false} fill="url(#diperbaikiGradient)" connectNulls={false} />
          <Line type="linear" dataKey="kosong" stroke="#4caf50" strokeWidth={3} dot={false} fill="url(#kosongGradient)" connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RuanganLineChart;
