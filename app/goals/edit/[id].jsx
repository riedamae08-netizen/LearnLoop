import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const EditCard = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("card"); 
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [choices, setChoices] = useState([""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const docRef = doc(db, "goals", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMode(data.type || "card");
          setQuestion(data.question || "");
          if (data.type === "card") {
            setAnswer(data.answer || "");
          } else {
            setChoices(data.choices || [""]);
            setCorrectAnswer(data.correctAnswer || "");
          }
        }
      } catch (error) {
        console.log("Error fetching card:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  const handleChoiceChange = (text, index) => {
    const updated = [...choices];
    updated[index] = text;
    setChoices(updated);
  };

  const addChoice = () => setChoices([...choices, ""]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "goals", id);
      const payload = { question, updatedAt: new Date() };

      if (mode === "card") {
        payload.answer = answer;
      } else {
        payload.choices = choices.filter((c) => c.trim());
        payload.correctAnswer = correctAnswer;
      }

      await updateDoc(docRef, payload);
      Keyboard.dismiss();
      router.push("/goals");
    } catch (error) {
      console.log("Error updating card:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E0B4B2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit {mode === "card" ? "Card" : ""}</Text>

      <TextInput
        style={styles.input}
        placeholder="Question"
        placeholderTextColor="#ABAFB5"
        value={question}
        onChangeText={setQuestion}
      />

      {mode === "card" ? (
        <TextInput
          style={styles.input}
          placeholder="Answer"
          placeholderTextColor="#ABAFB5"
          value={answer}
          onChangeText={setAnswer}
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Correct Answer"
            placeholderTextColor="#ABAFB5"
            value={correctAnswer}
            onChangeText={setCorrectAnswer}
          />

          {choices.map((choice, idx) => (
            <TextInput
              key={idx}
              style={styles.choiceInput}
              placeholder={`Choice ${idx + 1}`}
              placeholderTextColor="#ABAFB5"
              value={choice}
              onChangeText={(text) => handleChoiceChange(text, idx)}
            />
          ))}

          <Pressable style={styles.addButton} onPress={addChoice}>
            <Text style={styles.addButtonText}>+ Add Choice</Text>
          </Pressable>
        </>
      )}

      <Pressable style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>
          Update Card {mode === "card" ? "Card" : ""}
        </Text>
      </Pressable>
    </View>
  );
};

export default EditCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1D21",
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E0B4B2",
    marginBottom: 20,
    marginTop: 50,
  },
  input: {
    width: "100%",
    backgroundColor: "#3A4B55",
    color: "#E0B4B2",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
  },
  choiceInput: {
    width: "100%",
    backgroundColor: "#5A6670",
    color: "#E0B4B2",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
  },
  button: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#622347",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#E0B4B2",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  addButtonText: {
    color: "#E0B4B2",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
