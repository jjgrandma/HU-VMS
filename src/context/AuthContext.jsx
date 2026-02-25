import { createContext, useState, useContext } from "react"; 
 
// eslint-disable-next-line react-refresh/only-export-components 
export const AuthContext = createContext(); 
 
export const AuthProvider = ({ children }) => { 
  const [user, setUser] = useState(null); 
 
  return ( 
    <AuthContext.Provider value={{ user, setUser }}> 
      {children} 
    </AuthContext.Provider> 
  ); 
}; 
 
// Custom hook to use the AuthContext 
export const useAuth = () => { 
  const context = useContext(AuthContext); 
  if (!context) { 
    throw new Error("useAuth must be used within an AuthProvider"); 
  } 
  return context; 
}; 
