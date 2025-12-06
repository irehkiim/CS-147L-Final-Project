import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../supabase";
import { useEffect, useState } from "react";

interface ChatListItem {
  chat_id: string;
  event_name: string;
  last_chat: string;
  last_chat_time: string;
}

interface ChatData {
  chat_id: string;
  chats: {
    events: { name: string } | { name: string }[] | null;
    messages: { content: string; created_at: string }[];
  };
}
const CURRENT_USER_ID = "test_user_id_A";

export default function Messages() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserChats = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("chat_participants")
      .select(
        `
        chat_id,
        chats (
        events (name),
        messages (content, created_at)
        )
      `
      )
      .eq("user_id", CURRENT_USER_ID);

    if (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
      return;
    }
    const rows = data as unknown as ChatData[];
    const formattedChats: ChatListItem[] = data.map((item: any) => {
      const messages = item.chats.messages || [];
      messages.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latest = messages[0];
      const rawEvents = item.chats.events;
      const eventName = Array.isArray(rawEvents)
        ? rawEvents[0]?.name
        : (rawEvents as { name: string })?.name;

      return {
        chat_id: item.chat_id,
        event_name: eventName || "Unknown Event",
        last_chat: latest?.content || "Tap to start chatting...",
        last_chat_time: latest?.created_at || new Date(0).toISOString(),
      };
    });

    formattedChats.sort(
      (a, b) =>
        new Date(b.last_chat_time).getTime() -
        new Date(a.last_chat_time).getTime()
    );

    setChats(formattedChats);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserChats();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("chat-list-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;
          setChats((prev) => {
            const updated = prev.map((chat) => {
              if (chat.chat_id === newMessage.chat_id) {
                return {
                  ...chat,
                  last_chat: newMessage.content,
                  last_chat_time: newMessage.created_at,
                };
              }
              return chat;
            });

            return updated.sort(
              (a, b) =>
                new Date(b.last_chat_time).getTime() -
                new Date(a.last_chat_time).getTime()
            );
          });
        }
      )
      .subscribe();

    const participationChannel = supabase
      .channel("chat-list-participation")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_participants",
          filter: `user_id=eq.${CURRENT_USER_ID}`,
        },
        () => {
          console.log("Joined new chat! Refreshing list...");
          fetchUserChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(participationChannel);
    };
  }, []);
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.chat_id}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.messageBox}
            onPress={() => router.push(`/messages/${item.chat_id}`)}
          >
            <View style={styles.boxContent}>
              <Text style={styles.emojiText}>💬</Text>
              <View style={styles.textArea}>
                <Text style={styles.groupNameText}>{item.event_name}</Text>
                <Text style={styles.messageText}> {item.last_chat}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  flatListContent: {
    paddingVertical: 5,
    gap: 10,
    paddingHorizontal: 5,
    flexGrow: 1,
  },
  messageBox: {
    flex: 0.15,
    backgroundColor: "#cdefffff",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: "8%",
    paddingVertical: 20,
    // borderWidth: 3,
  },
  boxContent: {
    flexDirection: "row",
    marginLeft: "4%",
    gap: 10,
  },
  groupNameText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  textArea: {
    flexDirection: "column",
    gap: 5,
  },
  emojiText: {
    fontSize: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
