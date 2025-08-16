import { useContext, useEffect, useRef, useState } from "react";
import BaseModal from "./BaseModal";
import { UserContext } from "../../utils/UserContext";
import axiosInstance from "../../utils/ApiHelper";

export default function ChatModal({ roomId, isOpen, onClose }) {
    const { id, role, username } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [partnerName, setPartnerName] = useState("...");
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!roomId || !isOpen) return;

        const token = localStorage.getItem("unicru-token");

        axiosInstance
            .get(`/chat/chat/${roomId}/messages`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setMessages(res.data);
                } else {
                    setMessages(res.data.messages || []);
                    setPartnerName(res.data.partnerName || "...");
                }
            })
            .catch((err) => {
                console.error("Failed to load chat history", err);
            });

        // const ws = new WebSocket(`ws://localhost:10000/ws/chat/${roomId}?token=${token}`);
        const ws = new WebSocket(`wss://unicrew-be.onrender.com/ws/chat/${roomId}?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("\u2705 WebSocket connected");
        };

        ws.onmessage = (event) => {
            const { type, data, message } = JSON.parse(event.data);
            if (type === "error") return alert(message);
            if (type === "message") {
                setMessages((prev) => [...prev, data]);
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        };

        return () => {
            ws.close();
        };
    }, [roomId, isOpen]);

    const sendMessage = () => {
        if (!input.trim()) return;

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    content: input.trim(),
                })
            );
        } else {
            console.warn("\u26A0\uFE0F WebSocket not ready to send message");
        }

        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Message`}>
            <div className="h-64 overflow-y-auto border border-gray p-3 rounded bg-color-1 mb-3 sleek-scrollbar">
                {Array.isArray(messages) && messages.map((msg, idx) => {
                    const isUser = msg.senderType === "user";
                    return (
                        <div
                            key={msg._id || idx}
                            className={`flex ${isUser ? "justify-start" : "justify-end"} mb-2`}
                        >
                            <div
                                className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm whitespace-pre-line ${
                                    isUser
                                        ? "bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                                        : "bg-primary text-white"
                                }`}
                            >
                                <div className="font-medium text-xs mb-1">
                                    {msg.senderName || (isUser ? "You" : username)}
                                </div>
                                {msg.content}
                                <div className="text-[10px] text-gray-800 mt-1 text-right">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <div className="flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-gray text-color rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400 resize-none"
                    placeholder="Type message..."
                    rows={1}
                />

                <button
                    onClick={sendMessage}
                    className="bg-primary text-white px-4 py-1 rounded hover:bg-opacity-90"
                >
                    Send
                </button>
            </div>
        </BaseModal>
    );
}