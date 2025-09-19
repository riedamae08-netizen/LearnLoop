import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Decks = () => {
  const [cards, setCards] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [menuVisible, setMenuVisible] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "goals"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(list);
    });
    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "goals", id));
          } catch (error) {
            console.log("Error deleting card:", error);
          }
        },
      },
    ]);
  };

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChoiceSelect = (cardId, choice) => {
    setSelectedChoices((prev) => ({ ...prev, [cardId]: choice }));
  };

  const progressCount =
    Object.values(revealed).filter(Boolean).length +
    Object.values(selectedChoices).filter(Boolean).length;

  const renderCard = ({ item }) => {
    const isMCQ = item.type === "mcq";
    const selected = selectedChoices[item.id];

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <Text style={styles.question}>{item.question || "No Question"}</Text>
          <Pressable
            onPress={() =>
              setMenuVisible(menuVisible === item.id ? null : item.id)
            }
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#E0B4B2" />
          </Pressable>
        </View>

        {!isMCQ && revealed[item.id] && (
          <Text style={styles.answer}>{item.answer || "No Answer"}</Text>
        )}

        {isMCQ && (
  <View style={{ marginTop: 10 }}>
    {item.choices?.map((choice, idx) => {
      let bg = "#3A4B55"; // default card background
      let textColor = "#E0B4B2";

      if (revealed[item.id]) {
        if (choice === item.correctAnswer) bg = "#4CAF50"; // correct
        else if (selected === choice) bg = "#E57373"; // wrong
      } else if (selected === choice) {
        bg = "#6C63FF"; // selected but not revealed
      }

      return (
        <Pressable
          key={idx}
          style={[
            styles.choiceButton,
            {
              backgroundColor: bg,
              borderWidth: 1,
              borderColor: "#657183ff",
              paddingVertical: 12,
              paddingHorizontal: 12,
            },
          ]}
          onPress={() =>
            !revealed[item.id] && handleChoiceSelect(item.id, choice)
          }
        >
          <Text
            style={[
              styles.choiceText,
              { color: textColor, fontWeight: "600" },
            ]}
          >
            {choice}
          </Text>
        </Pressable>
      );
    })}

    <Pressable
      style={[styles.button, { backgroundColor: "#622347", marginTop: 10 }]}
      onPress={() => toggleReveal(item.id)}
    >
      <Text style={styles.buttonText}>Show Answer</Text>
    </Pressable>
  </View>
)}


        {!isMCQ && (
          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: "#622347" }]}
              onPress={() => toggleReveal(item.id)}
            >
              <Text style={styles.buttonText}>
                {revealed[item.id] ? "Hide Answer" : "Show Answer"}
              </Text>
            </Pressable>
          </View>
        )}

        {menuVisible === item.id && (
          <View style={styles.menu}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(null);
                router.push(`/goals/edit/${item.id}`);
              }}
            >
              <Text style={{ color: "#E0B4B2" }}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(null);
                handleDelete(item.id);
              }}
            >
              <Text style={{ color: "#E57373" }}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Decks</Text>
      <Text style={styles.progressText}>
        Progress: {progressCount}/{cards.length} reviewed
      </Text>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No cards yet. Add one!</Text>
        }
      />

      <Pressable
        style={[styles.button, { backgroundColor: "#D32F2F", margin: 16 }]}
        onPress={() => signOut(auth)}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Decks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1D21",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
    color: "#E0B4B2",
  },
  progressText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#ABAFB5",
  },
  cardItem: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#3A4B55",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0B4B2",
  },
  answer: {
    fontSize: 16,
    marginTop: 8,
    color: "#E0B4B2",
  },
  choiceButton: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: "center",
  },
  choiceText: {
    fontSize: 16,
    color: "#E0B4B2",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "#E0B4B2",
    fontWeight: "bold",
  },
  menu: {
    backgroundColor: "#2A3A44",
    borderRadius: 10,
    marginTop: 8,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    color: "#ABAFB5",
  },
});
