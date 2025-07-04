import Sidebar from "../Components/Sidebar/Sidebar";
import "../Components/Sidebar/Sidebar.css";

const Layout = ({ children }) => {
  return (
    <>
      <Sidebar />
      <div className="main-content">{children}</div>
    </>
  );
};

export default Layout;
