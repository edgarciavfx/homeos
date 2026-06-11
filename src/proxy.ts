import { auth } from "@/infrastructure/auth/auth";

export const config = {
  matcher: ["/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)"],
};

export default auth;
