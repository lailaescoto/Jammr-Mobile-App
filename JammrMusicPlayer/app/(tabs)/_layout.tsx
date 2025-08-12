import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet, Text } from "react-native";

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "black",
              borderBottomWidth: 2,        
              borderBottomColor: "#1DB954" 
            },
            headerTitle: () => (
                <Text style={styles.headerTitle}>🎧 Jammr</Text>
            ),
            headerTitleAlign: "left",
            tabBarActiveTintColor: "#1DB954",
            tabBarInactiveTintColor: "white", 
            tabBarStyle: {
              backgroundColor: "black", 
              borderTopWidth: 3,
              borderColor: "#1DB954",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: "Library",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="now-playing"
            options={{
              title: "Now Playing",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="musical-notes" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="playlists"
            options={{
              title: "Playlists",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Search",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  headerTitle: {
    color: "#1DB954",
    fontSize: 20,
    fontWeight: "bold",
  }
});
