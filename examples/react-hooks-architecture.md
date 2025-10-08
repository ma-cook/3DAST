# React Application with Hooks - 3D Architecture

This example demonstrates how to visualize React applications with custom hooks using the 3D AST Generator.

## Complete Application with Hooks

```merfolk
%% React Application Architecture with Hooks
App{Component: Main Application}
Header{Component: Header}
Sidebar{Component: Sidebar}
Content{Component: Content Area}
Footer{Component: Footer}

%% Custom Hooks (Cubes - Pink #E91E63)
useAuth[Hook: useAuth]
useUser[Hook: useUser]
useTheme[Hook: useTheme]
useLocalStorage[Hook: useLocalStorage]
useMediaQuery[Hook: useMediaQuery]

%% Functions (Cubes - Green #4CAF50)
handleLogin[Function: Login Handler]
handleLogout[Function: Logout Handler]
toggleTheme[Function: Toggle Theme]
fetchUserProfile[Function: Fetch Profile]

%% Store (Cubes - Purple #9C27B0)
UserStore[[Store: User Store]]
ThemeStore[[Store: Theme Store]]

%% Services (Tetrahedrons - Orange #FF9800)
AuthService((Service: Auth API))
UserService((Service: User API))

%% Libraries (Cubes - Cyan #00BCD4)
React<Library: React>
ReactRouter<Library: React Router>

%% Hook Dependencies
useAuth --> useLocalStorage : "persists token"
useUser --> useAuth : "requires auth"
useTheme --> useLocalStorage : "persists preference"
useMediaQuery --> Header : "responsive layout"

%% Hook to Component Connections
useAuth --> Header : "provides auth state"
useUser --> Sidebar : "provides user data"
useTheme --> App : "provides theme"

%% Function Nesting (Functions nest in components)
handleLogin --> Header : "handles auth"
handleLogout --> Header : "handles logout"
toggleTheme --> Header : "switches theme"
fetchUserProfile --> Sidebar : "loads profile"

%% Component Hierarchy
App --> Header : "renders"
App --> Sidebar : "renders"
App --> Content : "renders"
App --> Footer : "renders"

%% Store Connections
useAuth --> UserStore : "reads/writes auth"
useUser --> UserStore : "reads user data"
useTheme --> ThemeStore : "reads/writes theme"

%% Service Connections
handleLogin --> AuthService : "authenticates"
handleLogout --> AuthService : "invalidates session"
fetchUserProfile --> UserService : "fetches data"

%% Library Dependencies
App --> React : "uses"
App --> ReactRouter : "routing"
```

## E-Commerce App with Hooks

```merfolk
%% E-Commerce Application
ProductList{Component: Product List}
ShoppingCart{Component: Shopping Cart}
Checkout{Component: Checkout}

%% E-Commerce Hooks
useCart[Hook: useCart]
useProducts[Hook: useProducts]
useCheckout[Hook: useCheckout]
usePayment[Hook: usePayment]

%% Functions
addToCart[Function: Add to Cart]
removeFromCart[Function: Remove from Cart]
processPayment[Function: Process Payment]

%% Stores
CartStore[[Store: Cart Store]]
ProductStore[[Store: Product Store]]

%% Services
ProductAPI((Service: Product API))
PaymentGateway((Service: Payment Gateway))

%% Hook Logic
useCart --> CartStore : "manages cart"
useProducts --> ProductStore : "manages products"
useCheckout --> useCart : "requires cart"
usePayment --> useCheckout : "requires checkout"

%% Component Hooks
useCart --> ShoppingCart : "provides cart state"
useProducts --> ProductList : "provides products"
useCheckout --> Checkout : "provides checkout"
usePayment --> Checkout : "provides payment"

%% Functions
addToCart --> ProductList : "adds items"
removeFromCart --> ShoppingCart : "removes items"
processPayment --> Checkout : "completes order"

%% Services
useProducts --> ProductAPI : "fetches products"
processPayment --> PaymentGateway : "processes payment"
```

## Form Management with Hooks

```merfolk
%% Form Application
RegistrationForm{Component: Registration Form}
LoginForm{Component: Login Form}
ProfileForm{Component: Profile Form}

%% Form Hooks
useForm[Hook: useForm]
useValidation[Hook: useValidation]
useFormState[Hook: useFormState]
useFieldArray[Hook: useFieldArray]

%% Hook Composition
useForm --> useValidation : "validates fields"
useForm --> useFormState : "manages state"
useFieldArray --> useForm : "extends form"

%% Component Usage
useForm --> RegistrationForm : "manages registration"
useForm --> LoginForm : "manages login"
useForm --> ProfileForm : "manages profile"
useFieldArray --> ProfileForm : "dynamic fields"
```

## Key Features Demonstrated

### Hook Visualization

- **Hooks are Cubes**: All hooks render as pink (#E91E63) cubes
- **Hook Syntax**: Use `[Hook: name]` bracket notation
- **Hook Composition**: Hooks can connect to other hooks
- **Component Integration**: Hooks connect to components they serve

### Geometry Types Used

1. **Components** → Dodecahedrons (blue #2196F3)
2. **Hooks** → Cubes (pink #E91E63)
3. **Functions** → Cubes (green #4CAF50)
4. **Stores** → Cubes (purple #9C27B0)
5. **Services** → Tetrahedrons (orange #FF9800)
6. **Libraries** → Cubes (cyan #00BCD4)

### Best Practices

- Use hooks to represent React hooks (useState, useEffect, custom hooks)
- Connect hooks to the components that use them
- Show hook composition and dependencies
- Nest functions in components for better organization
- Use stores for state management
- Use services for external APIs

This creates clear, visual representations of React application architecture with proper hook management!
