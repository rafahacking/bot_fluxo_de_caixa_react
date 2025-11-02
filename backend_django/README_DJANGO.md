# Backend Django - Sistema de Fluxo de Caixa

## 🚀 Instalação e Configuração

### 1. Criar ambiente virtual (recomendado)

```bash
cd backend_django
python -m venv venv
```

### 2. Ativar ambiente virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Aplicar migrações

```bash
python manage.py migrate
```

### 5. Criar superusuário (opcional - para acessar admin)

```bash
python manage.py createsuperuser
```

### 6. Iniciar servidor

```bash
python manage.py runserver
```

O servidor estará rodando em: **http://localhost:8000**

---

## 📁 Estrutura do Projeto

```
backend_django/
│
├── fluxo_caixa/              # Configurações do projeto
│   ├── __init__.py
│   ├── settings.py           # Configurações principais
│   ├── urls.py               # URLs principais
│   ├── wsgi.py
│   └── asgi.py
│
├── api/                      # App de API
│   ├── __init__.py
│   ├── views.py              # Lógica das rotas
│   ├── urls.py               # URLs da API
│   ├── models.py             # Modelos (vazio por enquanto)
│   └── admin.py              # Admin (vazio por enquanto)
│
├── manage.py                 # Gerenciador Django
└── requirements.txt          # Dependências
```

---

## 🔌 Endpoints da API

### POST /api/login
Faz login no sistema

**Request:**
```json
{
  "username": "rafael",
  "password": "12345"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "rafael",
    "name": "Rafael Nunes"
  }
}
```

**Response (401):**
```json
{
  "message": "Usuário ou senha inválidos"
}
```

### GET /api/verify
Verifica se o token é válido (requer autenticação)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "rafael",
    "name": "Rafael Nunes"
  }
}
```

**Response (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## ⚙️ Configurações Importantes

### settings.py

**CORS (Comunicação com React):**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

**JWT (Tokens):**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    ...
}
```

**Apps Instalados:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api',
]
```

---

## 🔐 Credenciais

**Usuário do Sistema:**
- Username: `rafael`
- Password: `12345`

**Admin Django (após criar superusuário):**
- Acesse: http://localhost:8000/admin
- Use as credenciais que você criou

---

## 🛠️ Comandos Úteis

### Criar migrações
```bash
python manage.py makemigrations
```

### Aplicar migrações
```bash
python manage.py migrate
```

### Criar superusuário
```bash
python manage.py createsuperuser
```

### Rodar servidor
```bash
python manage.py runserver
```

### Rodar em outra porta
```bash
python manage.py runserver 8080
```

### Shell interativo
```bash
python manage.py shell
```

---

## 📦 Dependências

- **Django 4.2.7**: Framework web
- **djangorestframework 3.14.0**: API REST
- **djangorestframework-simplejwt 5.3.0**: Autenticação JWT
- **django-cors-headers 4.3.0**: CORS para React

---

## 🔄 Diferenças do Node.js

| Aspecto | Node.js + Express | Django |
|---------|-------------------|--------|
| **Porta padrão** | 5000 | 8000 |
| **Arquivo principal** | server.js | manage.py |
| **Rotas** | app.post('/api/login') | @api_view(['POST']) |
| **Resposta** | res.json({...}) | Response({...}) |
| **Middleware** | app.use(cors()) | CORS_ALLOWED_ORIGINS |
| **JWT** | jsonwebtoken | djangorestframework-simplejwt |

---

## 🎯 Vantagens do Django

✅ **Admin Panel**: Interface administrativa automática
✅ **ORM**: Banco de dados sem SQL
✅ **Segurança**: Proteções built-in
✅ **Migrations**: Controle de versão do banco
✅ **Documentação**: Excelente e completa
✅ **Escalabilidade**: Pronto para projetos grandes

---

## 🐛 Troubleshooting

### Erro: "No module named 'rest_framework'"
```bash
pip install -r requirements.txt
```

### Erro: "Port 8000 is already in use"
```bash
python manage.py runserver 8080
```

### Erro: "CORS error"
Verifique se o React está em http://localhost:3000 e se está no CORS_ALLOWED_ORIGINS

### Erro: "Invalid token"
O token expirou (24h). Faça login novamente.

---

## 📚 Próximos Passos (Opcional)

1. **Adicionar banco de dados PostgreSQL**
2. **Criar modelos de usuário customizados**
3. **Adicionar mais endpoints**
4. **Implementar refresh tokens**
5. **Adicionar testes unitários**
6. **Deploy em produção**

---

## 🔗 Links Úteis

- [Documentação Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [CORS Headers](https://github.com/adamchainz/django-cors-headers)
