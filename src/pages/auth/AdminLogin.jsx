import Footer from "../../component/Footer";
import LoginForm from "../../component/LoginForm";
import Navigation from "../../component/Navigation";


export default function AdminLogin() {
  return (
    <>
    <Navigation />
    <div className="bg-color-1 min-h-[100vh] pt-[20vh]">

      <LoginForm role="admin" title="Admin" />;
    </div>
    <Footer />
    </>
  )
}
