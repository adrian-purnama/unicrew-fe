import LoginForm from "../../component/LoginForm";
import Navigation from "../../component/Navigation";

export default function UserLogin() {
    return (
        <div className="bg-color-1 h-screen">
            <Navigation />
            <div className="mt-[20vh]">
                <LoginForm role="user" title="User" />
            </div>
        </div>
    );
}
