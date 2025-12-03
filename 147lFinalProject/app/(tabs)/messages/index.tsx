import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Messages() {
  const router = useRouter();
  const EXAMPLE_CHAT_ID = "example";
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.messageBox}
        onPress={() => router.push(`/messages/${EXAMPLE_CHAT_ID}`)}
      >
        <View style={styles.boxContent}>
          <Text style={styles.emojiText}>😊</Text>

          <View style={styles.textArea}>
            <Text style={styles.groupNameText}>Example Group</Text>
            <Text style={styles.messageText}>Example Message</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 5,
  },
  messageBox: {
    flex: 0.15,
    backgroundColor: "#cdefffff",
    width: "100%",
    //borderWidth: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: "8%",
  },
  boxContent: {
    flexDirection: "row",
    marginLeft: "4%",
    gap: 10,
  },
  groupNameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 15,
  },
  textArea: {
    flexDirection: "column",
    gap: 5,
  },
  emojiText: {
    fontSize: 40,
  },
});
