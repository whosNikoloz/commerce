import {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
    FC,
} from "react";
import { jwtDecode } from "jwt-decode";
import { signOut } from "next-auth/react";

enum UserRole {
    Admin = "Admin",
    Customer = "Customer",
}

class User {
    userId: number;
    userName: string;
    firstName: string;
    lastName: string;
    picture: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    oauth: string;
    joinedAt: string;

    constructor(
        userId: number,
        userName: string,
        firstName: string,
        lastName: string,
        picture: string,
        email: string,
        phoneNumber: string,
        role: string,
        oauth: string,
        joinedAt: string
    ) {
        this.userId = userId;
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.picture = picture;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = this.mapRole(role);
        this.oauth = oauth;
        this.joinedAt = joinedAt;
    }

    private mapRole(role: string): UserRole {
        switch (role.toLowerCase()) {
            case "admin":
                return UserRole.Admin;
            case "customer":
                return UserRole.Customer;
            default:
                throw new Error(`Invalid role: ${role}`);
        }
    }
}

interface UserContextType {
    user: User | null;
    login: (userToken: string) => void;
    logout: () => void;
    simulateLogin?: (userIdOrEmail: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}

interface UserProviderProps {
    children: ReactNode;
}

const EncodeJwtIntoUser = (userToken: string): User => {
    const decodedToken: any = jwtDecode(userToken);
    const userData = new User(
        parseInt(
            decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ][0],
            10
        ),
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ][1],
        decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        ],
        decodedToken["ProfilePicture"],
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"
        ],
        decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
        decodedToken["Oauth"],
        decodedToken["joinedAt"]
    );

    return userData;
};

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userJwt = localStorage.getItem("jwt");
        const userData = userJwt ? EncodeJwtIntoUser(userJwt) : null;

        if (userData) {
            const decodedToken: any = userJwt ? jwtDecode(userJwt) : null;
            const currentTime = new Date().getTime();
            const expirationTime = decodedToken.exp * 1000;

            if (currentTime < expirationTime) {
                setUser(userData);
            } else {
                localStorage.removeItem("jwt");
            }
        }
        setLoading(false);
    }, []);

    const login = (userToken: string) => {
        const userData = EncodeJwtIntoUser(userToken);

        if (userData.userId != null) {
            setUser(userData);
        }
        localStorage.setItem("jwt", userToken);
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem("jwt");

        // Also sign out from NextAuth (OAuth sessions)
        try {
            await signOut({ redirect: false });
        } catch (error) {
            console.error("Error signing out from NextAuth:", error);
        }
    };

    const simulateLogin = (userIdOrEmail: string) => {
        // Import dynamically to avoid server-side issues
        if (typeof window !== "undefined") {
            import("@/lib/mockAuth").then(({ simulateLogin: mockLogin }) => {
                const mockToken = mockLogin(userIdOrEmail);
                login(mockToken);
            });
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, simulateLogin }}>
            {loading ? (
                <div className="h-screen bg-black" />
            ) : (
                children
            )}
        </UserContext.Provider>
    );
};