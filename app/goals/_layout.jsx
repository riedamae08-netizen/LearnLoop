import { Tabs } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import { GoalsProvider } from '../../contexts/GoalsContext'
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../firebaseConfig"
import { useRouter } from "expo-router"
import { View, ActivityIndicator, StyleSheet, Text } from "react-native"

export default function LearnLoopLayout() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth/login")
      }
      setChecking(false)
    })
    return unsub
  }, [])

  if (checking) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
      </View>
    )
  }

  return (
    <GoalsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF6F61', // primary palette color
          tabBarInactiveTintColor: '#A0A0A0',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Your Decks',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'book' : 'book-outline'}
                color={focused ? '#FF6F61' : '#A0A0A0'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create Card',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'add-circle' : 'add-circle-outline'}
                color={focused ? '#FF6F61' : '#A0A0A0'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="edit/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GoalsProvider>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B2A33', // dark background
  },
  tabBar: {
    backgroundColor: '#0E1D21', // LearnLoop primary background
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: 70,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '600',
  },
})
