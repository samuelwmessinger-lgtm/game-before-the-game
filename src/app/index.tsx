import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// ---------- PLACEHOLDER DATA (fake players, to be replaced with verified facts) ----------
type Player = { name: string; number: number; position: string };
type Question = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

const PLAYERS: Player[] = [
  { name: "Player One", number: 1, position: "Guard" },
  { name: "Player Two", number: 12, position: "Forward" },
  { name: "Player Three", number: 23, position: "Center" },
];

const QUESTIONS: Question[] = [
  {
    prompt: "Which number does Player Two wear?",
    options: ["1", "12", "23"],
    answer: "12",
    explanation: "Player Two wears #12.",
  },
  {
    prompt: "Who plays Center?",
    options: ["Player One", "Player Two", "Player Three"],
    answer: "Player Three",
    explanation: "Player Three is the Center, wearing #23.",
  },
  {
    prompt: "What position does Player One play?",
    options: ["Guard", "Forward", "Center"],
    answer: "Guard",
    explanation: "Player One is a Guard, wearing #1.",
  },
];

type Stage = "pick" | "teach" | "cards" | "quiz" | "results";

// ---------- A reusable button ----------
function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

// ---------- THE APP ----------
export default function App() {
  const [stage, setStage] = useState<Stage>("pick");
  const [team, setTeam] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [xp, setXp] = useState(0);

  const question = QUESTIONS[qIndex];
  const player = PLAYERS[cardIndex];

  function startLesson(chosenTeam: string) {
    setTeam(chosenTeam);
    setCardIndex(0);
    setFlipped(false);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setMissed([]);
    setStage("teach");
  }

  function nextCard() {
    setFlipped(false);
    if (cardIndex + 1 < PLAYERS.length) {
      setCardIndex(cardIndex + 1);
    } else {
      setStage("quiz");
    }
  }

  function answerQuestion(option: string) {
    if (selected !== null) return; // already answered
    setSelected(option);
    if (option === question.answer) {
      setScore(score + 1);
      setXp(xp + 10);
    } else {
      setMissed([...missed, question]);
    }
  }

  function nextQuestion() {
    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1);
      setSelected(null);
    } else {
      setStage("results");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ---- PICK A TEAM ---- */}
      {stage === "pick" && (
        <>
          <Text style={styles.title}>The Game Before the Game</Text>
          <Text style={styles.subtitle}>Pick your team to start learning</Text>
          <Button label="Duke" onPress={() => startLesson("Duke")} />
          <Button label="UNC" onPress={() => startLesson("UNC")} />
        </>
      )}

      {/* ---- TEACHING CARD ---- */}
      {stage === "teach" && (
        <>
          <Text style={styles.title}>{team} Roster Basics</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              A roster lists every player on the team, along with their jersey
              number and position. Knowing these three things is the first
              step to following any game.
            </Text>
            {PLAYERS.map((p) => (
              <Text key={p.name} style={styles.listItem}>
                #{p.number} {p.name} ({p.position})
              </Text>
            ))}
          </View>
          <Text style={styles.note}>
            Placeholder players for testing only.
          </Text>
          <Button label="Continue to flashcards" onPress={() => setStage("cards")} />
        </>
      )}

      {/* ---- FLASHCARDS ---- */}
      {stage === "cards" && (
        <>
          <Text style={styles.subtitle}>
            Flashcard {cardIndex + 1} of {PLAYERS.length}
          </Text>
          <Pressable style={styles.flashcard} onPress={() => setFlipped(!flipped)}>
            {flipped ? (
              <Text style={styles.flashText}>
                #{player.number}, {player.position}
              </Text>
            ) : (
              <>
                <Text style={styles.flashText}>{player.name}</Text>
                <Text style={styles.note}>Tap to flip</Text>
              </>
            )}
          </Pressable>
          <Button
            label={cardIndex + 1 < PLAYERS.length ? "Next card" : "Start quiz"}
            onPress={nextCard}
          />
        </>
      )}

      {/* ---- QUIZ ---- */}
      {stage === "quiz" && (
        <>
          <Text style={styles.subtitle}>
            Question {qIndex + 1} of {QUESTIONS.length}
          </Text>
          <Text style={styles.title}>{question.prompt}</Text>
          {question.options.map((option) => {
            const answered = selected !== null;
            const isCorrect = option === question.answer;
            const isPicked = option === selected;
            return (
              <Pressable
                key={option}
                style={[
                  styles.button,
                  answered && isCorrect && styles.correct,
                  answered && isPicked && !isCorrect && styles.wrong,
                ]}
                onPress={() => answerQuestion(option)}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </Pressable>
            );
          })}
          {selected !== null && (
            <>
              <Text style={styles.feedback}>
                {selected === question.answer ? "Correct! " : "Not quite. "}
                {question.explanation}
              </Text>
              <Button
                label={qIndex + 1 < QUESTIONS.length ? "Next question" : "See results"}
                onPress={nextQuestion}
              />
            </>
          )}
        </>
      )}

      {/* ---- RESULTS ---- */}
      {stage === "results" && (
        <>
          <Text style={styles.title}>Lesson complete!</Text>
          <Text style={styles.subtitle}>
            Score: {score} of {QUESTIONS.length}
          </Text>
          <Text style={styles.xp}>+{xp} XP earned</Text>
          {missed.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardText}>Added to your review queue:</Text>
              {missed.map((q) => (
                <Text key={q.prompt} style={styles.listItem}>
                  {q.explanation}
                </Text>
              ))}
            </View>
          )}
          <Button label="Try the lesson again" onPress={() => startLesson(team)} />
          <Button label="Pick a different team" onPress={() => setStage("pick")} />
        </>
      )}
    </ScrollView>
  );
}

// ---------- LOOKS ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 16,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#334155",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "600" },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 18,
    width: "90%",
    maxWidth: 400,
    marginBottom: 12,
  },
  cardText: { color: "white", fontSize: 16, lineHeight: 22, marginBottom: 10 },
  listItem: { color: "#cbd5e1", fontSize: 16, marginTop: 6 },
  note: { color: "#64748b", fontSize: 13, marginBottom: 16, marginTop: 4 },
  flashcard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#334155",
  },
  flashText: { color: "white", fontSize: 28, fontWeight: "bold" },
  correct: { borderColor: "#22c55e" },
  wrong: { borderColor: "#ef4444" },
  feedback: {
    color: "#e2e8f0",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
    maxWidth: 400,
  },
  xp: { color: "#22c55e", fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});