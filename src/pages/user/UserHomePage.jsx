import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../utils/UserContext";
import axiosInstance from "../../../utils/ApiHelper";
import Navigation from "../../component/Navigation";
import ProfileReminderModal from "../../component/ProfileReminderModal";
import ChatModal from "../../component/ChatModal";
import JobBoardLayout from "../../component/UserJobBoard/JobBoardLayout";

const UserHomePage = () => {
    const { isLoggedIn, setIsProfileComplete } = useContext(UserContext);

    const [showModal, setShowModal] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [activeChatRoom, setActiveChatRoom] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) return;

        const lastShown = localStorage.getItem("unicru-profile-reminder");
        const now = new Date();
        const oneDayPassed = !lastShown || now - new Date(lastShown) > 24 * 60 * 60 * 1000;

        if (!oneDayPassed) return;

        axiosInstance.get("/user/profile-check").then((res) => {
            const { isComplete, missingFields, completedPercentage } = res.data;
            setIsProfileComplete(isComplete);
            if (!isComplete) {
                setMissingFields(missingFields);
                setPercentage(completedPercentage);
                setShowModal(true);
            }
        });
    }, [isLoggedIn, setIsProfileComplete]);

    const handleCloseReminder = () => {
        setShowModal(false);
        localStorage.setItem("unicru-profile-reminder", new Date().toISOString());
    };

    return (
        <div className="bg-color-1 min-h-[100vh]">
            <Navigation />
            <JobBoardLayout setActiveChatRoom={setActiveChatRoom} />

            {isLoggedIn && showModal && (
                <ProfileReminderModal
                    missingFields={missingFields}
                    percentage={percentage}
                    onClose={handleCloseReminder}
                />
            )}

            {activeChatRoom && (
                <ChatModal
                    roomId={activeChatRoom}
                    isOpen={!!activeChatRoom}
                    onClose={() => setActiveChatRoom(null)}
                />
            )}
        </div>
    );
};

export default UserHomePage;
