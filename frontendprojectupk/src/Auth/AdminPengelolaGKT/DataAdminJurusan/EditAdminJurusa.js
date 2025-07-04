// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Button, Form } from "react-bootstrap";
// import { FaUserEdit } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../../../Components/Navbar/Navbar";
// import Sidebar from "../../../Components/Sidebar/Sidebar";
// import "./DataAdminJurusan.css";

// const EditAdminJurusan = () => {
//   const navigate = useNavigate();
//   const { userId } = useParams();
//   const [formData, setFormData] = useState({
//     username: "",
//     jabatan: "",
//     kodejurusan: "",
//     jurusan: "",
//     nama_lengkap: "",
//     nip_nik_nipppk: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8000/api/users/${userId}`);
//         setFormData(response.data);
//       } catch (err) {
//         setError("Error fetching user data.");
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       const response = await axios.put(`http://localhost:8000/api/users/${userId}`, formData);
//       setSuccess("User updated successfully!");
//       setTimeout(() => {
//         navigate("/TabelAdminJurusan");
//       }, 2000);
//     } catch (err) {
//       setError("Error updating user. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="tpgk-dashboard-container">
//       <Navbar />
//       <Sidebar />
//       <h1 className="tpgk-dashboard-title">EDIT ADMIN JURUSAN</h1>

//       <div className="tpgk-card">
//         <Form onSubmit={handleSubmit} className="tpgk-form">
//           <Form.Group controlId="formUsername">
//             <Form.Label>Username</Form.Label>
//             <Form.Control type="text" placeholder="Enter username" name="username" value={formData.username} onChange={handleChange} required />
//           </Form.Group>

//           <Form.Group controlId="formNamaLengkap">
//             <Form.Label>Nama Lengkap</Form.Label>
//             <Form.Control type="text" placeholder="Enter full name" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
//           </Form.Group>

//           <Form.Group controlId="formNIP">
//             <Form.Label>NIP / NIK / NIPPPK</Form.Label>
//             <Form.Control type="text" placeholder="Enter NIP / NIK / NIPPPK" name="nip_nik_nipppk" value={formData.nip_nik_nipppk} onChange={handleChange} required />
//           </Form.Group>

//           <Form.Group controlId="formJabatan">
//             <Form.Label>Jabatan</Form.Label>
//             <Form.Control type="text" placeholder="Enter jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange} required />
//           </Form.Group>

//           <Form.Group controlId="formJurusan">
//             <Form.Label>Jurusan</Form.Label>
//             <Form.Control type="text" placeholder="Enter jurusan" name="jurusan" value={formData.jurusan} onChange={handleChange} required />
//           </Form.Group>

//           <Form.Group controlId="formPassword">
//             <Form.Label>Password</Form.Label>
//             <Form.Control type="password" placeholder="Enter password" name="password" value={formData.password} onChange={handleChange} required />
//           </Form.Group>

//           <div className="tpgk-button-container">
//             <Button type="submit" variant="success" disabled={loading} className="tpgk-submit-button">
//               {loading ? (
//                 "Updating..."
//               ) : (
//                 <>
//                   <FaUserEdit className="tpgk-icon" /> Edit User
//                 </>
//               )}
//             </Button>
//           </div>

//           {error && <div className="tpgk-error-message">{error}</div>}
//           {success && <div className="tpgk-success-message">{success}</div>}
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default EditAdminJurusan;
