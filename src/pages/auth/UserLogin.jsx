import LoginForm from "../../component/LoginForm";
import Navigation from "../../component/Navigation";

export default function UserLogin() {
    return (
        <>
            <Navigation />
            <LoginForm role="user" title="User" />
        </>
    );
}
