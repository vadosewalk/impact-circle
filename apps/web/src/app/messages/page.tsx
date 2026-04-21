"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Badge } from "@impact/ui/components/badge";
import { ScrollArea } from "@impact/ui/components/scroll-area";
import { toast } from "@impact/ui/components/sonner";
import { useRouter } from "next/navigation";
import { Send, User, Clock } from "lucide-react";

export default function MessagesPage() {
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    if (session) fetchMessages();
  }, [session, isPending]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        headers: {
          Authorization: `Bearer ${session?.session.token}`,
        },
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session.token}`,
        },
        body: JSON.stringify({
          receiverId: selectedContact,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(); // Refresh list
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  // Group messages by conversation (unique contact)
  const conversations = messages.reduce((acc: any, msg: any) => {
    const contactId = msg.senderId === session?.user.id ? msg.receiverId : msg.senderId;
    if (!acc[contactId]) acc[contactId] = [];
    acc[contactId].push(msg);
    return acc;
  }, {});

  const contactIds = Object.keys(conversations);

  if (isPending || isLoading) return <div className="p-8 text-center">Loading messages...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Handshake DMs</h1>
        <p className="text-muted-foreground mt-1">Limited characters (500) for exchanging contact info.</p>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Conversations */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            {contactIds.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No messages yet.</div>
            ) : (
              <div className="divide-y">
                {contactIds.map((id) => (
                  <button
                    key={id}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${selectedContact === id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedContact(id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium text-sm truncate">User ID: {id}</div>
                        <div className="text-xs text-muted-foreground truncate">{conversations[id][0].content}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Main Content: Chat Window */}
        <Card className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="border-b py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="size-5" /> Chat
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversations[selectedContact]
                    .slice()
                    .reverse()
                    .map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === session?.user.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            msg.senderId === session?.user.id
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-muted rounded-tl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div
                            className={`text-[10px] mt-1 opacity-70 flex items-center gap-1 ${
                              msg.senderId === session?.user.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <Clock className="size-2" />
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              <CardFooter className="border-t p-4">
                <form onSubmit={handleSendMessage} className="w-full flex gap-3">
                  <Input
                    placeholder="Type your message (Handshake only)..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                    required
                  />
                  <Button type="submit" size="icon">
                    <Send className="size-4" />
                  </Button>
                </form>
                <div className="text-[10px] text-muted-foreground mt-2 text-right w-full">
                  {newMessage.length}/500 characters
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation to start messaging.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
