import { useState } from "react";
import { StyleSheet, Text, TextInput, Pressable, Keyboard, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGoals } from "../../hooks/useGoals";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig";

const Create = () => {
  const [mode, setMode] = useState("card");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [choices, setChoices] = useState([""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const { createGoal } = useGoals();
  const router = useRouter();

  const handleAddChoice = () => setChoices([...choices, ""]);
  const handleChoiceChange = (text, index) => {
    const updated = [...choices];
    updated[index] = text;
    setChoices(updated);
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    let payload = {
      type: mode,
      question,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      progress: 0,
    };

    if (mode === "card") {
      if (!answer.trim()) return;
      payload.answer = answer;
    } else {
      if (!correctAnswer.trim() || choices.length < 2) return;
      payload.correctAnswer = correctAnswer;
      payload.choices = choices.filter(c => c.trim());
    }

    await createGoal(payload);
    setQuestion("");
    setAnswer("");
    setCorrectAnswer("");
    setChoices([""]);
    Keyboard.dismiss();
    router.push("/goals");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New</Text>

        {/* Toggle buttons */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleButton, mode === "card" && styles.activeToggle]}
            onPress={() => setMode("card")}
          >
            <Text style={styles.toggleText}>Card</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, mode === "mcq" && styles.activeToggle]}
            onPress={() => setMode("mcq")}
          >
            <Text style={styles.toggleText}>Multiple Choice</Text>
          </Pressable>
        </View>

        {/* Question input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your question"
          placeholderTextColor="#677E8A"
          value={question}
          onChangeText={setQuestion}
        />

        {mode === "card" ? (
          <TextInput
            style={styles.input}
            placeholder="Enter the answer"
            placeholderTextColor="#677E8A"
            value={answer}
            onChangeText={setAnswer}
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Correct Answer"
              placeholderTextColor="#677E8A"
              value={correctAnswer}
              onChangeText={setCorrectAnswer}
            />

            {/* Render choices using map instead of FlatList */}
            {choices.map((choice, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Choice ${index + 1}`}
                placeholderTextColor="#677E8A"
                value={choice}
                onChangeText={(text) => handleChoiceChange(text, index)}
              />
            ))}

            <Pressable onPress={handleAddChoice} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>+ Add Choice</Text>
            </Pressable>
          </>
        )}

        <Pressable onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>{mode === "card" ? "Add Card" : "Add Question"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1D21",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E0B4B2",
    marginBottom: 20,
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#3A4B55",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#622347",
  },
  toggleText: {
    color: "#E0B4B2",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "#ABAFB5",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    color: "#0E1D21",
  },
  button: {
    width: "100%",
    padding: 16,
    backgroundColor: "#622347",
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#E0B4B2",
    fontWeight: "bold",
    fontSize: 16,
  },
  smallButton: {
    padding: 12,
    backgroundColor: "#3A4B55",
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  smallButtonText: {
    color: "#E0B4B2",
    fontWeight: "600",
  },
});
