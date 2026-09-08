# DataMetrics

DataMetrics is a modular dashboard application designed to visualize and manage data metrics through a structured Frontend-Backend architecture. It includes REST API documentation and aims to support both development and production workflows with clarity and maintainability.

# 📁 Project Structure

```
DataMetrics/
├── ArchieDashboard/        # Main application folder
│   ├── BackEnd/            # Backend logic and API handling
│   ├── FrontEnd/           # Frontend UI components and logic
│   ├── package.json        # Project dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── TODO.md             # Pending tasks and notes
│   └── README.md           # Project overview
├── db/                     # SQL helpers, seed, backup and anonymize scripts
├── Documentation/
│   └── ArchieDashboardAPI.json  # API documentation
├── Images/                 # Visual assets and resources
```

# 🗄️ Database scripts

From `DataMetrics/`:

- `npm run db:backup` — write `db/CloudMetrics.bak` (current database, restore-capable)
- `npm run db:anonymize` — replace company names with `Company 0001`, `Company 0002`, …
- `npm run db:restore` — restore `db/CloudMetrics.bak` over the current database

# 📌 Features

Modular architecture with clear separation of concerns.

Frontend and Backend isolation for scalable development.

API documentation provided via JSON spec.

Written in TypeScript for strong typing and scalability.

# 🚀 Getting Started

Clone the repository:

```
git clone https://github.com/Ashlayyy/DataMetrics.git
```

Navigate into the project:

```
cd DataMetrics/ArchieDashboard
```

Install dependencies:

```
npm install
```

Start the development server (commands may vary by setup):

```
npm run dev
```

# 📝 TODO

See the TODO.md file for upcoming features, bugs, and plans.

# 📄 License

This project is licensed under MIT license.
