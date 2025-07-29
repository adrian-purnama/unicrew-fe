import { createContext, useState } from "react";

const UserContext = createContext();

const UserContextProvider = (props) => {
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [id, setId] = useState(null)

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        role,
        setRole,
        profilePicture,
        setProfilePicture,
        isLoggedIn, 
        setIsLoggedIn,
        isProfileComplete, 
        setIsProfileComplete,
        notifications,
        setNotifications,
        id,
        setId
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
