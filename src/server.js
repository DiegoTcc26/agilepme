const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/status', (req, res) => {
  res.json({ sistema: 'AgilePME', status: 'online' });
});

app.get('/api/tarefas', (req, res) => {
  db.all('SELECT * FROM tarefas ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.post('/api/tarefas', (req, res) => {
  const {
    projetoId,
    sprintId,
    titulo,
    descricao,
    prioridade,
    status,
    responsavelId,
    prazo
  } = req.body;

  if (!projetoId || !titulo || !prioridade || !status) {
    return res.status(400).json({ erro: 'Campos obrigatórios não informados.' });
  }

  const sql = `
    INSERT INTO tarefas
    (projeto_id, sprint_id, titulo, descricao, prioridade, status, responsavel_id, prazo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    projetoId, sprintId || null, titulo, descricao || '',
    prioridade, status, responsavelId || null, prazo || null
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ erro: err.message });

    db.get('SELECT * FROM tarefas WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ erro: err2.message });
      res.status(201).json(row);
    });
  });
});

app.patch('/api/tarefas/:id/status', (req, res) => {
  const { status } = req.body;

  db.run(
    'UPDATE tarefas SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      if (this.changes === 0) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
      res.json({ mensagem: 'Status atualizado com sucesso.' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`AgilePME disponível em http://localhost:${PORT}`);
});
