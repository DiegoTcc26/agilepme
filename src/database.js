const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'agilepme.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projeto_id INTEGER NOT NULL,
      sprint_id INTEGER,
      titulo TEXT NOT NULL,
      descricao TEXT,
      prioridade TEXT NOT NULL,
      status TEXT NOT NULL,
      responsavel_id INTEGER,
      prazo DATE
    )
  `);

  db.get('SELECT COUNT(*) AS total FROM tarefas', [], (err, row) => {
    if (!err && row.total === 0) {
      const stmt = db.prepare(`
        INSERT INTO tarefas
        (projeto_id, sprint_id, titulo, descricao, prioridade, status, responsavel_id, prazo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const exemplos = [
        [1, 3, 'Criar relatório mensal', 'Relatório de acompanhamento', 'Média', 'Backlog', 1, '2026-10-15'],
        [1, 3, 'Validar cadastro de clientes', 'Revisar campos obrigatórios', 'Alta', 'A Fazer', 2, '2026-10-10'],
        [1, 3, 'Tela de autenticação', 'Validar login', 'Alta', 'Em Andamento', 1, '2026-10-08'],
        [1, 3, 'Dashboard inicial', 'Exibir indicadores principais', 'Média', 'Em Revisão', 2, '2026-10-07'],
        [1, 2, 'Modelagem do banco', 'Criar estrutura SQLite', 'Alta', 'Concluído', 1, '2026-09-20']
      ];

      exemplos.forEach(t => stmt.run(t));
      stmt.finalize();
    }
  });
});

module.exports = db;
