# Complete Merfolk 3D Syntax Examples

This file demonstrates the full syntax capabilities of the 3D AST generator with various node types, connection styles, and labeling options.

## Example 1: Web Application Architecture

```merfolk
    %% Modern Web Application Stack
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

    %% Frontend to Business Logic Connections
    ReactApp -->|"renders"| LoginForm
    ReactApp -->|"displays"| Dashboard
    ReactApp -->|"shows"| UserProfile
    ReactApp -->|"includes"| Navigation

    LoginForm -->|"validates credentials"| AuthService
    Dashboard -->|"fetches user data"| APIClient
    UserProfile -->|"updates profile"| DataValidator

    %% Business Logic to API Connections
    AuthService -->|"authenticates user"| AuthAPI
    DataValidator -->|"validates input"| UserAPI
    APIClient -->|"makes requests"| DataAPI
    StateManager -->|"manages sessions"| SessionStore

    %% API to Database Connections
    AuthAPI -->|"stores user sessions"| SessionStore
    AuthAPI -->|"queries user data"| UserDB
    UserAPI -->|"reads/writes user info"| UserDB
    DataAPI -->|"processes data"| UserDB
    DataAPI -->|"logs operations"| LogsDB

    %% External Service Connections
    AuthAPI -->|"sends welcome email"| EmailService
    UserAPI -->|"processes payments"| PaymentGateway
    Dashboard -->|"tracks user events"| Analytics

    %% Cross-cutting Concerns
    StateManager -->|"synchronizes state"| ReactApp
    APIClient -->|"handles errors"| StateManager
```

## Example 2: Machine Learning Pipeline

```merfolk
    %% ML Data Processing Pipeline
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

    %% Data Ingestion Flow
    RawData -->|"ingests batch data"| DataCleaner
    StreamingData -->|"processes real-time"| DataValidator
    HistoricalData -->|"loads reference data"| FeatureExtractor

    %% Data Processing Pipeline
    DataCleaner -->|"cleaned data"| FeatureExtractor
    DataValidator -->|"validated stream"| Normalizer
    FeatureExtractor -->|"extracted features"| Normalizer
    Normalizer -->|"normalized dataset"| DataLake

    %% Model Training Flow
    DataLake -->|"training data"| ModelTrainer
    ModelTrainer -->|"trained model"| ModelValidator
    ModelValidator -->|"validated model"| ModelRegistry
    ModelRegistry -->|"deployed model"| Predictor

    %% Prediction Flow
    Normalizer -->|"live features"| Predictor
    Predictor -->|"predictions"| MetricsDB
    ModelStore -->|"model artifacts"| Predictor

    %% Storage Connections
    ModelTrainer -->|"saves models"| ModelStore
    ModelValidator -->|"stores metrics"| MetricsDB
    Predictor -->|"logs predictions"| MetricsDB

    %% Monitoring Connections
    ModelTrainer -->|"training metrics"| PerformanceMonitor
    Predictor -->|"prediction metrics"| PerformanceMonitor
    PerformanceMonitor -->|"performance data"| Dashboard
    PerformanceMonitor -->|"triggers alerts"| AlertSystem
```

## Example 3: Microservices E-commerce System

```merfolk
    %% E-commerce Microservices Architecture
    %% API Gateway and Load Balancer
    LoadBalancer[Component: Load Balancer]
    APIGateway[Component: API Gateway]

    %% Core Microservices (Different shapes for different service types)
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

    %% Data Stores (Diamond shapes for databases)
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

    %% Request Flow
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
    OrderService -->|"validates order"| OrderValidator
    OrderValidator -->|"checks inventory"| InventoryChecker
    InventoryChecker -->|"queries stock"| InventoryService
    InventoryService -->|"reads inventory"| InventoryDB

    OrderValidator -->|"calculates total"| PriceCalculator
    PriceCalculator -->|"gets product prices"| ProductService
    OrderService -->|"stores order"| OrderDB
    OrderService -->|"queues for processing"| OrderQueue

    %% Payment Processing Flow
    OrderQueue -->|"processes payment"| PaymentProcessor
    PaymentProcessor -->|"initiates payment"| PaymentService
    PaymentService -->|"charges customer"| PaymentGateway
    PaymentService -->|"queues payment result"| PaymentQueue

    %% Inventory Management Flow
    PaymentQueue -->|"updates inventory"| InventoryService
    InventoryService -->|"decrements stock"| InventoryDB
    InventoryService -->|"publishes inventory event"| EventBus

    %% Notification Flow
    PaymentQueue -->|"triggers notifications"| NotificationService
    OrderService -->|"sends order updates"| NotificationQueue
    NotificationService -->|"sends emails"| EmailService
    NotificationService -->|"sends SMS"| SMSService

    %% Event-driven Communication
    EventBus -->|"inventory low event"| NotificationService
    EventBus -->|"order completed event"| ShippingAPI
    EventBus -->|"user activity event"| UserService
```

## Example 4: DevOps CI/CD Pipeline

```merfolk
    %% Continuous Integration and Deployment Pipeline
    %% Source Control and Triggers
    GitRepo[Component: Git Repository]
    WebhookTrigger{Function: Webhook Trigger}

    %% CI/CD Pipeline Stages (Functions for processing steps)
    CodeAnalyzer{Function: Code Analysis}
    TestRunner{Function: Test Execution}
    SecurityScanner{Function: Security Scan}
    BuildProcess{Function: Build Process}
    ImageBuilder{Function: Container Builder}

    %% Quality Gates (Components for decision points)
    QualityGate[Component: Quality Gate]
    SecurityGate[Component: Security Gate]
    ApprovalGate[Component: Manual Approval]

    %% Artifact Storage
    ArtifactRepo((Storage: Artifact Repository))
    ContainerRegistry((Storage: Container Registry))

    %% Deployment Environments (Different shapes for environments)
    DevEnvironment<Environment: Development>
    StagingEnvironment<Environment: Staging>
    ProductionEnvironment<Environment: Production>

    %% Infrastructure Components
    LoadBalancer[Component: Load Balancer]
    Database((Storage: Database Cluster))
    Monitoring[[Monitor: Application Monitoring]]

    %% External Services
    SlackNotifier[[External: Slack Notifications]]
    EmailNotifier[[External: Email Notifications]]
    JiraIntegration[[External: Jira Integration]]

    %% Pipeline Trigger Flow
    GitRepo -->|"code push event"| WebhookTrigger
    WebhookTrigger -->|"triggers pipeline"| CodeAnalyzer

    %% Code Quality Pipeline
    CodeAnalyzer -->|"analyzes code quality"| QualityGate
    QualityGate -->|"quality passed"| TestRunner
    QualityGate -->|"quality failed"| SlackNotifier

    %% Testing and Security
    TestRunner -->|"runs unit tests"| SecurityScanner
    TestRunner -->|"test results"| QualityGate
    SecurityScanner -->|"security scan results"| SecurityGate
    SecurityGate -->|"security passed"| BuildProcess
    SecurityGate -->|"security issues"| JiraIntegration

    %% Build and Package
    BuildProcess -->|"compiles application"| ArtifactRepo
    BuildProcess -->|"creates container"| ImageBuilder
    ImageBuilder -->|"pushes image"| ContainerRegistry

    %% Development Deployment
    ArtifactRepo -->|"deploys to dev"| DevEnvironment
    ContainerRegistry -->|"runs containers"| DevEnvironment
    DevEnvironment -->|"dev testing complete"| ApprovalGate

    %% Staging Deployment
    ApprovalGate -->|"approved for staging"| StagingEnvironment
    StagingEnvironment -->|"staging tests pass"| ApprovalGate
    StagingEnvironment -->|"load testing"| LoadBalancer

    %% Production Deployment
    ApprovalGate -->|"approved for production"| ProductionEnvironment
    ProductionEnvironment -->|"serves traffic"| LoadBalancer
    ProductionEnvironment -->|"connects to data"| Database

    %% Monitoring and Feedback
    ProductionEnvironment -->|"application metrics"| Monitoring
    StagingEnvironment -->|"staging metrics"| Monitoring
    DevEnvironment -->|"dev metrics"| Monitoring

    Monitoring -->|"alerts on issues"| SlackNotifier
    Monitoring -->|"performance reports"| EmailNotifier

    %% Feedback Loop
    Monitoring -->|"creates issues"| JiraIntegration
    JiraIntegration -->|"links to commits"| GitRepo
```

## Node Type Reference

The 3D AST generator supports these node shapes based on syntax:

- **Rectangular Nodes** `[Component Name]` → **Cube geometry** (for UI components, services)
- **Curved Nodes** `{Function Name}` → **Tetrahedron geometry** (for functions, algorithms)
- **Circular Nodes** `((Service Name))` → **Sphere geometry** (for services, APIs)
- **Diamond Nodes** `<Data Name>` → **Plane geometry** (for data stores, queues)
- **Box Nodes** `[[External Name]]` → **Dodecahedron geometry** (for external systems)

## Connection Labels

All connections support labels using the `-->|"label text"|` syntax:

- `A -->|"processes data"| B` - Creates a labeled connection
- `A --> B` - Creates an unlabeled connection
- Labels appear as text along the connection lines in 3D space

## Configuration Tips

For best visualization results:

```javascript
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'grid', // or 'circular', 'hierarchical'
    nodeSpacing: 30, // spacing between nodes
    groupSpacing: 50, // spacing between groups
  },
});
```
