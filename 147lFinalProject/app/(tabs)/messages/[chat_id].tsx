import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const MessageBubble = ({ text, isMe }: { text: string; isMe: boolean }) => (
  <View
    style={[
      styles.messageBubble,
      isMe ? styles.myMessage : styles.theirMessage,
    ]}
  >
    <Text
      style={[
        styles.messageText,
        isMe ? { color: "white" } : { color: "black" },
      ]}
    >
      {text}
    </Text>
  </View>
);
export default function ChatRoom() {
  const router = useRouter();
  const { chat_id } = useLocalSearchParams();

  //const groupName = `Chat Group ${chat_id}`;
  const messages = [
    {
      id: 1,
      text: "Hey, can you meet us at the coffee shop?",
      sender: "Alice",
      isMe: false,
    },
    {
      id: 2,
      text: "Yes, I will be there in 10!",
      sender: "Me",
      isMe: true,
    },
    {
      id: 3,
      text: "See you soon!",
      sender: "Alice",
      isMe: false,
    },
  ];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.chatTitle}
          onPress={() => router.push("/messages")}
        >
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <View style={styles.chatTitle}>
          <Text style={styles.titleText}>Example Group</Text>
        </View>
      </View>

      <ScrollView
        style={styles.messagesView}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={
              message.isMe
                ? styles.myMessageWrapper
                : styles.theirMessageWrapper
            }
          >
            <MessageBubble text={message.text} isMe={message.isMe} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
        />
        <Pressable
          style={styles.sendButton}
          onPress={() => console.log("Message Sent!")}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaecff",
  },
  chatTitle: {
    justifyContent: "flex-end",
    marginLeft: "3%",
  },
  titleText: {
    fontSize: 30,
  },
  backText: {
    fontSize: 30,
  },
  header: {
    flex: 0.1,
    backgroundColor: "white",
    flexDirection: "row",
  },
  messagesView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  myMessageWrapper: {
    marginRight: 10,
    alignItems: "flex-end",
    marginBottom: 15,
  },
  theirMessageWrapper: {
    marginLeft: 10,
    alignItems: "flex-start",
    marginBottom: 15,
  },
  myMessage: {
    borderRadius: 15,
    backgroundColor: "black",
  },
  theirMessage: {
    borderRadius: 15,
    backgroundColor: "white",
  },
  messageText: {
    fontSize: 16,
  },
  messageBubble: {
    padding: 12,
  },
  inputContainer: {
    flexDirection: "row",
    flex: 0.05,
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
