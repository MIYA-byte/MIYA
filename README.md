# MIYA: The First Cross-Chain Mixer Protocol Built on Solana

![MIYA Protocol](docs/assets/miya-logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Compatible-blue.svg)](https://solana.com/)
[![GitHub Issues](https://img.shields.io/github/issues/MIYA-byte/MIYA.svg)](https://github.com/MIYA-byte/MIYA/issues)
[![GitHub Stars](https://img.shields.io/github/stars/MIYA-byte/MIYA.svg)](https://github.com/MIYA-byte/MIYA/stargazers)

## 🔒 Privacy-First Cross-Chain Transfers

MIYA is a revolutionary cross-chain mixing protocol built on the Solana blockchain, designed to provide seamless and private cross-chain asset transfers. By leveraging cutting-edge zero-knowledge proof technology, MIYA ensures complete privacy while maintaining high efficiency and low transaction costs.

## 🔑 Key Features

- **Private Asset Pools**: Deposit assets and withdraw the equivalent amount at any time, with no traceable connection between deposit and withdrawal.
- **Cross-Chain Bridge**: Transfer assets securely and privately across chains with a single click, maintaining complete anonymity.
- **Zero-Knowledge Proof Technology**: Advanced cryptographic proofs that ensure privacy without compromising security.
- **User-Friendly Interface**: Intuitive and easy-to-use design, lowering technical barriers for average users to access privacy features.
- **Developer SDK**: Open API interfaces for building privacy-preserving decentralized applications.

## 🏗️ Project Architecture

MIYA follows a modular architecture designed for scalability, maintainability, and extensibility. The project is structured into four main components:

```
MIYA/
├── frontend/           # React frontend application
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # UI components
│       ├── contexts/   # Context API providers
│       ├── hooks/      # Custom React hooks
│       ├── layouts/    # Page layouts
│       ├── pages/      # Page components
│       ├── services/   # API services
│       ├── styles/     # Global styles and themes
│       ├── types/      # TypeScript type definitions
│       └── utils/      # Utility functions
├── solana/             # Solana smart contracts
│   ├── programs/       # Anchor programs
│   └── tests/          # Contract tests
├── sdk/                # JavaScript SDK for integration
│   └── src/            # SDK source code
└── docs/               # Documentation
```

### System Architecture

The MIYA protocol is built on a multi-layered architecture:

```
+---------------------+      +----------------------+
|                     |      |                      |
|  User Interface     |      |  Developer API/SDK   |
|  (React + TypeScript)|      |  (TypeScript)       |
+----------+----------+      +-----------+----------+
           |                             |
           v                             v
+---------------------+      +----------------------+
|                     |      |                      |
|  Application Layer  +<---->+  Cross-Chain Bridge  |
|  (Context API)      |      |  (Solana Program)    |
+----------+----------+      +-----------+----------+
           |                             |
           v                             v
+---------------------------------------------+
|                                             |
|              Core Protocol Layer            |
|  +----------------+    +----------------+   |
|  | ZK Proof Engine |    | Liquidity Pool |   |
|  | (Solana Program) |    | (Solana Program) |   |
|  +----------------+    +----------------+   |
|                                             |
+---------------------+---------------------+-+
                      |
                      v
+---------------------+---------------------+
|                                           |
|              Blockchain Network Layer     |
|  +---------------+    +---------------+   |
|  |    Solana     |    |  ETH/BSC/etc  |   |
|  +---------------+    +---------------+   |
|                                           |
+-------------------------------------------+
```

## 🧩 Technical Implementation

### Frontend Architecture

The frontend is built with React and TypeScript, using a modular component-based architecture. We've implemented several design patterns to ensure code quality and maintainability:

#### ⚛️ Context API for State Management

```
+-------------------+
|                   |
|  App Component    |
|                   |
+--------+----------+
         |
         v
+--------+----------+    +------------------+
|                   |    |                  |
|  ThemeProvider    +--->+  Theme Context   |
|                   |    |                  |
+--------+----------+    +------------------+
         |
         v
+--------+----------+    +------------------+
|                   |    |                  |
|  ModalProvider    +--->+  Modal Context   |
|                   |    |                  |
+--------+----------+    +------------------+
         |
         v
+--------+----------+    +------------------+
|                   |    |                  |
| NotificationProvider+->+ Notification Context
|                   |    |                  |
+--------+----------+    +------------------+
         |
         v
+--------+----------+
|                   |
|  Wallet Providers |
|                   |
+--------+----------+
         |
         v
+--------+----------+
|                   |
|  Router & Content |
|                   |
+-------------------+
```

The application uses React Context API to manage global state:

- **ThemeContext**: Manages theme settings (light/dark mode)
- **ModalContext**: Handles global modal dialogs
- **NotificationContext**: Manages toast notifications
- **WalletContext**: Handles wallet connections (via Solana wallet adapter)

#### 🔄 Custom Hooks

We've implemented several custom hooks to enhance functionality and reusability:

- **useLocalStorage**: Persists state to localStorage with React state integration
- **useMediaQuery**: Responsive design with media query detection
- **useTheme**: Access and modify theme settings
- **useModal**: Control modal dialogs
- **useNotification**: Display toast notifications

#### 🎨 Styled Components with Theme System

The UI implements a comprehensive theming system with:

- Light and dark mode support
- System preference detection
- Consistent spacing and typography
- CSS variables for global styling

```javascript
// Theme object structure
const theme = {
  mode: 'dark' | 'light',
  colors: {
    primary: string,
    secondary: string,
    background: {
      main: string,
      card: string,
      input: string
    },
    text: {
      primary: string,
      secondary: string,
      muted: string,
      accent: string
    },
    // Other colors...
  },
  spacing: { xs, sm, md, lg, xl, xxl },
  fontSizes: { xs, sm, md, lg, xl, xxl },
  borderRadius: { sm, md, lg, pill, circle },
  shadows: { sm, md, lg },
  zIndex: { modal, dropdown, tooltip, header },
  transitions: { default, fast, slow }
}
```

#### 📱 Responsive Design

The application is fully responsive, using:

- Media queries
- Custom responsive hooks
- Flexible layouts
- Mobile-first approach

### 🔄 Data Flow

The application follows a unidirectional data flow pattern:

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  User Action   +---->+  Context API   +---->+  UI Update    |
|                |     |                |     |                |
+----------------+     +-------+--------+     +----------------+
                              |
                              v
                      +-------+--------+
                      |                |
                      |  API Service   |
                      |                |
                      +-------+--------+
                              |
                              v
                      +-------+--------+
                      |                |
                      |  Blockchain    |
                      |                |
                      +----------------+
```

1. **User Interaction**: User interacts with the UI
2. **Context Updates**: Relevant Context API updates state
3. **Service Calls**: API services make calls to backend/blockchain
4. **State Updates**: Context state is updated based on results
5. **UI Rendering**: Components re-render based on context changes

### 🔌 API Integration

The application communicates with the blockchain through a service layer:

```typescript
// Example API service
const API_ENDPOINTS = {
  // Mixer endpoints
  POOLS: '/mixer/pools',
  DEPOSIT: '/mixer/deposit',
  WITHDRAW: '/mixer/withdraw',
  
  // Bridge endpoints
  CHAINS: '/bridge/chains',
  TOKEN_PAIRS: '/bridge/token-pairs',
  // ...other endpoints
};

// API request with error handling
export const apiRequest = async<T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  try {
    // Make request with proper error handling
    // ...
  } catch (error) {
    // Standardized error handling
    // ...
  }
};
```

### 🛡️ Error Handling

The application implements comprehensive error handling with:

- Standardized error codes
- User-friendly error messages
- Consistent error UI
- Recovery mechanisms

### 🧪 Form Validation

Form validation is implemented using a custom validation system:

```typescript
// Example validation rules
const validationRules = {
  required: (value: any) => !!value || 'This field is required',
  minLength: (min: number) => (value: string) => 
    !value || value.length >= min || `Must be at least ${min} characters`,
  // ...other validation rules
};

// Usage in form
const errors = {
  name: validationRules.required(formData.name),
  amount: validationRules.positiveNumber(formData.amount),
};
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for Solana program development)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Phantom Wallet](https://phantom.app/) or another Solana wallet

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/MIYA-byte/MIYA.git
   cd MIYA
   ```

2. Install dependencies
   ```bash
   npm run install:all
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Build the project
   ```bash
   npm run build
   ```

## 📦 Key Components

### UI Components

The application includes several reusable UI components:

- **Button**: Customizable button with multiple variants
- **Card**: Container component with consistent styling
- **Input**: Form input with validation
- **Modal**: Dialog component for user interactions
- **Notification**: Toast notification system
- **Loading**: Loading indicators and spinners

### Context Providers

- **ThemeProvider**: Manages application theme
- **ModalProvider**: Handles modal dialogs
- **NotificationProvider**: Manages notification toasts

### Layout Components

- **MainLayout**: Standard page layout with header and footer
- **AuthLayout**: Layout for authentication pages (upcoming)

## 📋 Development Guidelines

### Component Structure

```
Component/
├── index.tsx         # Main component code
├── Component.styles.ts   # Styled components (optional)
├── Component.test.tsx    # Tests (upcoming)
└── types.ts          # Component-specific types (optional)
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Button`, `Card`)
- **Functions**: camelCase (e.g., `handleClick`, `fetchData`)
- **Variables**: camelCase (e.g., `userData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`, `ButtonProps`)

## 📈 Future Enhancements

- **Unit Testing**: Implement comprehensive test suite
- **State Management**: Add Redux for more complex state scenarios
- **Mobile App**: Develop native mobile applications
- **Performance Optimization**: Implement code splitting and lazy loading
- **Accessibility**: Enhance accessibility features
- **Internationalization**: Add multi-language support

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://www.miya.baby/)
- [Twitter](https://x.com/MI_YA_190)
- [GitHub](https://github.com/MIYA-byte/MIYA) 