# Sample Merfolk Documentation

This example demonstrates how to document a simple web application architecture using Merfolk syntax.

```merfolk
graph3d "Web Application Architecture"

%% Frontend Components
UI[Component: UserInterface]
API{Component: APIGateway}
AUTH((Module: Authentication))

%% Backend Services
DB<Datapath: Database>
CACHE[[Class: CacheManager]]
LOG[Function: Logger]

%% Business Logic
USER_SVC[Function: UserService]
ORDER_SVC[Function: OrderService]
PAYMENT_SVC[Function: PaymentService]

%% Data Flow Connections
UI --> API : "HTTP requests"
API -.-> AUTH : "authentication"
API --> USER_SVC : "user operations"
API --> ORDER_SVC : "order processing"
API --> PAYMENT_SVC : "payment handling"

%% Data Storage
USER_SVC --> DB@front : "user data"
ORDER_SVC --> DB@back : "order data"
PAYMENT_SVC --> DB@top : "payment records"

%% Caching Layer
USER_SVC --- CACHE : "user cache"
ORDER_SVC --- CACHE : "order cache"

%% Logging
LOG --> DB@bottom : "log storage"
USER_SVC -.-> LOG : "audit logs"
ORDER_SVC -.-> LOG : "transaction logs"
PAYMENT_SVC -.-> LOG : "payment logs"

%% Service Dependencies
ORDER_SVC == USER_SVC : "user dependency"
PAYMENT_SVC == ORDER_SVC : "order dependency"
```

## Syntax Explanation

### Node Types and Geometries

- `[Function: name]` - Cube geometry for functions
- `{Component: name}` - Dodecahedron geometry for components
- `<Datapath: name>` - Plane geometry for data paths

### Connection Types

- `-->` - Data flow (solid arrow)
- `-.->` - Control flow (dashed arrow)
- `---` - Association (solid line)
- `==` - Inheritance/dependency (thick line)

### Face Connections

Use `@faceName` to connect to specific faces:

- `@front`, `@back`, `@top`, `@bottom`, `@left`, `@right` for cubes
- `@face_0` through `@face_11` for dodecahedrons

### Labels

Add labels to connections using `: "label text"`
