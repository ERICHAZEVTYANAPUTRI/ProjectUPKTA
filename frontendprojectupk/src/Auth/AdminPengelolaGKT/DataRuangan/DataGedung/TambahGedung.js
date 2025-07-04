import axios from "axios";
import React, { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";

const TambahGedung = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("gambar", image);

    try {
      const response = await axios.post("http://localhost:8000/api/gedungs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Gedung added successfully!");
      setErrorMessage("");
      setName("");
      setImage(null);
    } catch (error) {
      setErrorMessage("Error adding gedung!");
      setSuccessMessage("");
      console.error("There was an error!", error);
    }
  };

  return (
    <div className="add-gedung-container">
      <Navbar />
      <Sidebar />
      <h2>Tambah Gedung Baru</h2>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Nama Gedung</Form.Label>
          <Form.Control type="text" placeholder="Enter gedung name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="gambar">
          <Form.Label>gambar Gedung</Form.Label>
          <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} required />
        </Form.Group>

        <Button variant="primary" type="submit">
          Tambah Gedung
        </Button>
      </Form>
    </div>
  );
};

export default TambahGedung;
