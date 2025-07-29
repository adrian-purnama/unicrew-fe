import LoginForm from "../../component/LoginForm";
import Navigation from "../../component/Navigation";

export default function CompanyLogin() {
    return (
        <>
            <Navigation />
            <LoginForm role="company" title="Company" />
        </>
    );
}
