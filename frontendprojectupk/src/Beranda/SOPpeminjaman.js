import NavbarBeranda from "./NavbarBeranda";

const SopPeminjaman = () => {
  return (
    <div className="sop-container1" style={{ backgroundColor: "#f5f6fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <NavbarBeranda />

      <h1
        className="title"
        style={{
          textAlign: "center",
          color: "#2c3e50",
          marginTop: "40px",
          fontWeight: "bold",
          fontSize: "32px",
        }}
      >
        SOP Peminjaman Ruangan
      </h1>

      <div className="card-container1" style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
        <div
          className="card1"
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <h2 style={{ color: "#008080", fontSize: "20px", marginBottom: "20px", fontWeight: "600" }}>Poin-Poin SOP Peminjaman Ruangan:</h2>
          <ul
            className="sop-list"
            style={{
              listStyle: "none",
              paddingLeft: "0",
              color: "#333",
              fontSize: "16px",
              lineHeight: "1.8",
            }}
          >
            <li>✅ Pemohon harus mengisi formulir peminjaman ruangan dengan lengkap.</li>
            <li>✅ Peminjaman ruangan harus dilakukan minimal 2 hari sebelum acara.</li>
            <li>✅ Ruangan yang dipinjam harus digunakan sesuai dengan waktu yang telah disepakati.</li>
            <li>✅ Pemohon bertanggung jawab atas kebersihan ruangan setelah digunakan.</li>
            <li>✅ Setiap kerusakan pada fasilitas ruangan akan menjadi tanggung jawab pemohon.</li>
            <li>✅ Pembatalan peminjaman harus diberitahukan 1 hari sebelum acara.</li>
            <li>✅ Peminjaman hanya dapat dilakukan oleh civitas akademika POLIWANGI.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SopPeminjaman;
