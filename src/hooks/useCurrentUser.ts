"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export function useCurrentUser(): UserData | null {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const loginType = localStorage.getItem("loginType");

    if (loginType === "manual") {
      const token = localStorage.getItem("token");
      const nameRaw = localStorage.getItem("fullName");
      const emailRaw = localStorage.getItem("email");
      const roleRaw = localStorage.getItem("role");
      const name = nameRaw === "undefined" ? "" : nameRaw || "";
      const email = emailRaw === "undefined" ? "" : emailRaw || "";
      const role = roleRaw === "undefined" ? "" : roleRaw || "";

      if (token && email) {
        setUser({
          name: name || "User",
          email,
          role: role || "",
        });
        return;
      }
    }

    if (session?.user) {
      setUser({
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        role: (session.user as any).role || "",
      });
    }
  }, [session]);

  return user;
}
