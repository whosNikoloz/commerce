// Mock authentication for testing purposes
// This creates a simulated JWT token for testing the user panel

export interface MockUser {
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  picture: string;
  oauth: string;
  joinedAt: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    userId: 1,
    userName: "testuser",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phoneNumber: "+995 555 123 456",
    role: "Customer",
    picture: "/diverse-user-avatars.png",
    oauth: "none",
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 2,
    userName: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    phoneNumber: "+995 555 999 888",
    role: "Admin",
    picture: "/diverse-user-avatars.png",
    oauth: "none",
    joinedAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Create a fake JWT token structure
function createMockJWT(user: MockUser): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": [
      user.userId.toString(),
      user.userName,
    ],
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": user.firstName,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname": user.lastName,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": user.email,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone": user.phoneNumber,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": user.role,
    ProfilePicture: user.picture,
    Oauth: user.oauth,
    joinedAt: user.joinedAt,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
    iat: Math.floor(Date.now() / 1000),
  };

  // Base64 encode (this is not a secure JWT, just for testing)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = "mock_signature_for_testing";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function simulateLogin(userIdOrEmail: string): string {
  const user = MOCK_USERS.find(
    (u) =>
      u.userId.toString() === userIdOrEmail ||
      u.email.toLowerCase() === userIdOrEmail.toLowerCase() ||
      u.userName.toLowerCase() === userIdOrEmail.toLowerCase()
  );

  if (!user) {
    throw new Error("Mock user not found");
  }

  return createMockJWT(user);
}

export function getDefaultMockUser(): string {
  return createMockJWT(MOCK_USERS[0]);
}
