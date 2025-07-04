// import axios from "axios";
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../../../../Components/Navbar/Navbar";
// import Sidebar from "../../../../Components/Sidebar/Sidebar";

// const TambahJurusanGenap = () => {
//   const [kodejurusangenap, setkodejurusangenap] = useState("");
//   const [namajurusangenap, setNamajurusangenap] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:8000/api/jurusangenap/store", {
//         kodejurusangenap,
//         namajurusangenap,
//       });
//       navigate("/JurusanSmesterGenap"); // arahkan ke halaman daftar jurusan
//     } catch (error) {
//       console.error("Gagal menambahkan jurusan:", error);
//     }
//   };

//   return (
//     <div className="dashboard-container-jurusan">
//       <Navbar />
//       <Sidebar />
//       <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
//         Tambah Jurusan
//       </h1>

//       <div className="dashboard-scroll-area" style={{ padding: "20px 50px" }}>
//         <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
//           <div style={{ marginBottom: "15px" }}>
//             <label>Kode Jurusan</label>
//             <input
//               type="text"
//               value={kodejurusangenap}
//               onChange={(e) => setkodejurusangenap(e.target.value)}
//               required
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 borderRadius: "6px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <div style={{ marginBottom: "15px" }}>
//             <label>Nama Jurusan</label>
//             <input
//               type="text"
//               value={namajurusangenap}
//               onChange={(e) => setNamajurusangenap(e.target.value)}
//               required
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 borderRadius: "6px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <button
//             type="submit"
//             style={{
//               padding: "10px 20px",
//               backgroundColor: "#2563eb",
//               color: "#fff",
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               fontWeight: "bold",
//             }}
//           >
//             Simpan
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default TambahJurusanGenap;
