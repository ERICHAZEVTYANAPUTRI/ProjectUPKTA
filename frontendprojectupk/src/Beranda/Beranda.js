import NavbarBeranda from "./NavbarBeranda";
import "./NavbarBeranda.css";

const Beranda = () => {
  return (
    <div className="beranda-container">
      <NavbarBeranda />
      <div className="card-container">
        <div className="card">
          <h4>Sistem Manajemen Penjadwalan dan Peminjaman Ruangan Gedung Kuliah Terpadu POLIWANGI</h4>
          <p>(Politeknik Negeri Banyuwangi)</p>
        </div>
      </div>
    </div>
  );
};

export default Beranda;
