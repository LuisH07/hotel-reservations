
<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" width="90" alt="Java Logo" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" width="90" alt="Spring Boot Logo" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="90" alt="React Logo" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="90" alt="PostgreSQL Logo" />
</p>

<h1 align="center">Hotel Reservations</h1>

<p align="center">
  Projeto acadêmico de banco de dados para sistema de reservas de quartos de hotel
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21+-ED8B00?style=for-the-badge&logo=java&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

---

## Descrição

---

O Hotel Reservations Database é um projeto acadêmico desenvolvido para a disciplina de Banco de Dados, cujo objetivo é a modelagem, implementação e validação de um banco de dados relacional para um sistema de gerenciamento de reservas de hotel.

A plataforma foi projetada para permitir o cadastro e a administração de hotéis, incluindo informações estruturais como categorias de quartos, comodidades disponíveis, capacidade de hospedagem e organização dos quartos por hotel. Cada quarto está associado a uma categoria específica, permitindo a definição de características como capacidade máxima de hóspedes e valor da diária.

No contexto das operações do hotel, o banco de dados dá suporte ao controle de reservas, registrando períodos de check-in e check-out, status da reserva e associação com clientes e quartos. A partir de uma reserva, o sistema permite o acompanhamento da hospedagem, representando a execução real da estadia, com controle de entrada, saída e situação do hóspede.

Além disso, o modelo contempla o registro de pagamentos, permitindo associar transações tanto a reservas quanto a hospedagens, com controle de valores, métodos de pagamento e status, garantindo rastreabilidade financeira e histórico das operações realizadas.

O projeto também prevê suporte a serviços adicionais oferecidos pelo hotel, possibilitando sua associação às reservas e mantendo o valor praticado no momento da contratação, preservando a consistência histórica dos dados.

---

## Modelagem do Banco de Dados

Abaixo estão representados os modelos desenvolvidos para a estruturação do sistema.

### Diagrama conceitual
![Diagrama conceitual](docs/database/diagrama-conceitual.png)

### Diagrama lógico

![Diagrama lógico](docs/database/diagrama-logico.png)

---

## Dicionário de Dados

A documentação completa dos metadados, incluindo descrição das tabelas, colunas, tipos de dados e restrições, pode ser consultada no arquivo abaixo:

[Visualizar Dicionário de Dados (PDF)](./docs/database/dicionario-de-dados.pdf)

---

## Estado atual do projeto

Atualmente, o projeto encontra-se na fase de **implementação e validação do banco de dados**, contendo:

- Esquema lógico relacional implementado em SQL;
- Banco de dados normalizado (Segunda Forma Normal);
- Migrations SQL versionadas utilizando Flyway;
- Infraestrutura containerizada com Docker e Docker Compose;
- Backend em Java com Spring Boot utilizado para validação do schema via Hibernate;
- Organização do repositório, fluxo de contribuição e padrões de versionamento;
- Utilização de quadro Scrum para organização e acompanhamento das atividades da equipe.


### Correções e Melhorias da Entrega Anterior

Com base nos feedbacks recebidos na última avaliação, todas as pendências apontadas foram resolvidas e integradas com sucesso nesta versão final:

* **Implementação Completa dos CRUDs (Backend e Frontend):** *Feedback anterior:* Apenas a entidade "Reserva" possuía o CRUD completo e "Quarto" possuía apenas rotas de leitura.
  * *Correção:* Foram desenvolvidos e integrados todos os endpoints e telas faltantes. Agora, **todas as entidades principais** (Quartos, Categorias, Comodidades, Serviços Adicionais, Clientes e Funcionários) possuem fluxos completos de Criação, Leitura, Atualização e Exclusão (CRUD) operantes em ambas as camadas da aplicação.

* **Gestão de Reservas pelo Administrador (Frontend):** * *Feedback anterior:* O usuário administrador conseguia criar e visualizar reservas, mas a interface não permitia atualizar ou deletar.
  * *Correção:* A limitação no frontend foi removida. O fluxo de gestão para o perfil `Funcionário / Gerente` está totalmente funcional, permitindo a edição e exclusão de qualquer reserva diretamente pela interface web.

* **Visualização e Gestão de Reservas pelo Cliente (Frontend/Backend):**
  * *Feedback anterior:* Erro de servidor (Status 500 - `NoResourceFoundException`) ao acessar a rota `/reservations`, além da falta das opções de editar e deletar para o cliente.
  * *Correção:* O erro de roteamento e comunicação com a API foi completamente solucionado. O cliente agora consegue acessar a listagem de suas próprias reservas sem falhas. Além disso, foram implementadas no frontend as ações para que o cliente possa **atualizar** e **cancelar** suas reservas ativas de forma autônoma.

---

## Tecnologias Utilizadas

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* PostgreSQL

### Ferramentas e práticas

* Git
* GitHub
* Docker
* Conventional Commits
* Pull Requests com revisão obrigatória

---

## Instalação e Execução

### Configuração de ambiente (.env)

Este projeto **não versiona arquivos `.env`**.  
Você **deve criar dois arquivos `.env` próprios**:

- Um na **raiz do projeto (backend)**
- Um dentro da pasta **frontend/**

Sem esses arquivos corretamente configurados, a aplicação não funcionará como esperado.

---

## 1️⃣ Backend (.env na raiz)

Use o arquivo `.env.example` como base:

```env
# Senha do usuário do banco de dados PostgreSQL
HOTEL_RESERVATIONS_DB_PASSWORD=mude_a_senha_aqui

# Profile ativo do Spring Boot
SPRING_PROFILES_ACTIVE=dev

# Origens permitidas para CORS (opcional)
# Se não definir, o backend usa o valor padrão do application.yml
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Versão da aplicação (opcional)
APP_VERSION=dev

# Configurações para JWT
JWT_SECRET=rjfoBSJbdo2DWCXzgWw42ug9VndCxurWHfAh71kq36o=
JWT_EXPIRATION_MS=86400000

# Configuração de Timezone
APP_TIMEZONE=America/Recife
```

Crie o seu `.env` copiando o exemplo:

```bash
cp .env.example .env
```

Depois, ajuste os valores conforme necessário (principalmente senha do banco).

---

## 2️⃣ Frontend (frontend/.env)

Dentro da pasta:

```
frontend/
```

Crie o arquivo:

```
.env
```

Com o seguinte conteúdo:

```env
# URL da API do Backend
VITE_API_URL=http://localhost:8080

# Define se a aplicação deve usar dados falsos (Mock) ou backend real
# true  = Usa dados locais
# false = Conecta na API real
VITE_USE_MOCK=false
```

---

### Perfis de execução do projeto

O projeto possui duas formas principais de execução, controladas via **`SPRING_PROFILES_ACTIVE`** no **`.env`**

#### Execução com Docker (com seed)

- **`SPRING_PROFILES_ACTIVE=dev`**
- Banco e backend sobem via Docker Compose
- Seeder é executado automaticamente
- Migrations padrão + migrations de desenvolvimento

Esse profile é indicado para desenvolvimento inicial e testes rápidos.

---

#### Execução com Docker (sem seed)

- **`SPRING_PROFILES_ACTIVE=prod`**
- Banco e backend sobem via Docker Compose
- Seeder não é executado
- Apenas migrations oficiais

Esse profile simula o comportamento de produção.

---

### Subindo a aplicação com Docker Compose

Para remover os volumes e reiniciar o banco do zero:

```bash
docker compose down -v
```

Na raiz do projeto, execute:

```bash
docker compose up --build -d
````

O comando irá subir o banco de dados PostgreSQL e o backend, além de executar automaticamente as migrations via Flyway.

### Verificando containers em execução

```bash
docker ps
```

### Acessando o banco de dados

```bash
docker exec -it hotel-reservations-db-1 psql -U hotel_reservations_dev_app -d hotel_reservations_dev
```

### Parando a aplicação

```bash
docker compose down
```

### Serviços disponíveis

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:8080](http://localhost:8080)
* Banco de Dados: localhost:5433

---

## População de Dados (Data Seeding)

A base de dados inicial do sistema foi populada com o auxílio de Inteligência Artificial para criar um conjunto de dados fictícios (*mock data*) realista e coerente. O processo foi estruturado nas seguintes etapas:

1. **Mapeamento:** A estrutura das tabelas do banco (como Clientes, Hotéis, Quartos e Reservas) foi utilizada como contexto.
2. **Geração:** A IA elaborou scripts SQL de `INSERT` com registros diversificados, respeitando os relacionamentos e restrições estruturais do banco (chaves estrangeiras, formatos de data, etc.).
3. **Execução:** Os scripts foram executados diretamente no banco de dados, garantindo volume de informações suficiente para testes de API e validação das regras de negócio.
 
---

## Instruções de Uso

### Credenciais Padrão (Seed)

O sistema já possui usuários cadastrados para testes:

#### Gerente
- **Email:** gerente@local.dev
- **Senha:** password1

#### Funcionário (Atendente)
- **Email:** atendente@local.dev
- **Senha:** password2

#### Cliente
- **Email:** user1@local.dev  
- **Senha:** password1  

---

## Funcionalidades Disponíveis

O sistema contempla um fluxo completo de ponta a ponta para a gestão hoteleira, dividido nos seguintes módulos:

**Autenticação e Gestão de Usuários**
* **Autenticação:** Login via email e senha com segurança baseada em token JWT.
* **Clientes:** Criação de conta (cadastro), visualização de perfil e edição de dados.
* **Funcionários:** Visualização de listagem e edição de dados cadastrais.

**Gestão de Estrutura e Serviços**
* **Quartos:** Gerenciamento completo (criar, buscar, visualizar por ID, editar e deletar).
* **Categorias:** Gerenciamento completo (adicionar, editar, deletar e buscar).
* **Comodidades:** Gerenciamento completo (adicionar, editar, deletar e buscar).
* **Serviços Adicionais:** Gerenciamento completo (adicionar, editar, deletar e visualizar).

**Gestão de Reservas**
* **Portal do Cliente:** Busca de quartos disponíveis por período, criação de novas reservas, visualização do histórico pessoal e edição (cancelamento de reservas ativas).
* **Portal do Atendente:** Visualização de todas as reservas do hotel e atualização de status (registro de check-in e check-out).
* **Portal do Gerente:** Acesso total à visualização, detalhamento e edição de qualquer reserva do sistema.

**Hospedagem e Financeiro**
* **Hospedagem (Balcão):** Registro de estadia realizado pelo funcionário, com suporte tanto para clientes com reserva prévia quanto para novos clientes (sem reserva).
* **Pagamentos:** Geração e registro de pagamento automático vinculado à hospedagem ou reserva.

**Relatório Administrativo**

O sistema conta com um módulo dedicado à emissão de relatórios gerenciais, focado em entregar métricas e dados administrativos de forma clara para os usuários com perfil de `Gerente`.

* **O que ele faz:** Consolida informações cruciais das operações do hotel, cruzando dados de clientes, ocupação de quartos, status de reservas e movimentações financeiras em uma única interface.
* **Como funciona:** O relatório é alimentado diretamente por uma **View dedicada**. Em vez de o backend fazer dezenas de consultas separadas e processar os dados na memória (o que geraria lentidão), a *View* já executa todas as junções (`JOINs`) e agregações matemáticas necessárias nativamente no banco de dados. A API apenas consome esse resultado otimizado, garantindo alta performance na geração das estatísticas.

---

### Observação sobre o uso de Views

As funcionalidades de **Reservas Detalhadas**, **Quartos Disponíveis** e **Relatório** utilizam *views* no banco de dados.

A principal vantagem é que, em vez de a aplicação precisar buscar vários IDs e depois realizar múltiplas consultas adicionais para montar a resposta, as junções entre tabelas já são feitas diretamente no banco.

Exemplo da view de reservas, que junta as tabelas de cliente e quarto para informar dados dessas tabelas sem consultas adicionais.

---

### Implementação de Trigger

O projeto utiliza gatilhos diretamente no Banco de Dados para garantir que regras críticas de negócio sejam respeitadas, independente da camada de aplicação.

### 1. Bloqueio de Exclusão de Quarto com Reservas Ativas

* **Regra de Negócio:** Impede a remoção de um quarto caso ele esteja vinculado a qualquer reserva com o status `CONFIRMADA`. Isso evita que quartos com compromissos futuros sejam deletados por erro humano, mantendo a consistência da agenda.
* **Funcionamento:** O gatilho `trg_bloqueio_exclusao_quarto` é disparado antes de deletar um registro na tabela `quarto`.
    - Ele aciona uma função que verifica diretamente na tabela `reserva` se existe algum registro ativo (`status_reserva = 'CONFIRMADA'`) associado ao ID do quarto que está sendo excluído.
    - Se houver vínculo, o banco aborta a operação e envia uma mensagem personalizada de bloqueio.

### Como testar o Trigger

Teste via Frontend / Interface**
1. Acesse o painel de **Gerenciamento de Quartos**.
2. Tente excluir um quarto que já possua uma reserva confirmada.
3. **Resultado esperado:** O sistema bloqueará a exclusão e exibirá um alerta (Toast) com a mensagem:
   > *"Não é possível excluir este quarto. Ele possui reservas ou hospedagens vinculadas a ele no sistema."*
---

## Guia de Contribuição

O projeto segue um fluxo de contribuição organizado, utilizando boas práticas de versionamento, colaboração em equipe e gerenciamento de tarefas.

### Organização da equipe e tarefas

A equipe utiliza o **GitHub Projects (Quadro Scrum)** como ferramenta de organização e acompanhamento do desenvolvimento do projeto. O fluxo adotado é o seguinte:

- As funcionalidades, correções e melhorias são registradas como **Issues** no repositório;
- Cada issue é adicionada ao **Quadro Scrum** e atribuída a um integrante da equipe;
- O progresso das tarefas é acompanhado por meio das colunas do quadro (por exemplo: *To Do*, *In Progress* e *Done*);
- As issues são resolvidas por meio de **commits** e **Pull Requests**, mantendo a rastreabilidade entre planejamento e código;
- Commits e Pull Requests podem:
    - referenciar a issue relacionada (`Related to #id`), ou
    - encerrar automaticamente a issue ao final do desenvolvimento (`Closes #id`).

### Fluxo de versionamento

- Cada integrante trabalha em um **fork** do repositório principal;
- A branch `main` é **protegida**, não permitindo commits diretos;
- Todas as alterações são realizadas por meio de **Pull Requests**;
- Cada Pull Request exige:
    - uso do padrão **Conventional Commits**;
    - no mínimo **2 revisores**;
    - resolução de todos os comentários antes do merge.

### Padrão de commit

```

feat(escopo): descrição curta

```

Exemplo:

```

feat(backend): initialize Spring Boot application structure

- Criada a estrutura inicial do backend em Java com Spring Boot
- Configurada a base do projeto para integração com PostgreSQL
- Ajustadas configurações iniciais do workspace e ambiente de execução

Related to #10

```

---

## Contribuidores

* **[Alcielma Luzinete da Silva](https://github.com/Alcielma)**
* **[Hugo Matheus Costa Araújo](https://github.com/hugomtths)**
* **[Luís Henrique Domingos da Silva](https://github.com/LuisH07)**
* **[Maria Luiza Bezerra dos Santos](https://github.com/marialuizab11)**

---

## Licença

Este projeto está licenciado sob a **Licença MIT**.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
