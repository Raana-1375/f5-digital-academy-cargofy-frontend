# Cargofy — Frontend

> 🚧 **Work in progress** — this project is under active development as the final capstone project of the Factoría F5 Full Stack Development Bootcamp.

Cargofy is a web application for tracking international shipments. Clients can follow the status of their shipments in real time, while operators and administrators manage shipments and update their status throughout the delivery process.

## Tech Stack

- [Vue 3](https://vuejs.org/) — frontend framework
- [Vite](https://vite.dev/) — build tool and dev server
- [Vue Router](https://router.vuejs.org/) — client-side routing
- [Pinia](https://pinia.vuejs.org/) — state management
- [Vitest](https://vitest.dev/) — component testing
- ESLint + Prettier — code quality and formatting

## User Roles

| Role         | Permissions                                 |
| ------------ | ------------------------------------------- |
| **Client**   | View own shipments and their status history |
| **Operator** | Create shipments and update their status    |
| **Admin**    | Full access to shipments and users          |

## Planned Pages

- Sign In
- Create Account
- Dashboard
- Shipments List
- Shipment Detail
- New Shipment
- Account & Settings

## Getting Started

### Prerequisites

- Node.js 20 or higher
- The [Cargofy backend](https://github.com/Raana-1375/f5-digital-academy-cargofy-backend) running on `http://localhost:8080`

### Installation

```bash
git clone https://github.com/Raana-1375/f5-digital-academy-cargofy-frontend.git
cd f5-digital-academy-cargofy-frontend
npm install
```

### Available Scripts

| Command             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Start the development server at `http://localhost:5173` |
| `npm run build`     | Build for production                                    |
| `npm run test:unit` | Run component tests with Vitest                         |
| `npm run lint`      | Lint the code                                           |
| `npm run format`    | Format the code with Prettier                           |

## Related Repository

- **Backend:** [f5-digital-academy-cargofy-backend](https://github.com/Raana-1375/f5-digital-academy-cargofy-backend) — Java, Spring Boot, Spring Security, MySQL (Docker)

## Author

**Rana** — [@Raana-1375](https://github.com/Raana-1375)
