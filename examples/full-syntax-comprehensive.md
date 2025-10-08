# Full Syntax Merfolk Example - E-Commerce Platform Architecture

This example demonstrates the complete Merfolk syntax with nested components, functions, labeled connections, and various geometries for a modern e-commerce platform.

```merfolk
%% === MAIN APPLICATION COMPONENTS ===
WebApp[Component: Web Application Frontend]
MobileApp[Component: Mobile Application]
APIGateway[Component: API Gateway Service]
AuthService[Component: Authentication Service]
OrderService[Component: Order Management Service]
PaymentService[Component: Payment Processing Service]
ProductService[Component: Product Catalog Service]

%% === DATA STORAGE COMPONENTS ===
UserDatabase[[Store: User Database]]
ProductDatabase[[Store: Product Database]]
OrderDatabase[[Store: Order Database]]

%% === EXTERNAL SERVICES ===
PaymentProvider((Service: External Payment Provider))
EmailService((Service: Email Notification Service))
CDN((Service: Content Delivery Network))

%% === BUSINESS LOGIC FUNCTIONS ===
validateUser{Function: User Validation}
authenticateToken{Function: Token Authentication}
processPayment{Function: Payment Processing}
calculateTax{Function: Tax Calculation}
updateInventory{Function: Inventory Update}
sendNotification{Function: Email Notification}
generateInvoice{Function: Invoice Generation}
searchProducts{Function: Product Search}
createOrder{Function: Order Creation}
trackShipment{Function: Shipment Tracking}

%% === CLIENT TO GATEWAY CONNECTIONS ===
WebApp -->|"HTTP Requests"| APIGateway
MobileApp -->|"Mobile API Calls"| APIGateway

%% === GATEWAY ROUTING ===
APIGateway -->|"Route Auth"| AuthService
APIGateway -->|"Route Orders"| OrderService
APIGateway -->|"Route Payments"| PaymentService
APIGateway -->|"Route Products"| ProductService

%% === AUTHENTICATION FLOW ===
validateUser -->|"Validates"| AuthService
authenticateToken -->|"Manages Tokens"| AuthService
AuthService -->|"User Data"| UserDatabase

%% === ORDER PROCESSING FLOW ===
createOrder -->|"Creates"| OrderService
processPayment -->|"Processes"| PaymentService
calculateTax -->|"Calculates"| PaymentService
updateInventory -->|"Updates"| ProductService
generateInvoice -->|"Generates"| OrderService
trackShipment -->|"Tracks"| OrderService

%% === DATA PERSISTENCE ===
OrderService -->|"Store Orders"| OrderDatabase
ProductService -->|"Product Data"| ProductDatabase
PaymentService -->|"Payment Records"| OrderDatabase

%% === EXTERNAL INTEGRATIONS ===
PaymentService -->|"Process Payment"| PaymentProvider
sendNotification -->|"Send Emails"| EmailService
ProductService -->|"Serve Images"| CDN

%% === PRODUCT CATALOG ===
searchProducts -->|"Search Logic"| ProductService
ProductService -->|"Search Queries"| ProductDatabase

%% === NOTIFICATION SYSTEM ===
sendNotification -->|"Handles"| OrderService
OrderService -->|"Email Triggers"| EmailService
```

## Merfolk Syntax Features Demonstrated

### **1. Component Types & Geometries**

- `[Component: Name]` → **Rectangular components** (main services)
- `[[Store: Name]]` → **Box stores** (databases)
- `((Service: Name))` → **Circular services** (external APIs)
- `{Function: Name}` → **Curved functions** (business logic)

### **2. Labeled Connections**

- `-->|"Label"|` → **Labeled arrows** showing data flow with descriptions
- Clear semantic meaning for each connection type

### **3. Nested Grouping (Automatic)**

The 3D AST generator will automatically create nested grouping:

- **AuthService** contains:

  - `validateUser` function
  - `authenticateToken` function

- **PaymentService** contains:

  - `processPayment` function
  - `calculateTax` function

- **ProductService** contains:

  - `updateInventory` function
  - `searchProducts` function

- **OrderService** contains:
  - `createOrder` function
  - `generateInvoice` function
  - `trackShipment` function
  - `sendNotification` function

### **4. Architecture Patterns**

- **API Gateway Pattern**: Central routing through APIGateway
- **Microservices**: Separate services for auth, orders, payments, products
- **Database Per Service**: Each service has its own data store
- **External Integration**: Payment providers, email, CDN
- **Business Logic Separation**: Functions encapsulate specific operations

### **5. Object Count: 29 Total**

- **7 Components** (Web services)
- **3 Stores** (Databases)
- **3 External Services** (Third-party)
- **10 Functions** (Business logic)
- **6 Unlabeled connections** (Simple flow)

### **6. Visual Representation**

When rendered in 3D:

- Components appear as **dodecahedrons** (containers)
- Functions appear as **cubes** nested inside their parent components
- Stores appear as **larger rectangular boxes**
- External services appear as **spheres**
- Connections show as **labeled lines** between objects

This example demonstrates a realistic e-commerce architecture with proper separation of concerns, clear data flow, and modern microservices patterns.
