import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("atividade.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS filmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    nota REAL NOT NULL
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM filmes ORDER BY id DESC");
}

function adicionar(titulo, nota) {
  db.runSync("INSERT INTO filmes (titulo, nota) VALUES (?, ?)", [titulo, nota]);
}

function editar(id, titulo, nota) {
  db.runSync("UPDATE filmes SET titulo = ?, nota = ? WHERE id = ?", [titulo, nota, id]);
}

function excluir(id) {
  db.runSync("DELETE FROM filmes WHERE id = ?", [id]);
}

export default function Filmes() {
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState("");
  const [lista, setLista] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setTitulo("");
    setNota("");
    setIdEdicao(null);
  }

  function salvar() {
    // Aceita 7,5 ou 7.5, mas salva como número REAL no SQLite.
    const notaTexto = nota.trim().replace(",", ".");
    const numeroNota = Number(notaTexto);
    if (!titulo.trim() || !notaTexto || !Number.isFinite(numeroNota) || numeroNota < 0 || numeroNota > 10) {
      Alert.alert("Atenção", "Informe um título e uma nota entre 0 e 10.");
      return;
    }

    if (idEdicao !== null) {
      editar(idEdicao, titulo.trim(), numeroNota);
    } else {
      adicionar(titulo.trim(), numeroNota);
    }
    limpar();
    carregar();
  }

  function selecionar(item) {
    setIdEdicao(item.id);
    setTitulo(item.titulo);
    setNota(String(item.nota));
  }

  function remover(id) {
    Alert.alert("Excluir filme", "Deseja excluir este filme?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => {
        excluir(id);
        if (idEdicao === id) limpar();
        carregar();
      } },
    ]);
  }

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Avaliação de filmes" }} />
      <TextInput style={styles.campo} placeholder="Título do filme" value={titulo} onChangeText={setTitulo} />
      <TextInput style={styles.campo} placeholder="Nota (0 a 10)" value={nota} onChangeText={setNota} keyboardType="decimal-pad" />
      <Button title={idEdicao !== null ? "Salvar alteração" : "Adicionar filme"} onPress={salvar} />
      {idEdicao !== null && <Button title="Cancelar edição" onPress={limpar} />}

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum filme cadastrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.informacoes}>
              <Text style={styles.itemTexto}>{item.titulo}</Text>
              <Text style={[styles.nota, { color: item.nota >= 7 ? "#16803C" : "#C62828" }]}>
                Nota: {Number(item.nota).toFixed(1)}
              </Text>
            </View>
            <View style={styles.botoes}>
              <Button title="Editar" onPress={() => selecionar(item)} />
              <Button title="Excluir" color="#C62828" onPress={() => remover(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 16 },
  campo: { borderWidth: 1, borderColor: "#D9DDE3", borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 12 },
  lista: { flex: 1, marginTop: 16 },
  item: { backgroundColor: "#F1F3F6", borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  informacoes: { flex: 1 },
  itemTexto: { fontSize: 16, fontWeight: "600", color: "#111827" },
  nota: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  botoes: { gap: 2 },
  vazio: { color: "#6B7280", textAlign: "center", marginTop: 20 },
});
