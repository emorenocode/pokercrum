# Pokercrum

A modern, real-time poker gaming platform built with Angular and Firebase. Play poker in virtual rooms with real-time synchronization and interactive gameplay features.

## Features

- **Real-time Multiplayer Rooms**: Create and join poker rooms with real-time player synchronization
- **Interactive Card Display**: Visual representation of cards and player hands
- **Player Management**: Track player information, chips, and game status
- **Game Timer**: Built-in countdown timer for betting rounds and game phases
- **Responsive Design**: Mobile-friendly UI built with Angular Material
- **Room Settings**: Customizable room configurations for game rules and constraints
- **Player Overlay**: Interactive overlay for additional player information and controls

## Tech Stack

- **Frontend Framework**: [Angular 22.1.4](https://angular.dev/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) with [@angular/fire](https://github.com/angular/angularfire)
- **UI Components**: [Angular Material 22.1.4](https://material.angular.io/)
- **Language**: TypeScript 6.0.3
- **Package Manager**: pnpm
- **Testing**: Karma with TypeScript support
- **Build Tool**: Angular Build

## Project Structure

```
src/
├── app/
│   ├── core/                # Core services and models
│   │   ├── models/          # Data models (Card, Player, Room, Result)
│   │   └── services/        # Singleton services (PlayerStore, RoomService)
│   ├── pages/               # Page components
│   │   ├── home/            # Home page
│   │   └── room/            # Poker room page
│   └── shared/              # Shared components
│       └── components/      # Reusable UI components
│           ├── card/        # Card display component
│           ├── countdown/   # Countdown timer component
│           ├── header/      # Page header
│           ├── player/      # Player display component
│           ├── room-settings/ # Room configuration component
│           ├── timer-field/ # Timer input component
│           └── user-info/   # User information component
├── environments/            # Environment configuration
└── styles.css               # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pokercrum
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure the environment (see [Configuration](#configuration) section)

### Development

Start the development server:

```bash
pnpm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Build

Compile the project for production:

```bash
pnpm build
```

Build artifacts will be stored in the `dist/` directory.

### Testing

Run unit tests:

```bash
pnpm test
```

Tests are run using Karma and can be watched for development.

## Project Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `pnpm start`     | Start development server          |
| `pnpm build`     | Build for production              |
| `pnpm watch`     | Watch mode for development builds |
| `pnpm test`      | Run unit tests                    |
| `pnpm build:env` | Generate environment variables    |

## Architecture

### Core Models

- **Card**: Represents a playing card (suit and rank)
- **Player**: Player information including name, status, and chip count
- **Room**: Poker room configuration and state
- **Result**: Game result tracking

### Services

- **PlayerStore**: Centralized player state management
- **RoomService**: Room creation, joining, and game logic
- **OverlayContent**: Manages overlay UI state
- **DetectDevice**: Device detection for responsive UI

## Configuration

### Environment Variables

To configure the environment, you need to:

1. Create a `.env` file in the project root with your environment variables see the `.env.template`:

```bash
# Example .env file
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
# ... other variables
```

2. Run the environment build script to generate the TypeScript environment files:

```bash
pnpm build:env
```

This command processes the `.env` file and generates the appropriate configuration in:

- `src/environments/environment.ts` - Development configuration

**Note**: You must run `pnpm build:env` after updating `.env` for changes to take effect.

### Firebase security rules

The project includes a starter Firestore rule set at [`firestore.rules`](./firestore.rules). This is a baseline for protecting room ownership and player updates in production. To deploy it:

```bash
firebase deploy --only firestore:rules
```

The current Angular app still relies on local room state and a custom player model, so the rules are meant to be paired with Firebase Auth or an equivalent server-side identity layer before being used in production.

## Code Style

The project uses Prettier for code formatting with the following configuration:

- Print Width: 100 characters
- Single Quotes: enabled
- Angular parser for HTML templates
