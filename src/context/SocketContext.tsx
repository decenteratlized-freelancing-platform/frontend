"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

const SocketContext = createContext<any>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { data: session } = useSession();
    const user = session?.user;

    useEffect(() => {
        if (user) {
            // @ts-ignore
            const socketInstance = io("http://localhost:5000", {
                query: {
                    // @ts-ignore
                    userId: user.id || user._id, // Handle both id formats if needed, though session usually has id
                },
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users: any) => {
                setOnlineUsers(users);
            });

            return () => {
                socketInstance.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
