import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("atividade.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    paginas INTEGER NOT NULL
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM livros ORDER BY id DESC");
}

function adicionar(titulo, autor, paginas) {
  db.runSync("INSERT INTO livros (titulo, autor, paginas) VALUES (?, ?, ?)", [titulo, autor, paginas]);
}

function editar(id, titulo, autor, paginas) {
  db.runSync("UPDATE livros SET titulo = ?, autor = ?, paginas = ? WHERE id = ?", [titulo, autor, paginas, id]);
}

function excluir(id) {
  db.runSync("DELETE FROM livros WHERE id = ?", [id]);
}

export default function Biblioteca() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [paginas, setPaginas] = useState("");
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
    setAutor("");
    setPaginas("");
    setIdEdicao(null);
  }

  function salvar() {
    const numeroPaginas = Number(paginas);
    if (!titulo.trim() || !autor.trim() || !/^[0-9]+$/.test(paginas.trim()) || !Number.isSafeInteger(numeroPaginas) || numeroPaginas <= 0) {
      Alert.alert("Atenção", "Preencha os campos e informe páginas como número inteiro maior que zero.");
      return;
    }

    if (idEdicao !== null) {
      editar(idEdicao, titulo.trim(), autor.trim(), numeroPaginas);
    } else {
      adicionar(titulo.trim(), autor.trim(), numeroPaginas);
    }
    limpar();
    carregar();
  }

  function selecionar(item) {
    setIdEdicao(item.id);
    setTitulo(item.titulo);
    setAutor(item.autor);
    setPaginas(String(item.paginas));
  }

  function remover(id) {
    Alert.alert("Excluir livro", "Deseja excluir este livro?", [
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
      <Stack.Screen options={{ title: "Biblioteca pessoal" }} />
      <TextInput style={styles.campo} placeholder="Título" value={titulo} onChangeText={setTitulo} />
      <TextInput style={styles.campo} placeholder="Autor" value={autor} onChangeText={setAutor} />
      <TextInput style={styles.campo} placeholder="Páginas" keyboardType="number-pad" value={paginas} onChangeText={setPaginas} />
      <Button title={idEdicao !== null ? "Salvar alteração" : "Adicionar livro"} onPress={salvar} />
      {idEdicao !== null && <Button title="Cancelar edição" onPress={limpar} />}

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum livro cadastrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.informacoes}>
              <Text style={styles.itemTexto}>{item.titulo}</Text>
              <Text style={styles.detalhe}>{item.autor} - {item.paginas} páginas</Text>
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
