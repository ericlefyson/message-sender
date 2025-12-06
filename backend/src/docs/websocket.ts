/**
 * @swagger
 * tags:
 *   - name: WebSocket
 *     description: |
 *       # Documentação do WebSocket
 *
 *       A API de chat em tempo real usa WebSocket para comunicação bidirecional entre cliente e servidor.
 *
 *       ## Conexão
 *
 *       **URL de Conexão:** `ws://localhost:3001?token=<ACCESS_TOKEN>`
 *
 *       O cliente deve incluir o token JWT de autenticação como parâmetro na query string ao estabelecer a conexão.
 *
 *       ### Exemplo de Conexão (JavaScript):
 *       ```javascript
 *       const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
 *       const ws = new WebSocket(`ws://localhost:3001?token=${token}`);
 *
 *       ws.onopen = () => {
 *         console.log('Conectado ao WebSocket');
 *       };
 *
 *       ws.onmessage = (event) => {
 *         const message = JSON.parse(event.data);
 *         console.log('Mensagem recebida:', message);
 *       };
 *
 *       ws.onerror = (error) => {
 *         console.error('Erro no WebSocket:', error);
 *       };
 *
 *       ws.onclose = () => {
 *         console.log('Conexão fechada');
 *       };
 *       ```
 *
 *       ## Autenticação
 *
 *       Após conectar, o servidor enviará uma mensagem de confirmação de autenticação:
 *
 *       ```json
 *       {
 *         "type": "authenticated",
 *         "payload": {
 *           "userId": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047",
 *           "email": "joao@example.com"
 *         }
 *       }
 *       ```
 *
 *       ## Tipos de Mensagens
 *
 *       Todas as mensagens seguem o formato:
 *       ```json
 *       {
 *         "type": "string",
 *         "payload": {}
 *       }
 *       ```
 *
 *       ### 1. Entrar em uma Sala (join)
 *
 *       **Cliente → Servidor:**
 *       ```json
 *       {
 *         "type": "join",
 *         "payload": {
 *           "userId": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047",
 *           "roomId": "room-123"
 *         }
 *       }
 *       ```
 *
 *       **Servidor → Cliente (histórico de mensagens):**
 *       ```json
 *       {
 *         "type": "history",
 *         "payload": [
 *           {
 *             "id": "msg-001",
 *             "content": "Olá!",
 *             "senderId": "user-001",
 *             "roomId": "room-123",
 *             "createdAt": "2024-01-01T10:00:00.000Z",
 *             "sender": {
 *               "id": "user-001",
 *               "name": "Maria",
 *               "createdAt": "2024-01-01T09:00:00.000Z"
 *             }
 *           }
 *         ]
 *       }
 *       ```
 *
 *       **Servidor → Outros Clientes (notificação de entrada):**
 *       ```json
 *       {
 *         "type": "join",
 *         "payload": {
 *           "userId": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047",
 *           "name": "João Silva"
 *         }
 *       }
 *       ```
 *
 *       ### 2. Enviar Mensagem (message)
 *
 *       **Cliente → Servidor:**
 *       ```json
 *       {
 *         "type": "message",
 *         "payload": {
 *           "content": "Olá, tudo bem?",
 *           "roomId": "room-123"
 *         }
 *       }
 *       ```
 *
 *       **Observação:** O campo `senderId` é ignorado no payload. O servidor usa o ID do usuário autenticado.
 *
 *       **Servidor → Todos na Sala:**
 *       ```json
 *       {
 *         "type": "message",
 *         "payload": {
 *           "id": "msg-002",
 *           "content": "Olá, tudo bem?",
 *           "senderId": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047",
 *           "roomId": "room-123",
 *           "createdAt": "2024-01-01T10:05:00.000Z",
 *           "sender": {
 *             "id": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047",
 *             "name": "João Silva",
 *             "createdAt": "2024-01-01T09:30:00.000Z"
 *           }
 *         }
 *       }
 *       ```
 *
 *       ### 3. Sair da Sala (leave)
 *
 *       Enviado automaticamente quando o cliente desconecta.
 *
 *       **Servidor → Outros Clientes:**
 *       ```json
 *       {
 *         "type": "leave",
 *         "payload": {
 *           "userId": "59bd6eb1-a0bd-42e8-98d9-5f329fae4047"
 *         }
 *       }
 *       ```
 *
 *       ### 4. Mensagens de Erro (error)
 *
 *       **Servidor → Cliente:**
 *       ```json
 *       {
 *         "type": "error",
 *         "payload": "Token de autenticação é obrigatório"
 *       }
 *       ```
 *
 *       **Possíveis erros:**
 *       - `"Token de autenticação é obrigatório"` - Token não fornecido na conexão
 *       - `"Token inválido ou expirado"` - Token JWT inválido
 *       - `"Você não pode entrar como outro usuário"` - userId do payload não corresponde ao usuário autenticado
 *       - `"Usuário não encontrado"` - Usuário não existe no banco de dados
 *       - `"content e roomId são obrigatórios"` - Campos obrigatórios faltando na mensagem
 *       - `"Tipo de mensagem desconhecido"` - Tipo de mensagem não reconhecido
 *       - `"Erro ao processar mensagem"` - Erro genérico ao processar mensagem
 *
 *       ## Códigos de Fechamento
 *
 *       - **4001** - Token ausente
 *       - **4002** - Token inválido
 *
 *       ## Fluxo Completo de Uso
 *
 *       1. **Autenticar via REST API** (`POST /api/auth/login`) para obter o accessToken
 *       2. **Conectar ao WebSocket** com o token na query string
 *       3. **Aguardar mensagem** de tipo `authenticated`
 *       4. **Entrar em uma sala** enviando mensagem de tipo `join`
 *       5. **Receber histórico** de mensagens (tipo `history`)
 *       6. **Enviar/receber mensagens** em tempo real (tipo `message`)
 *       7. **Receber notificações** de outros usuários entrando/saindo (tipos `join`/`leave`)
 *
 *       ## Segurança
 *
 *       - Autenticação JWT obrigatória no handshake
 *       - O servidor valida que o `userId` no payload corresponde ao usuário autenticado
 *       - O `senderId` nas mensagens é sempre extraído do token, não do payload do cliente
 *       - Mensagens são broadcast apenas para clientes na mesma sala
 *
 *       ## Exemplo Completo de Cliente
 *
 *       ```javascript
 *       class ChatClient {
 *         constructor(token) {
 *           this.token = token;
 *           this.ws = null;
 *         }
 *
 *         connect() {
 *           this.ws = new WebSocket(`ws://localhost:3001?token=${this.token}`);
 *
 *           this.ws.onopen = () => console.log('Conectado');
 *           this.ws.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
 *           this.ws.onerror = (error) => console.error('Erro:', error);
 *           this.ws.onclose = () => console.log('Desconectado');
 *         }
 *
 *         handleMessage(message) {
 *           switch (message.type) {
 *             case 'authenticated':
 *               console.log('Autenticado:', message.payload);
 *               break;
 *             case 'history':
 *               console.log('Histórico recebido:', message.payload);
 *               break;
 *             case 'message':
 *               console.log('Nova mensagem:', message.payload);
 *               break;
 *             case 'join':
 *               console.log('Usuário entrou:', message.payload);
 *               break;
 *             case 'leave':
 *               console.log('Usuário saiu:', message.payload);
 *               break;
 *             case 'error':
 *               console.error('Erro:', message.payload);
 *               break;
 *           }
 *         }
 *
 *         joinRoom(userId, roomId) {
 *           this.send({
 *             type: 'join',
 *             payload: { userId, roomId }
 *           });
 *         }
 *
 *         sendMessage(content, roomId) {
 *           this.send({
 *             type: 'message',
 *             payload: { content, roomId }
 *           });
 *         }
 *
 *         send(data) {
 *           if (this.ws.readyState === WebSocket.OPEN) {
 *             this.ws.send(JSON.stringify(data));
 *           }
 *         }
 *
 *         disconnect() {
 *           if (this.ws) {
 *             this.ws.close();
 *           }
 *         }
 *       }
 *
 *       // Uso
 *       const client = new ChatClient('seu-access-token');
 *       client.connect();
 *
 *       // Após conectar e receber 'authenticated'
 *       client.joinRoom('user-id', 'room-123');
 *       client.sendMessage('Olá!', 'room-123');
 *       ```
 */

export {};
