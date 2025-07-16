# Application Architecture Documentation

This document describes the 3D layout and relationships of our web application using Merfolk syntax.

## System Overview

```merfolk
graph3d "E-commerce Web Application"
description: "Complete e-commerce system with microservices architecture"

%% Frontend Layer (Top Level - Y=0)
UI[Component: UserInterface] {color: "#2196F3", scale: "2,1,2"}
CART{Component: ShoppingCart} {color: "#4CAF50"}
CHECKOUT((Component: CheckoutFlow)) {color: "#FF9800"}

%% API Gateway Layer (Middle - Y=-2)
API_GW<Datapath: APIGateway> {color: "#9C27B0", scale: "3,0.5,1"}
AUTH[[Class: AuthenticationService]] {color: "#F44336"}

%% Business Logic Layer (Lower Middle - Y=-4)
USER_SVC[Function: UserService] {color: "#00BCD4"}
PRODUCT_SVC[Function: ProductService] {color: "#795548"}
ORDER_SVC[Function: OrderService] {color: "#607D8B"}
PAYMENT_SVC[Function: PaymentService] {color: "#E91E63"}
INVENTORY_SVC[Function: InventoryService] {color: "#8BC34A"}

%% Data Layer (Bottom - Y=-6)
USER_DB((Module: UserDatabase)) {color: "#3F51B5"}
PRODUCT_DB((Module: ProductDatabase)) {color: "#FF5722"}
ORDER_DB((Module: OrderDatabase)) {color: "#009688"}
CACHE<Datapath: RedisCache> {color: "#FFC107"}

%% External Services (Side - Z=4)
PAYMENT_API[Function: StripeAPI] {color: "#673AB7"}
EMAIL_SVC[Function: EmailService] {color: "#CDDC39"}
ANALYTICS<Datapath: GoogleAnalytics> {color: "#795548"}

%% User Flow Connections
UI --> API_GW@front : "HTTP requests"
CART --> API_GW@left : "cart operations"
CHECKOUT --> API_GW@right : "checkout process"

%% Authentication Flow
API_GW@back --> AUTH@front : "auth validation"
AUTH --> USER_DB@top : "user lookup"

%% Service Layer Connections
API_GW@bottom --> USER_SVC@top : "user operations"
API_GW@bottom --> PRODUCT_SVC@top : "product queries"
API_GW@bottom --> ORDER_SVC@top : "order processing"
API_GW@bottom --> PAYMENT_SVC@top : "payment handling"

%% Inter-service Communication
ORDER_SVC@left --> USER_SVC@right : "user validation"
ORDER_SVC@front --> INVENTORY_SVC@back : "stock check"
ORDER_SVC@bottom --> PAYMENT_SVC@top : "payment processing"

%% Database Connections
USER_SVC --> USER_DB : "user data"
PRODUCT_SVC --> PRODUCT_DB : "product catalog"
ORDER_SVC --> ORDER_DB : "order storage"
INVENTORY_SVC --> PRODUCT_DB@bottom : "inventory updates"

%% Caching Layer
USER_SVC -.-> CACHE@left : "user cache"
PRODUCT_SVC -.-> CACHE@front : "product cache"
ORDER_SVC -.-> CACHE@right : "order cache"

%% External API Integrations
PAYMENT_SVC --> PAYMENT_API : "payment processing"
ORDER_SVC -.-> EMAIL_SVC : "order notifications"
UI -.-> ANALYTICS : "user tracking"

%% Service Dependencies
ORDER_SVC == USER_SVC : "depends on user service"
PAYMENT_SVC == ORDER_SVC : "depends on order service"
INVENTORY_SVC == PRODUCT_SVC : "depends on product service"
```

## Data Flow Patterns

### User Registration Flow

```merfolk
graph3d "User Registration Flow"

%% User Journey
SIGNUP_FORM[Component: SignupForm]
VALIDATION[Function: InputValidator]
EMAIL_VERIFY[Function: EmailVerifier]
USER_CREATOR[Function: UserCreator]
WELCOME_EMAIL[Function: WelcomeEmailSender]

%% Data Storage
USER_DB((Module: UserDatabase))
EMAIL_QUEUE<Datapath: EmailQueue>

%% Flow Connections
SIGNUP_FORM --> VALIDATION : "form data"
VALIDATION --> EMAIL_VERIFY : "validated email"
EMAIL_VERIFY --> USER_CREATOR : "verified user data"
USER_CREATOR --> USER_DB : "create user record"
USER_CREATOR -.-> WELCOME_EMAIL : "trigger welcome"
WELCOME_EMAIL --> EMAIL_QUEUE : "queue email"
```

### Product Search and Filter

```merfolk
graph3d "Product Search Architecture"

%% Search Components
SEARCH_BAR[Component: SearchBar]
FILTER_PANEL{Component: FilterPanel}
RESULTS_GRID{Component: ProductGrid}

%% Search Processing
SEARCH_ENGINE[Function: SearchEngine]
FILTER_ENGINE[Function: FilterEngine]
RANKING_ALGO[Function: RankingAlgorithm]

%% Data Sources
SEARCH_INDEX<Datapath: ElasticsearchIndex>
PRODUCT_CATALOG((Module: ProductCatalog))
USER_PREFS<Datapath: UserPreferences>

%% Search Flow
SEARCH_BAR --> SEARCH_ENGINE@front : "search query"
FILTER_PANEL --> FILTER_ENGINE@left : "filter criteria"
SEARCH_ENGINE --> SEARCH_INDEX : "query index"
FILTER_ENGINE --> PRODUCT_CATALOG : "apply filters"
SEARCH_INDEX@back --> RANKING_ALGO@front : "raw results"
PRODUCT_CATALOG@back --> RANKING_ALGO@left : "filtered products"
USER_PREFS --> RANKING_ALGO@bottom : "personalization"
RANKING_ALGO --> RESULTS_GRID : "ranked results"
```

## Microservices Communication

### Event-Driven Architecture

```merfolk
graph3d "Event-Driven Microservices"

%% Event Infrastructure
EVENT_BUS<Datapath: EventBus> {scale: "4,0.5,4", color: "#FF9800"}
MESSAGE_QUEUE<Datapath: RabbitMQ> {scale: "3,0.5,3", color: "#9C27B0"}

%% Publishing Services
ORDER_SVC[Function: OrderService]
PAYMENT_SVC[Function: PaymentService]
INVENTORY_SVC[Function: InventoryService]
USER_SVC[Function: UserService]

%% Subscribing Services
EMAIL_SVC[Function: EmailService]
ANALYTICS_SVC[Function: AnalyticsService]
NOTIFICATION_SVC[Function: NotificationService]
AUDIT_SVC[Function: AuditService]

%% Event Publishing
ORDER_SVC --> EVENT_BUS@front : "OrderCreated"
PAYMENT_SVC --> EVENT_BUS@right : "PaymentProcessed"
INVENTORY_SVC --> EVENT_BUS@back : "StockUpdated"
USER_SVC --> EVENT_BUS@left : "UserRegistered"

%% Event Consumption
EVENT_BUS@top --> EMAIL_SVC : "email triggers"
EVENT_BUS@top --> ANALYTICS_SVC : "analytics events"
EVENT_BUS@top --> NOTIFICATION_SVC : "push notifications"
EVENT_BUS@top --> AUDIT_SVC : "audit trail"

%% Message Queue for Reliability
EVENT_BUS -.-> MESSAGE_QUEUE : "persistent storage"
MESSAGE_QUEUE -.-> EMAIL_SVC@bottom : "reliable delivery"
MESSAGE_QUEUE -.-> NOTIFICATION_SVC@bottom : "retry logic"
```

## How to Process These Markdown Files

In your 3D application, you can process these markdown files like this:

````typescript
import { AST3DGenerator } from '3d-ast-generator';
import fs from 'fs';

// Read markdown file
const markdownContent = fs.readFileSync('architecture.md', 'utf8');

// Extract Merfolk code blocks
const merfolkBlocks = extractMerfolkBlocks(markdownContent);

// Create generator
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'hierarchical',
    nodeSpacing: 3.0,
    layers: 6,
  },
  visual: {
    theme: 'dark',
    colors: {
      function: '#4CAF50',
      component: '#2196F3',
      datapath: '#FF9800',
      module: '#9C27B0',
    },
  },
});

// Process each diagram
merfolkBlocks.forEach((block, index) => {
  const graph = generator.generate(block.content);

  // Add to your 3D scene
  addGraphToScene(graph, {
    position: { x: index * 20, y: 0, z: 0 },
  });
});

function extractMerfolkBlocks(markdown: string) {
  const regex = /```merfolk\n([\s\S]*?)\n```/g;
  const blocks = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      content: match[1],
      index: blocks.length,
    });
  }

  return blocks;
}
````

## Syntax Reference

### Node Types and Shapes

- `[Function: name]` → **Cube** - Functions and procedures
- `{Component: name}` → **Dodecahedron** - UI components and modules
- `<Datapath: name>` → **Plane** - Data flows and APIs

### Connection Types

- `-->` → **Data Flow** (solid arrow) - Data passing between components
- `-.->` → **Control Flow** (dashed arrow) - Control signals and triggers
- `---` → **Association** (solid line) - Loose coupling
- `==` → **Dependency** (thick line) - Strong dependencies

### Face-Specific Connections

Connect to specific faces of 3D objects:

- `@front`, `@back`, `@left`, `@right`, `@top`, `@bottom` for cubes
- `@face_0` through `@face_11` for dodecahedrons

### Styling Properties

Add visual properties in curly braces:

```
NodeID[Type: Name] {color: "#FF0000", scale: "2,1,1", opacity: "0.8"}
```

This approach lets you document complex architectures visually while keeping the documentation in readable markdown format!
