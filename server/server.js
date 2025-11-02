const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'sua_chave_secreta_super_segura_aqui_12345';

app.use(cors());
app.use(express.json());

const hashedPassword = '$2b$10$xQZ9YvXKZH5qYvXKZH5qYOxQZ9YvXKZH5qYvXKZH5qYOxQZ9YvXK';

const users = [
  {
    id: 1,
    username: 'rafael',
    password: hashedPassword,
    name: 'Rafael Nunes'
  }
];

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    if (password === '12345') {
      const token = jwt.sign(
        { id: user.id, username: user.username, name: user.name },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      });
    }

    return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
