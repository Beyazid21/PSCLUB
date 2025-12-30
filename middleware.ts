import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "admntool-secret-key-at-least-32-chars-long",
});

export const config = {
  matcher: ["/admin/:path*"],
};
