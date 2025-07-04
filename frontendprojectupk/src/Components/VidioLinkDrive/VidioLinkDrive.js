import "bootstrap/dist/css/bootstrap.min.css"; // hanya di sini
import Modal from "react-bootstrap/Modal";

const VideoModal = ({ show, onClose, videoUrl }) => (
  <Modal show={show} onHide={onClose} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>Video Pengembalian</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe src={videoUrl} title="Drive Video" frameBorder="0" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
      </div>
    </Modal.Body>
  </Modal>
);

export default VideoModal;
