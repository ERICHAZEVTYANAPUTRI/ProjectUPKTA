import LogoPoliwangi from "../../assets/LogoPoliwangi.jpeg";
import "./LoadingManual.css"; // Pastikan file CSS ada

const LoadingManual = () => {
  return (
    <div className="loading-overlay">
      <img src={LogoPoliwangi} alt="Logo" className="loading-logo" />
    </div>
  );
};

export default LoadingManual;
