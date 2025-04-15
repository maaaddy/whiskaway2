import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        axios
          .get('/api/profile', { withCredentials: true })
          .then(response => {
            setId(response.data._id);
            setUsername(response.data.username);
          })
          .catch(err => {
            if (err.response?.status === 401) {
              console.warn('User not authenticated, skipping context setup.');
            } else {
              console.error('Failed to fetch user profile:', err);
            }
          });
      }, []);
      
    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    );
}
