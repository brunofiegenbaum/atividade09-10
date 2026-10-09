import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

// O banco abre uma vez, fora do componente, como na aula.
const db = SQLite.openDatabaseSync("atividade.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM contatos ORDER BY id DESC");
}

function adicionar(nome, telefone) {
  db.runSync("INSERT INTO contatos (nome, telefone) VALUES (?, ?)", [nome, telefone]);
}

function editar(id, nome, telefone) {
  db.runSync("UPDATE contatos SET nome = ?, telefone = ? WHERE id = ?", [nome, telefone, id]);
}

function excluir(id) {
  db.runSync("DELETE FROM contatos WHERE id = ?", [id]);
}

export default function Agenda() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [lista, setLista] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setNome("");
    setTelefone("");
    setIdEdicao(null);
  }

  function salvar() {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert("Atenção", "Preencha o nome e o telefone.");
      return;
    }

    if (idEdicao !== null) {
      editar(idEdicao, nome.trim(), telefone.trim());
    } else {
      adicionar(nome.trim(), telefone.trim());
    }
    limpar();
    carregar();
  }

  function selecionar(item) {
    setIdEdicao(item.id);
    setNome(item.nome);
    setTelefone(item.telefone);
  }

  function remover(id) {
    Alert.alert("Excluir contato", "Deseja excluir este contato?", [
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
      <Stack.Screen options={{ title: "Agenda de contatos" }} />
      <TextInput style={styles.campo} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.campo} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <Button title={idEdicao !== null ? "Salvar alteração" : "Adicionar contato"} onPress={salvar} />
      {idEdicao !== null && <Button title="Cancelar edição" onPress={limpar} />}

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum contato cadastrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.informacoes}>
              <Text style={styles.itemTexto}>{item.nome}</Text>
              <Text style={styles.detalhe}>{item.telefone}</Text>
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
  detalhe: { color: "#6B7280", marginTop: 4 },
  botoes: { gap: 2 },
  vazio: { color: "#6B7280", textAlign: "center", marginTop: 20 },
});
