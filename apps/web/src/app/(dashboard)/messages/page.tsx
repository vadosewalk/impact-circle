"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { format } from "date-fns";
import {
  Search as SearchIcon,
  MessagesSquare,
  Edit,
  Send,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Paperclip,
  ImagePlus,
  Plus,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@impact/ui/components/avatar";
import { Button } from "@impact/ui/components/button";
import { ScrollArea } from "@impact/ui/components/scroll-area";
import { Separator } from "@impact/ui/components/separator";
import { Card } from "@impact/ui/components/card";
import { Input } from "@impact/ui/components/input";
import { cn, getDisplayNameInitials } from "@impact/ui/lib/utils";
import { toast } from "@impact/ui/components/sonner";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [mobileSelectedUser, setMobileSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/messages`, {
        headers: {
          Authorization: `Bearer ${session?.session.token}`,
        },
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [session?.session.token]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    if (session) fetchMessages();
  }, [session, isPending, router, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/messages/send`, {
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
        fetchMessages();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send message");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  const conversations = messages.reduce((acc: Record<string, Message[]>, msg: Message) => {
    const contactId = msg.senderId === session?.user.id ? msg.receiverId : msg.senderId;
    if (!acc[contactId]) acc[contactId] = [];
    acc[contactId].push(msg);
    return acc;
  }, {});

  const contactIds = Object.keys(conversations).filter((id) => id.toLowerCase().includes(search.toLowerCase()));

  if (isPending || isLoading)
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-background">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <section className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Inbox List - Left Side */}
      <div className={cn("flex w-full flex-col gap-2 sm:w-64 lg:w-80", mobileSelectedUser && "hidden sm:flex")}>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
            <MessagesSquare size={18} className="text-muted-foreground" />
          </div>
          <Button size="icon" variant="ghost" className="rounded-lg size-8">
            <Edit size={18} className="text-muted-foreground" />
          </Button>
        </div>

        <div className="relative mb-4">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Search handshakes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="-mx-2 flex-1">
          <div className="px-2 space-y-1">
            {contactIds.map((id) => {
              const userConversations = conversations[id];
              if (!userConversations || userConversations.length === 0) return null;

              const lastMsg = userConversations[0] as Message;
              const isSelected = selectedContact === id;

              return (
                <Fragment key={id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-3 text-start text-sm transition-colors group",
                      isSelected ? "bg-secondary text-secondary-foreground" : "hover:bg-muted/50",
                    )}
                    onClick={() => {
                      setSelectedContact(id);
                      setMobileSelectedUser(id);
                    }}
                  >
                    <Avatar className="size-10 border shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {getDisplayNameInitials(`User ${id.slice(0, 4)}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold truncate">User {id.slice(0, 8)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          {format(new Date(lastMsg.createdAt), "MMM d")}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-[13px] text-muted-foreground leading-tight">
                        {lastMsg.senderId === session?.user.id ? "You: " : ""}
                        {lastMsg.content}
                      </p>
                    </div>
                  </button>
                  <Separator className="opacity-40" />
                </Fragment>
              );
            })}
            {contactIds.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">No handshakes found.</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window - Right Side */}
      <div
        className={cn(
          "flex-1 flex-col border rounded-lg bg-background shadow-sm overflow-hidden flex",
          !mobileSelectedUser && "hidden sm:flex",
        )}
      >
        {selectedContact && conversations[selectedContact] ? (
          <>
            {/* Chat Header */}
            <div className="flex-none h-14 flex items-center justify-between px-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="-ml-2 size-8 sm:hidden"
                  onClick={() => setMobileSelectedUser(null)}
                >
                  <ArrowLeft size={18} />
                </Button>
                <Avatar className="size-8 border">
                  <AvatarFallback className="text-[10px]">
                    {getDisplayNameInitials(`User ${selectedContact.slice(0, 4)}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">User {selectedContact.slice(0, 8)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Connected
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="size-8 rounded-full">
                  <Video size={18} className="text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8 rounded-full">
                  <Phone size={18} className="text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8">
                  <MoreVertical size={18} className="text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="flex flex-col-reverse gap-4 min-h-full">
                {(conversations[selectedContact] as Message[])
                  .slice()
                  .reverse()
                  .map((msg: Message) => {
                    const isMe = msg.senderId === session?.user.id;
                    return (
                      <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm border",
                            isMe ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border",
                          )}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <div
                            className={cn(
                              "text-[10px] mt-1.5 flex items-center gap-1 opacity-70 font-medium",
                              isMe ? "justify-end" : "justify-start",
                            )}
                          >
                            <Clock className="size-2.5" />
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div className="text-center py-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/40 px-2 py-1 rounded">
                    Handshake Established
                  </span>
                </div>
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-2 rounded-md border bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
                  <textarea
                    className="w-full resize-none bg-transparent text-[13px] focus:outline-none min-h-[40px] max-h-32"
                    placeholder="Type your message (Handshake limited)..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                    rows={1}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md text-muted-foreground hover:bg-muted"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md text-muted-foreground hover:bg-muted"
                      >
                        <ImagePlus size={16} />
                      </Button>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold tracking-tight",
                        newMessage.length > 450 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {newMessage.length}/500
                    </span>
                  </div>
                </div>
                <Button type="submit" size="icon" className="size-10 shrink-0 rounded-md" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4 border border-dashed border-muted-foreground/30 text-muted-foreground/40">
              <MessagesSquare size={32} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">No conversation selected</h2>
            <p className="text-sm text-muted-foreground max-w-[240px] mt-1">
              Select a user from the sidebar to start coordination or view status.
            </p>
            <Button variant="outline" size="sm" className="mt-6 rounded-md shadow-none" onClick={() => {}}>
              New Handshake
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
