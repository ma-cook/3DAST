# Complete Merfolk 3D Syntax Examples

This file demonstrates the full syntax capabilities of the 3D AST generator with various node types and connections.

## Example 1: Simple Web Application Architecture

```merfolk
    %% Frontend Components (Rectangular nodes for UI components)
    ReactApp[Component: React Application]
    LoginForm[Component: Login Form]
    Dashboard[Component: Dashboard]
    UserProfile[Component: User Profile]
    Navigation[Component: Navigation Bar]

    %% Functions (Curved nodes for business logic)
    AuthService{Function: Authentication Service}
    DataValidator{Function: Data Validation}
    APIClient{Function: API Client}
    StateManager{Function: State Management}

    %% Backend Services (Circular nodes for services)
    AuthAPI((Service: Authentication API))
    UserAPI((Service: User Management API))
    DataAPI((Service: Data Processing API))

    %% Data Storage (Diamond nodes for data flow)
    UserDB<Database: User Database>
    SessionStore<Cache: Session Storage>
    LogsDB<Database: Application Logs>

    %% External Services (Box nodes for external systems)
    EmailService[[External: Email Service]]
    PaymentGateway[[External: Payment Gateway]]
    Analytics[[External: Analytics Service]]

    %% Connections with labels using -->|"label"| syntax
    ReactApp -->|"renders"| LoginForm
    ReactApp -->|"displays"| Dashboard
    ReactApp -->|"shows"| UserProfile
    ReactApp -->|"includes"| Navigation

    LoginForm -->|"validates credentials"| AuthService
    Dashboard -->|"fetches user data"| APIClient
    UserProfile -->|"updates profile"| DataValidator

    AuthService -->|"authenticates user"| AuthAPI
    DataValidator -->|"validates input"| UserAPI
    APIClient -->|"makes requests"| DataAPI
    StateManager -->|"manages sessions"| SessionStore

    AuthAPI -->|"stores user sessions"| SessionStore
    AuthAPI -->|"queries user data"| UserDB
    UserAPI -->|"reads/writes user info"| UserDB
    DataAPI -->|"processes data"| UserDB
    DataAPI -->|"logs operations"| LogsDB

    AuthAPI -->|"sends welcome email"| EmailService
    UserAPI -->|"processes payments"| PaymentGateway
    Dashboard -->|"tracks user events"| Analytics

    StateManager -->|"synchronizes state"| ReactApp
    APIClient -->|"handles errors"| StateManager
```

## Example 2: Machine Learning Pipeline

```merfolk
    %% Data Sources (Diamond shapes for data flow)
    RawData<Input: Raw Dataset>
    StreamingData<Input: Real-time Stream>
    HistoricalData<Input: Historical Data>

    %% Data Processing Functions
    DataCleaner{Function: Data Cleaning}
    FeatureExtractor{Function: Feature Extraction}
    DataValidator{Function: Data Validation}
    Normalizer{Function: Data Normalization}

    %% ML Components
    ModelTrainer[Component: Model Trainer]
    ModelValidator[Component: Model Validator]
    Predictor[Component: Prediction Engine]
    ModelRegistry[Component: Model Registry]

    %% Infrastructure Services
    DataLake((Storage: Data Lake))
    ModelStore((Storage: Model Storage))
    MetricsDB((Storage: Metrics Database))

    %% Monitoring and Analytics
    PerformanceMonitor[[Monitor: Performance Tracking]]
    AlertSystem[[Monitor: Alert System]]
    Dashboard[[UI: ML Dashboard]]

    %% Data Flow Connections with labels
    RawData -->|"ingests batch data"| DataCleaner
    StreamingData -->|"processes real-time"| DataValidator
    HistoricalData -->|"loads reference data"| FeatureExtractor

    DataCleaner -->|"cleaned data"| FeatureExtractor
    DataValidator -->|"validated stream"| Normalizer
    FeatureExtractor -->|"extracted features"| Normalizer
    Normalizer -->|"normalized dataset"| DataLake

    DataLake -->|"training data"| ModelTrainer
    ModelTrainer -->|"trained model"| ModelValidator
    ModelValidator -->|"validated model"| ModelRegistry
    ModelRegistry -->|"deployed model"| Predictor

    Normalizer -->|"live features"| Predictor
    Predictor -->|"predictions"| MetricsDB
    ModelStore -->|"model artifacts"| Predictor

    ModelTrainer -->|"saves models"| ModelStore
    ModelValidator -->|"stores metrics"| MetricsDB
    Predictor -->|"logs predictions"| MetricsDB

    ModelTrainer -->|"training metrics"| PerformanceMonitor
    Predictor -->|"prediction metrics"| PerformanceMonitor
    PerformanceMonitor -->|"performance data"| Dashboard
    PerformanceMonitor -->|"triggers alerts"| AlertSystem
```

## Example 3: Microservices E-commerce System

```merfolk
    %% API Gateway and Load Balancer
    LoadBalancer[Component: Load Balancer]
    APIGateway[Component: API Gateway]

    %% Core Microservices
    UserService((Service: User Management))
    ProductService((Service: Product Catalog))
    OrderService((Service: Order Processing))
    PaymentService((Service: Payment Processing))
    InventoryService((Service: Inventory Management))
    NotificationService((Service: Notification Service))

    %% Business Logic Functions
    AuthController{Function: Authentication Controller}
    OrderValidator{Function: Order Validation}
    PriceCalculator{Function: Price Calculator}
    InventoryChecker{Function: Inventory Checker}
    PaymentProcessor{Function: Payment Processor}

    %% Data Stores
    UserDB<Database: User Database>
    ProductDB<Database: Product Database>
    OrderDB<Database: Order Database>
    InventoryDB<Database: Inventory Database>

    %% Message Queues and Events
    OrderQueue<Queue: Order Processing Queue>
    PaymentQueue<Queue: Payment Queue>
    NotificationQueue<Queue: Notification Queue>
    EventBus<Event: Event Bus>

    %% External Integrations
    PaymentGateway[[External: Payment Gateway]]
    ShippingAPI[[External: Shipping Service]]
    EmailService[[External: Email Service]]
    SMSService[[External: SMS Service]]

    %% Cache Layer
    RedisCache((Cache: Redis Cache))
    CDN((Cache: Content Delivery Network))

    %% Request Flow with labels
    LoadBalancer -->|"distributes requests"| APIGateway
    APIGateway -->|"routes user requests"| UserService
    APIGateway -->|"routes product requests"| ProductService
    APIGateway -->|"routes order requests"| OrderService
    APIGateway -->|"routes payment requests"| PaymentService

    %% Authentication Flow
    UserService -->|"authenticates"| AuthController
    AuthController -->|"validates credentials"| UserDB
    AuthController -->|"caches sessions"| RedisCache

    %% Product Catalog Flow
    ProductService -->|"reads product data"| ProductDB
    ProductService -->|"serves static content"| CDN
    ProductService -->|"caches frequently accessed"| RedisCache

    %% Order Processing Flow
    OrderService --> OrderValidator           %% validates order
    OrderValidator --> InventoryChecker       %% checks inventory
    InventoryChecker --> InventoryService     %% queries stock
    InventoryService --> InventoryDB          %% reads inventory

    OrderValidator --> PriceCalculator        %% calculates total
    PriceCalculator --> ProductService        %% gets product prices
    OrderService --> OrderDB                  %% stores order
    OrderService --> OrderQueue               %% queues for processing

    %% Payment Processing Flow
    OrderQueue --> PaymentProcessor           %% processes payment
    PaymentProcessor --> PaymentService       %% initiates payment
    PaymentService --> PaymentGateway         %% charges customer
    PaymentService --> PaymentQueue           %% queues payment result

    %% Inventory Management Flow
    PaymentQueue --> InventoryService         %% updates inventory
    InventoryService --> InventoryDB          %% decrements stock
    InventoryService --> EventBus             %% publishes inventory event

    %% Notification Flow
    PaymentQueue --> NotificationService      %% triggers notifications
    OrderService --> NotificationQueue        %% sends order updates
    NotificationService --> EmailService      %% sends emails
    NotificationService --> SMSService        %% sends SMS

    %% Event-driven Communication
    EventBus --> NotificationService          %% inventory low event
    EventBus --> ShippingAPI                  %% order completed event
    EventBus --> UserService                  %% user activity event
```

## Node Type Reference

The 3D AST generator supports these node shapes based on syntax:

- **Rectangular Nodes** `[Component Name]` → **Cube geometry** (for UI components, services)
- **Curved Nodes** `{Function Name}` → **Tetrahedron geometry** (for functions, algorithms)
- **Circular Nodes** `((Service Name))` → **Sphere geometry** (for services, APIs)
- **Diamond Nodes** `<Data Name>` → **Plane geometry** (for data stores, queues)
- **Box Nodes** `[[External Name]]` → **Dodecahedron geometry** (for external systems)

## Connection Syntax

Currently supported connection syntax:

- `A --> B` - Creates a connection from A to B
- `A -->|"label"| B` - Creates a labeled connection from A to B
- `A --> B : "label"` - Alternative labeled connection syntax
- Comments can be added after connections: `A --> B  %% description`

## Configuration Tips

For best visualization results:

```javascript
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'grid', // or 'circular', 'hierarchical'
    nodeSpacing: 120, // spacing between nodes
  },
});
```

## Usage in Your Application

To use these examples with proper type mapping:

```javascript
// Generate the AST
const result = generator.generate(mermaidContent);
const astData = result.toJSON();

// Map node.geometry to obj.type for ObjectRenderer
const processedObjects = astData.nodes.map((node) => ({
  ...node,
  type: node.geometry, // This is the key fix!
  position: [
    node.transform.position.x,
    node.transform.position.y,
    node.transform.position.z,
  ],
  scale: [
    node.transform.scale.x,
    node.transform.scale.y,
    node.transform.scale.z,
  ],
}));

// Use connection anchors for line rendering
const connectionLines = astData.connections.map((conn) => ({
  start: [conn.source.anchor.x, conn.source.anchor.y, conn.source.anchor.z],
  end: [conn.target.anchor.x, conn.target.anchor.y, conn.target.anchor.z],
}));
```
