import LoginForm from "../../component/LoginForm";
import Navigation from "../../component/Navigation";

export default function CompanyLogin() {
    return (
        <div className="h-screen bg-color-1">
            <Navigation />
            <LoginForm role="company" title="Company" />
        </div>
    );
}
