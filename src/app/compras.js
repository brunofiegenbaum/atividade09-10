import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("atividade.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    comprado INTEGER NOT NULL DEFAULT 0
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM compras ORDER BY comprado ASC, id DESC");
}

function adicionar(item, quantidade, comprado) {
  db.runSync("INSERT INTO compras (item, quantidade, comprado) VALUES (?, ?, ?)", [item, quantidade, comprado]);
}

function editar(id, item, quantidade, comprado) {
  db.runSync("UPDATE compras SET item = ?, quantidade = ?, comprado = ? WHERE id = ?", [item, quantidade, comprado, id]);
}

function excluir(id) {
  db.runSync("DELETE FROM compras WHERE id = ?", [id]);
}

function alternar(id) {
  db.runSync("UPDATE compras SET comprado = CASE WHEN comprado = 1 THEN 0 ELSE 1 END WHERE id = ?", [id]);
}

function limparComprados() {
  // Um único comando SQL exclui todos os itens comprados.
  db.runSync("DELETE FROM compras WHERE comprado = 1");
}

export default function Compras() {
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [comprado, setComprado] = useState(false);
  const [lista, setLista] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setItem("");
    setQuantidade("");
    setComprado(false);
    setIdEdicao(null);
  }

  function salvar() {
    const numeroQuantidade = Number(quantidade);
    if (!item.trim() || !/^[0-9]+$/.test(quantidade.trim()) || !Number.isSafeInteger(numeroQuantidade) || numeroQuantidade <= 0) {
      Alert.alert("Atenção", "Preencha o item e informe uma quantidade inteira maior que zero.");
      return;
    }

    if (idEdicao !== null) {
      editar(idEdicao, item.trim(), numeroQuantidade, comprado ? 1 : 0);
    } else {
      adicionar(item.trim(), numeroQuantidade, comprado ? 1 : 0);
    }
    limpar();
    carregar();
  }

  function selecionar(registro) {
    setIdEdicao(registro.id);
    setItem(registro.item);
    setQuantidade(String(registro.quantidade));
    setComprado(registro.comprado === 1);
  }

  function remover(id) {
    Alert.alert("Excluir item", "Deseja excluir este item?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => {
        excluir(id);
        if (idEdicao === id) limpar();
        carregar();
      } },
    ]);
  }

  function marcar(id) {
    alternar(id);
    if (idEdicao === id) {
      setComprado(!comprado);
    }
    carregar();
  }

  function removerComprados() {
    Alert.alert("Limpar comprados", "Excluir todos os itens marcados como comprados?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => {
        limparComprados();
        limpar();
        carregar();
      } },
    ]);
  }

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Lista de compras" }} />
      <TextInput style={styles.campo} placeholder="Item" value={item} onChangeText={setItem} />
      <TextInput style={styles.campo} placeholder="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" />
      <Pressable style={styles.marcador} onPress={() => setComprado(!comprado)}>
        <Text style={styles.itemTexto}>{comprado ? "☑" : "☐"} Comprado: {comprado ? "Sim" : "Não"}</Text>
      </Pressable>
      <Button title={idEdicao !== null ? "Salvar alteração" : "Adicionar item"} onPress={salvar} />
      {idEdicao !== null && <Button title="Cancelar edição" onPress={limpar} />}
      <View style={styles.limpar}><Button title="Limpar comprados" color="#C62828" onPress={removerComprados} /></View>
      <Text style={styles.dica}>Toque no nome do item para marcar ou desmarcar.</Text>

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(registro) => String(registro.id)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum item cadastrado.</Text>}
        renderItem={({ item: registro }) => (
          <View style={styles.item}>
            <Pressable style={styles.informacoes} onPress={() => marcar(registro.id)}>
              <Text style={[styles.itemTexto, registro.comprado === 1 && styles.riscado]}>
                {registro.comprado === 1 ? "☑" : "☐"} {registro.item}
              </Text>
              <Text style={styles.detalhe}>Quantidade: {registro.quantidade}</Text>
            </Pressable>
            <View style={styles.botoes}>
              <Button title="Editar" onPress={() => selecionar(registro)} />
              <Button title="Excluir" color="#C62828" onPress={() => remover(registro.id)} />
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
  marcador: { paddingVertical: 9, marginBottom: 8 },
  limpar: { marginTop: 10 },
  dica: { color: "#6B7280", fontSize: 12, marginTop: 10 },
  lista: { flex: 1, marginTop: 12 },
  item: { backgroundColor: "#F1F3F6", borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  informacoes: { flex: 1, paddingVertical: 8 },
  itemTexto: { fontSize: 16, fontWeight: "600", color: "#111827" },
  detalhe: { color: "#6B7280", marginTop: 4 },
  riscado: { textDecorationLine: "line-through", color: "#6B7280" },
  botoes: { gap: 2 },
  vazio: { color: "#6B7280", textAlign: "center", marginTop: 20 },
});
