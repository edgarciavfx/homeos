export function createMockSession(userId: string) {
  return {
    user: { id: userId, email: "test@homeos.dev", name: "Test User" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}
