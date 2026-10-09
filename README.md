# Atividade 09/10 - SQLite

Aplicativo Expo com quatro telas de CRUD usando SQLite: agenda de contatos, biblioteca, lista de compras e avaliação de filmes.

Baseado na aula de 25/09 do professor Mateus Roveda.

## Executar

```bash
npm install
npx expo start
```

Abrir no Expo Go e navegar pela página inicial.

Cada tela usa `SQLite.openDatabaseSync`, `CREATE TABLE IF NOT EXISTS`, `runSync` com parâmetros `?` e `getAllSync`. Os dados permanecem no aparelho ao fechar o aplicativo.

## Funcionalidades

- Contatos: nome e telefone; CRUD e campos limpos após salvar.
- Livros: título, autor e páginas como INTEGER.
- Compras: item, quantidade, comprado (INTEGER 0/1); toque para alternar; limpar comprados em um DELETE.
- Filmes: título e nota REAL de 0 a 10; uma casa decimal e cores por nota.
