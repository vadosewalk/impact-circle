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
  Plus,
  User as UserIcon,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@impact/ui/components/avatar";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { ScrollArea } from "@impact/ui/components/scroll-area";
import { Separator } from "@impact/ui/components/separator";
import { Input } from "@impact/ui/components/input";
import { cn, getDisplayNameInitials } from "@impact/ui/lib/utils";
import { toast } from "@impact/ui/components/sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  contact: {
    id: string;
    name: string;
    image: string;
    trustScore: number;
  };
  lastMessage: Message;
}

export default function MessagesPage() {
  const { data: session, isPending } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUser = searchParams.get("user");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get<{ data: Conversation[] }>("/api/messages");
      setConversations(res.data || []);

      // If we have a preselected user and it's not in the list, we'll handle it later
      if (preselectedUser && !selectedContact) {
        setSelectedContact(preselectedUser);
      }
    } catch {
      toast.error("Failed to load handshakes");
    } finally {
      setIsLoading(false);
    }
  }, [preselectedUser, selectedContact]);

  const fetchConversationMessages = useCallback(async (contactId: string) => {
    try {
      setIsMessagesLoading(true);
      const res = await api.get<{ data: Message[] }>(`/api/messages/${contactId}`);
      setActiveMessages(res.data || []);
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    if (session) fetchConversations();
  }, [session, isPending, router, fetchConversations]);

  useEffect(() => {
    if (selectedContact) {
      fetchConversationMessages(selectedContact);
    }
  }, [selectedContact, fetchConversationMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await api.post("/api/messages/send", {
        receiverId: selectedContact,
        content: newMessage,
      });
      setNewMessage("");
      // Refresh current conversation
      fetchConversationMessages(selectedContact);
      // Refresh conversation list to update last message
      fetchConversations();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeContact = conversations.find((c) => c.contact.id === selectedContact)?.contact;

  if (isPending || isLoading)
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-background">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <section className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden max-w-7xl mx-auto">
      {/* Inbox List - Left Side */}
      <div className={cn("flex w-full flex-col gap-2 sm:w-64 lg:w-80", selectedContact && "hidden sm:flex")}>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter uppercase">Inbox</h1>
            <MessagesSquare size={18} className="text-primary" />
          </div>
          <Button size="icon" variant="ghost" className="rounded-lg size-8">
            <Edit size={18} className="text-muted-foreground" />
          </Button>
        </div>

        <div className="relative mb-4">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="h-9 w-full rounded-sm border border-input bg-muted/20 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
            placeholder="Search handshakes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="-mx-2 flex-1">
          <div className="px-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isSelected = selectedContact === conv.contact.id;

              return (
                <Fragment key={conv.contact.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 rounded-sm px-3 py-3 text-start text-sm transition-colors group relative",
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30",
                    )}
                    onClick={() => setSelectedContact(conv.contact.id)}
                  >
                    <Avatar className="size-10 border shrink-0 rounded-sm">
                      <AvatarImage src={conv.contact.image} />
                      <AvatarFallback className="text-[10px] rounded-sm">
                        {getDisplayNameInitials(conv.contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold truncate text-[13px]">{conv.contact.name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                          {format(new Date(conv.lastMessage.createdAt), "MMM d")}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-[12px] text-muted-foreground leading-tight">
                        {conv.lastMessage.senderId === session?.user.id ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </button>
                  <Separator className="opacity-40" />
                </Fragment>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="py-20 text-center text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-40">
                No handshakes found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window - Right Side */}
      <div
        className={cn(
          "flex-1 flex-col border rounded-sm bg-background shadow-sm overflow-hidden flex",
          !selectedContact && "hidden sm:flex",
        )}
      >
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="flex-none h-14 flex items-center justify-between px-4 border-b bg-muted/5">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="-ml-2 size-8 sm:hidden"
                  onClick={() => setSelectedContact(null)}
                >
                  <ArrowLeft size={18} />
                </Button>
                <Avatar className="size-9 border rounded-sm">
                  <AvatarImage src={activeContact?.image} />
                  <AvatarFallback className="text-[10px] rounded-sm">
                    {getDisplayNameInitials(activeContact?.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[13px] font-black uppercase tracking-tight">
                    {activeContact?.name || "User " + selectedContact.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] text-primary font-black uppercase">
                    <TrendingUp className="size-3" />
                    Trust Score: {activeContact?.trustScore || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="size-8 rounded-full">
                  <Video size={18} className="text-muted-foreground/50" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8 rounded-full">
                  <Phone size={18} className="text-muted-foreground/50" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8">
                  <MoreVertical size={18} className="text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="flex flex-col-reverse gap-4 min-h-full">
                {isMessagesLoading ? (
                  <div className="flex justify-center py-10 opacity-50">
                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  activeMessages.map((msg: Message) => {
                    const isMe = msg.senderId === session?.user.id;
                    return (
                      <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] px-3 py-2 rounded-sm text-sm shadow-none border",
                            isMe ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border",
                          )}
                        >
                          <p className="leading-relaxed text-[13px]">{msg.content}</p>
                          <div
                            className={cn(
                              "text-[9px] mt-1.5 flex items-center gap-1 opacity-70 font-black uppercase tracking-tighter",
                              isMe ? "justify-end" : "justify-start",
                            )}
                          >
                            <Clock className="size-2.5" />
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="text-center py-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/40 px-2 py-1 rounded-sm border border-muted-foreground/10">
                    Handshake Protocol Established
                  </span>
                </div>
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-2 rounded-sm border bg-background p-2 focus-within:ring-1 focus-within:ring-primary transition-all">
                  <textarea
                    className="w-full resize-none bg-transparent text-[13px] focus:outline-none min-h-[40px] max-h-32 p-1"
                    placeholder="Coordinate your handshake support..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                    rows={1}
                  />
                  <div className="flex items-center justify-between border-t pt-2 border-muted/30">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-sm text-muted-foreground hover:bg-muted"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-sm text-muted-foreground hover:bg-muted"
                      >
                        <UserIcon size={16} />
                      </Button>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black tracking-widest uppercase",
                        newMessage.length > 450 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {newMessage.length}/500
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="size-11 shrink-0 rounded-sm font-black"
                  disabled={!newMessage.trim() || isMessagesLoading}
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="size-20 rounded-sm bg-muted/30 flex items-center justify-center mb-6 border border-dashed border-muted-foreground/30 text-muted-foreground/40">
              <MessagesSquare size={40} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">Select a Handshake</h2>
            <p className="text-xs text-muted-foreground max-w-[280px] mt-2 font-medium">
              Choose a coordinator or community member from the sidebar to start a secure coordination channel.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-8 rounded-sm font-black text-[10px] uppercase tracking-widest h-9"
              onClick={() => router.push("/dashboard")}
            >
              Browse Timeline
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
