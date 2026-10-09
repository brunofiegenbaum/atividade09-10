import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Inicio() {
  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Atividade SQLite" }} />
      <Text style={styles.titulo}>Minhas atividades</Text>
      <Text style={styles.subtitulo}>Selecione uma das telas abaixo.</Text>

      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Agenda de contatos</Text>
        <Text style={styles.detalhe}>Cadastre nome e telefone.</Text>
        <Link href="/agenda" style={styles.link}>Abrir agenda →</Link>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Biblioteca pessoal</Text>
        <Text style={styles.detalhe}>Organize os seus livros.</Text>
        <Link href="/biblioteca" style={styles.link}>Abrir biblioteca →</Link>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Lista de compras</Text>
        <Text style={styles.detalhe}>Controle os itens comprados.</Text>
        <Link href="/compras" style={styles.link}>Abrir compras →</Link>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Avaliação de filmes</Text>
        <Text style={styles.detalhe}>Avalie seus filmes de 0 a 10.</Text>
        <Link href="/filmes" style={styles.link}>Abrir filmes →</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16 },
  titulo: { fontSize: 23, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  cartao: { backgroundColor: "#F1F3F6", borderRadius: 12, padding: 16, marginBottom: 12, gap: 6 },
  cartaoTitulo: { fontSize: 17, fontWeight: "600", color: "#111827" },
  detalhe: { fontSize: 14, color: "#374151" },
  link: { fontSize: 15, fontWeight: "600", color: "#2354D6", marginTop: 4 },
});
