import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Jammr</Text>
      <Text style={styles.description}>
        Streamline your music experience with our offline mobile player.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 8,
  },
});
