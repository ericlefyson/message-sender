# Chat em Tempo Real - Backend

Backend da aplicação de chat em tempo real utilizando WebSocket, Express.js, Prisma e PostgreSQL.

## Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express.js 5** - Framework web
- **WebSocket (ws)** - Comunicação em tempo real
- **Prisma 7** - ORM para PostgreSQL com adapter pattern
- **PostgreSQL** - Banco de dados relacional
- **pg** - Driver nativo PostgreSQL
- **CORS** - Configuração de origem cruzada
- **JWT (jsonwebtoken)** - Autenticação com tokens
- **bcrypt** - Hash de senhas

## Estrutura do Projeto

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Configuração do Prisma Client com adapter
│   ├── routes/
│   │   ├── auth.ts            # Rotas de autenticação
│   │   ├── messages.ts        # Rotas REST para mensagens
│   │   └── users.ts           # Rotas REST para usuários
│   ├── middleware/
│   │   └── authenticate.ts    # Middleware de autenticação JWT
│   ├── utils/
│   │   ├── jwt.ts             # Funções para gerenciar JWT
│   │   └── password.ts        # Funções para hash de senhas
│   ├── index.ts               # Entrada principal da aplicação
│   └── websocket.ts           # Lógica do WebSocket com autenticação
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── .env                       # Variáveis de ambiente (não versionado)
├── .env.example               # Template de variáveis de ambiente
├── docker-compose.yml         # Docker Compose para PostgreSQL
├── prisma.config.ts           # Configuração do Prisma 7
├── package.json
└── tsconfig.json
```

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chat_db"
PORT=3001
FRONTEND_URL="http://localhost:5173"

# JWT Authentication (gere secrets seguros em produção!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-this-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
```

**IMPORTANTE:** Gere secrets seguros para produção usando:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar o banco de dados

#### Opção A: Usando Docker (Recomendado)

```bash
# Iniciar PostgreSQL com Docker Compose
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs (opcional)
docker-compose logs -f postgres
```

#### Opção B: PostgreSQL local

Se você já tem PostgreSQL instalado localmente:

```bash
# macOS com Homebrew
brew services start postgresql@16

# Criar banco de dados
createdb chat_db
```

### 4. Aplicar schema ao banco de dados

```bash
# Push do schema para o banco (desenvolvimento)
npm run prisma:push
```

### 5. Gerar o Prisma Client

```bash
npm run prisma:generate
```

### 6. Iniciar o servidor

```bash
npm run dev
```

## Scripts Disponíveis

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Gerar Prisma Client
npm run prisma:generate

# Criar migration
npm run prisma:migrate

# Push schema para o banco (dev)
npm run prisma:push
```

## Documentação Swagger/OpenAPI

A API possui documentação interativa completa usando Swagger/OpenAPI!

**Acesse a documentação em:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

A documentação Swagger inclui:
- Todos os endpoints REST da API com exemplos
- Schemas de dados (User, Message, etc.)
- Autenticação JWT
- Documentação completa do protocolo WebSocket
- Exemplos de código para integração

### Recursos da Documentação Swagger

- Interface interativa para testar todos os endpoints
- Exemplos de requisição e resposta
- Schemas detalhados de todos os objetos
- Autenticação Bearer Token integrada
- Exportação da especificação OpenAPI em JSON: [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json)

## Endpoints da API REST

### Autenticação (Públicas)

#### **POST** `/api/auth/register` - Registrar novo usuário
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz..."
}
```

#### **POST** `/api/auth/login` - Fazer login
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz..."
}
```

#### **POST** `/api/auth/refresh` - Renovar access token
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz..."
}
```

#### **GET** `/api/auth/me` - Buscar dados do usuário autenticado
**Headers:** `Authorization: Bearer <accessToken>`

**Resposta:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Usuários (Protegidas - Requerem Autenticação)

**Todas as rotas abaixo requerem o header:** `Authorization: Bearer <accessToken>`

- **GET** `/api/users/all` - Listar todos os usuários

- **GET** `/api/users/:id` - Buscar usuário por ID

### Mensagens (Protegidas - Requerem Autenticação)

**Todas as rotas abaixo requerem o header:** `Authorization: Bearer <accessToken>`

- **GET** `/api/messages/:roomId` - Buscar mensagens de uma sala

- **POST** `/api/messages` - Criar mensagem (opcional, o WebSocket já faz isso)
  ```json
  {
    "content": "Olá!",
    "roomId": "room-id"
  }
  ```
  **Nota:** O `senderId` é extraído automaticamente do token JWT.

### Health Check

- **GET** `/health` - Verificar status do servidor (pública)

> **Nota:** Para informações completas e interativas sobre todos os endpoints, acesse a [documentação Swagger](http://localhost:3001/api-docs).

## WebSocket API

> **Documentação Completa:** A documentação detalhada do protocolo WebSocket está disponível na seção "WebSocket" da [documentação Swagger](http://localhost:3001/api-docs).

### Autenticação WebSocket

**IMPORTANTE:** O WebSocket agora requer autenticação via JWT!

Conecte-se ao WebSocket enviando o token na query string:

```javascript
const accessToken = localStorage.getItem('accessToken');
const ws = new WebSocket(`ws://localhost:3001?token=${accessToken}`);
```

Se o token for válido, você receberá uma mensagem de confirmação:
```json
{
  "type": "authenticated",
  "payload": {
    "userId": "user-id",
    "email": "joao@example.com"
  }
}
```

Se o token for inválido ou ausente, a conexão será fechada com códigos:
- `4001` - Token ausente
- `4002` - Token inválido ou expirado

### Eventos do Cliente para Servidor

#### 1. Join (Entrar em uma sala)
```json
{
  "type": "join",
  "payload": {
    "userId": "user-id",
    "roomId": "room-id"
  }
}
```
**Nota:** O `userId` deve corresponder ao usuário autenticado. Caso contrário, receberá erro.

#### 2. Message (Enviar mensagem)
```json
{
  "type": "message",
  "payload": {
    "content": "Olá, mundo!",
    "roomId": "room-id"
  }
}
```
**Nota:** O `senderId` é extraído automaticamente do token JWT. Não é necessário enviá-lo.

### Eventos do Servidor para Cliente

#### 1. History (Histórico de mensagens)
Enviado quando um usuário entra na sala.
```json
{
  "type": "history",
  "payload": [
    {
      "id": "message-id",
      "content": "Mensagem anterior",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "senderId": "user-id",
      "roomId": "room-id",
      "sender": {
        "id": "user-id",
        "name": "João Silva",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

#### 2. Message (Nova mensagem)
```json
{
  "type": "message",
  "payload": {
    "id": "message-id",
    "content": "Nova mensagem",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "senderId": "user-id",
    "roomId": "room-id",
    "sender": {
      "id": "user-id",
      "name": "João Silva",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 3. Join (Usuário entrou)
```json
{
  "type": "join",
  "payload": {
    "userId": "user-id"
  }
}
```

#### 4. Leave (Usuário saiu)
```json
{
  "type": "leave",
  "payload": {
    "userId": "user-id"
  }
}
```

#### 5. Error (Erro)
```json
{
  "type": "error",
  "payload": "Mensagem de erro"
}
```

## Schema do Banco de Dados

### User
- `id`: String (UUID)
- `name`: String
- `email`: String (único) - Para autenticação
- `password`: String - Hash bcrypt da senha
- `role`: String (default: "user") - Função do usuário
- `isActive`: Boolean (default: true) - Status ativo
- `lastLogin`: DateTime? - Último login
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Room
- `id`: String (UUID)
- `name`: String (opcional)
- `createdAt`: DateTime

### Message
- `id`: String (UUID)
- `content`: String
- `createdAt`: DateTime
- `senderId`: String (FK → User)
- `roomId`: String (FK → Room)

## Funcionalidades Implementadas

- ✅ WebSocket para comunicação em tempo real
- ✅ Autenticação JWT (Access Token + Refresh Token)
- ✅ Endpoint de refresh token com token rotation
- ✅ WebSocket autenticado com validação de token
- ✅ Hash de senhas com bcrypt (10 salt rounds)
- ✅ Middleware de autenticação para rotas REST
- ✅ Proteção contra spoofing de usuário
- ✅ Persistência de mensagens no PostgreSQL
- ✅ Histórico de mensagens (últimas 50)
- ✅ Suporte a múltiplas salas de chat
- ✅ Sistema de usuários com email único
- ✅ Notificação quando usuários entram/saem
- ✅ CORS configurado para o frontend
- ✅ Validação de dados nas rotas
- ✅ Error handling global
- ✅ TypeScript com tipagem forte
- ✅ Documentação Swagger/OpenAPI completa
- ✅ Documentação detalhada do protocolo WebSocket

## Melhorias Futuras Sugeridas

- [x] Refresh token rotation (renovação automática) ✅ **IMPLEMENTADO**
- [ ] Rate limiting para WebSocket
- [ ] Indicador de "usuário digitando"
- [ ] Confirmação de entrega de mensagens
- [ ] Paginação do histórico de mensagens
- [ ] Upload de arquivos/imagens
- [ ] Mensagens privadas entre usuários
- [ ] Sistema de notificações push
- [ ] Testes unitários e de integração (Jest)
- [ ] Dockerfile para containerização do backend
- [ ] CI/CD com GitHub Actions
- [ ] Logs estruturados (Winston ou Pino)
- [ ] Monitoring e health checks
- [ ] Backup automático do banco de dados

## Desenvolvimento

Para rodar em modo de desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001` e o WebSocket em `ws://localhost:3001`.

## Produção

Build e start:

```bash
npm run build
npm start
```

## Observações Importantes

1. **Prisma 7**: Este projeto usa Prisma 7 com adapter pattern (`@prisma/adapter-pg`)
2. **Autenticação JWT**: Todas as rotas (exceto `/api/auth/*` e `/health`) requerem autenticação
3. **WebSocket Seguro**: WebSocket requer token JWT na query string para conexão
4. **Secrets JWT**: Gere secrets seguros em produção (mínimo 256 bits)
5. Certifique-se de que o PostgreSQL está rodando antes de iniciar o servidor
6. Execute `npm run prisma:generate` após qualquer alteração no schema
7. Configure corretamente as variáveis de ambiente no arquivo `.env`
8. O WebSocket usa a mesma porta do servidor HTTP (3001)
9. As mensagens são limitadas a 50 no histórico (configurável em [src/websocket.ts:201](src/websocket.ts#L201))
10. O projeto usa singleton pattern para o PrismaClient para evitar múltiplas conexões

## Docker

### Iniciar o banco de dados

```bash
docker-compose up -d
```

### Parar o banco de dados

```bash
docker-compose down
```

### Parar e remover volumes (limpa todos os dados)

```bash
docker-compose down -v
```

## Compatibilidade com Frontend

Este backend foi desenvolvido para funcionar com um frontend React. As rotas e eventos do WebSocket estão prontos para integração.

### Fluxo de Autenticação no Frontend:

```javascript
// 1. REGISTRO
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123'
  })
});

const { user, accessToken, refreshToken } = await registerResponse.json();

// Armazenar tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));

// 2. LOGIN
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@example.com',
    password: 'senha123'
  })
});

const { accessToken } = await loginResponse.json();
localStorage.setItem('accessToken', accessToken);

// 3. CONECTAR WEBSOCKET COM TOKEN
const token = localStorage.getItem('accessToken');
const ws = new WebSocket(`ws://localhost:3001?token=${token}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'authenticated') {
    console.log('✅ Autenticado:', msg.payload);

    // Agora pode entrar na sala
    ws.send(JSON.stringify({
      type: 'join',
      payload: { userId: user.id, roomId: 'room-123' }
    }));
  }

  if (msg.type === 'history') {
    console.log('📜 Histórico:', msg.payload);
  }

  if (msg.type === 'message') {
    console.log('💬 Nova mensagem:', msg.payload);
  }
};

// 4. ENVIAR MENSAGEM
ws.send(JSON.stringify({
  type: 'message',
  payload: {
    content: 'Olá!',
    roomId: 'room-123'
    // senderId não é necessário - extraído do token
  }
}));

// 5. RENOVAR ACCESS TOKEN QUANDO EXPIRAR
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch('http://localhost:3001/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (response.ok) {
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return accessToken;
  } else {
    // Refresh token expirou - redirecionar para login
    localStorage.clear();
    window.location.href = '/login';
  }
}

// 6. FAZER REQUISIÇÕES REST AUTENTICADAS
const messagesResponse = await fetch('http://localhost:3001/api/messages/room-123', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Se receber 401, tentar renovar token
if (messagesResponse.status === 401) {
  const newToken = await refreshAccessToken();
  // Repetir a requisição com novo token
  messagesResponse = await fetch('http://localhost:3001/api/messages/room-123', {
    headers: {
      'Authorization': `Bearer ${newToken}`
    }
  });
}

const messages = await messagesResponse.json();
```

## Troubleshooting

### Erro: "Can't reach database server"

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Ou se local:
brew services list | grep postgresql
```

### Erro: "PrismaClient needs to be constructed with adapter"

Execute:
```bash
npm install @prisma/adapter-pg pg @types/pg
npm run prisma:generate
```

### Erro: "Module @prisma/client has no exported member PrismaClient"

Execute:
```bash
npm run prisma:generate
```

### Porta 3001 já está em uso

Altere a porta no arquivo `.env`:
```env
PORT=3002
```

### WebSocket não conecta

1. Verifique se o servidor está rodando: `http://localhost:3001/health`
2. **Verifique se está enviando o token JWT:** `ws://localhost:3001?token=...`
3. Verifique CORS no arquivo `.env`: `FRONTEND_URL`
4. Use a mesma porta para HTTP e WebSocket

### Erro: "Token inválido" ou "Token ausente"

1. Certifique-se de que fez login e tem um `accessToken` válido
2. Verifique se o token não expirou (validade padrão: 1h)
3. Verifique se as variáveis `JWT_SECRET` estão configuradas no `.env`
4. Verifique se está enviando o token corretamente:
   - REST: `Authorization: Bearer <token>`
   - WebSocket: `ws://localhost:3001?token=<token>`

## Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL | - | ✅ |
| `PORT` | Porta do servidor | `3001` | ❌ |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:5173` | ❌ |
| `JWT_SECRET` | Secret para assinar access tokens | - | ✅ |
| `JWT_EXPIRES_IN` | Tempo de expiração do access token | `1h` | ❌ |
| `REFRESH_TOKEN_SECRET` | Secret para assinar refresh tokens | - | ✅ |
| `REFRESH_TOKEN_EXPIRES_IN` | Tempo de expiração do refresh token | `7d` | ❌ |
| `NODE_ENV` | Ambiente de execução | `development` | ❌ |

## Segurança Implementada

### Autenticação e Autorização

- **JWT (JSON Web Token)** para autenticação stateless
- **Access Token** com expiração curta (1 hora)
- **Refresh Token** com expiração longa (7 dias)
- Senhas hasheadas com **bcrypt** (10 salt rounds)
- Middleware de autenticação para proteger rotas REST
- WebSocket autenticado via token na query string

### Proteção contra Ataques

- **Anti-Spoofing**: Impossível enviar mensagens como outro usuário
  - Backend valida `userId` do payload contra `userId` do token
  - `senderId` sempre extraído do token JWT, nunca do cliente

- **CORS** configurado para aceitar apenas origem autorizada
- **Validação de dados** em todas as rotas
- **Error handling global** para evitar vazamento de informações
- Senhas **nunca** retornadas nas respostas da API

### Códigos de Erro WebSocket

| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| `4001` | Token ausente | Redirecionar para login |
| `4002` | Token inválido ou expirado | Tentar refresh token ou login |
| `1000` | Desconexão normal | Nenhuma ação necessária |

### Boas Práticas

- Secrets JWT de 256 bits (recomendado gerar novos em produção)
- Singleton pattern para PrismaClient (evita múltiplas conexões)
- TypeScript com tipagem forte em todo o projeto
- Logs estruturados de autenticação e erros
- Campos `updatedAt` e `lastLogin` para auditoria

### Próximos Passos de Segurança (Recomendado)

- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js para headers de segurança HTTP
- [ ] HTTPS em produção
- [x] Refresh token rotation ✅ **IMPLEMENTADO**
- [ ] Token blacklist com Redis
- [ ] 2FA (Two-Factor Authentication)
- [ ] Password reset via email
- [ ] Account email verification
- [ ] Logs de auditoria completos
- [ ] Monitoring e alertas de segurança

## Licença

Este projeto foi desenvolvido como parte de um teste técnico.

## Autor

Desenvolvido seguindo boas práticas de desenvolvimento com WebSocket, Prisma 7 e TypeScript.
