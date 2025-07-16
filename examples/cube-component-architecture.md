# Cube Component Architecture

This document describes the architecture of the Cube.jsx React component using Merfolk syntax.

## Component Overview

The Cube component is a complex 3D interactive element that supports face selection, text editing, transformations, and connections.

```merfolk
title: "Cube Component Main Architecture"

# Core Component Structure
A[Component: CubeComponent] --> B[Component: FaceIndicator]
A --> C[Component: TextSprite]
A --> D[Component: ObjectUI]
A --> E[Component: FaceUI]
A --> F[Component: HeaderInput]
A --> G[Component: TextStyleUI]
A --> H[Component: FaceTextInput]
A --> I[Component: SnapLineIndicator]

# External Dependencies
J{Library: React} --> A
K{Library: ReactThreeFiber} --> A
L{Library: ReactThreeDrei} --> A
M{Library: ThreeJS} --> A
N{Library: Lodash} --> A

# Store Dependencies
O<Store: useCubeStore> --> A
P<Store: useObjectsStore> --> A
Q<Store: useConnectionStore> --> A

# Utility Dependencies
R<Util: snappingUtils> --> A
S<Util: cubeHelpers> --> A
```

## Data Flow Architecture

```merfolk
title: "Cube Component Data Flow"

# Props Input
A<Input: PropsData> --> B[Function: CubeComponent]

# Store State Management
C<Store: CubeState> --> B
D<Store: ObjectState> --> B
E<Store: ConnectionState> --> B

# Event Handlers
B --> F[Function: handleSceneClick]
B --> G[Function: handleFaceClick]
B --> H[Function: handleIndicatorClick]
B --> I[Function: handleTransformToggle]
B --> J[Function: handleDrag]
B --> K[Function: handleScale]

# Update Flow
F --> L<Output: DatabaseUpdate>
G --> L
H --> L
I --> L
J --> L
K --> L

# UI State Updates
B --> M[Function: setCubeState]
M --> C

# Face connections
F@right --> G@left : "event delegation"
G@right --> H@left : "indicator selection"
H@bottom --> M@top : "state updates"
```

## Face Management System

```merfolk
title: "Face Management Architecture"

# Face Data Structure
A[Component: FaceRenderer] --> B[Component: FaceIndicator]
A --> C[Component: FaceUI]
A --> D[Component: TextSprite]

# Face Types (6 cube faces)
E<Face: front> --> A
F<Face: back> --> A
G<Face: top> --> A
H<Face: bottom> --> A
I<Face: left> --> A
J<Face: right> --> A

# Face Properties
K<Data: faceColors> --> A
L<Data: faceTexts> --> A
M<Data: faceTextStyles> --> A
N<Data: faceConnections> --> A

# Face Events
A --> O[Function: handleFaceClick]
A --> P[Function: handleFaceColorChange]
A --> Q[Function: handleFaceTextClick]
A --> R[Function: handleFaceTextStyleClick]

# Face UI Components
O --> C
P --> C
Q --> D
R --> D
```

## Transform System

```merfolk
title: "Transform and Interaction System"

# Transform Controls
A[Component: TransformControls] --> B[Function: handleDrag]
A --> C[Function: handleScale]

# Snapping System
B --> D<Util: calculateAxisSnap>
D --> E[Component: SnapLineIndicator]

# Position Management
F<Data: position> --> B
G<Data: scale> --> C
H<Data: rotation> --> A

# Database Updates
B --> I<Output: positionUpdate>
C --> J<Output: scaleUpdate>

# Visual Feedback
B --> K[Component: SnapLine]
C --> L[Component: ScaleGizmo]

# Store Updates
I --> M<Store: updatePosition>
J --> N<Store: updateScale>

# Connection to spatial system
B --> O[Function: onMove]
O --> P<System: SpatialRouting>
```

## State Management Flow

```merfolk
title: "State Management Architecture"

# Store Actions
A<Store: useCubeStore> --> B[Function: createCube]
A --> C[Function: updateCube]
A --> D[Function: selectCube]
A --> E[Function: deleteCube]

# Store Selectors
A --> F[Function: getCube]
A --> G[Function: isCubeSelected]
A --> H[Function: getCubeState]

# Component State
I[Component: CubeComponent] --> F
F --> J<Data: cubeData>
J --> I

# External Store Integration
K<Store: useObjectsStore> --> I
L<Store: useConnectionStore> --> I

# State Synchronization
C --> M[Function: updateDatabase]
M --> N<Output: persistedData>

# Event-driven updates
I --> O[Function: handleStateChange]
O --> C
```

## Connection System

```merfolk
title: "Connection and Indicator System"

# Connection Detection
A<Store: connections> --> B[Function: isIndicatorConnected]
B --> C[Component: FaceIndicator]

# Connection Creation
D[Function: handleIndicatorClick] --> E<Event: connectionStart>
E --> F<System: ConnectionManager>

# Visual States
G<State: isConnected> --> C
H<State: isActive> --> C
I<State: isSelected> --> C

# Connection Display
F --> J[Component: ConnectionLine]
J --> K<Render: ConnectionVisual>

# Face-specific connections
C@front --> L<Connection: frontFace>
C@back --> M<Connection: backFace>
C@top --> N<Connection: topFace>
C@bottom --> O<Connection: bottomFace>
C@left --> P<Connection: leftFace>
C@right --> Q<Connection: rightFace>
```

## Event System

```merfolk
title: "Event Handling Architecture"

# Mouse Events
A<Event: onClick> --> B[Function: handleSceneClick]
A --> C[Function: handleFaceClick]
A --> D[Function: handleIndicatorClick]

# Transform Events
E<Event: onDrag> --> F[Function: handleDrag]
G<Event: onScale> --> H[Function: handleScale]

# Text Events
I<Event: onTextClick> --> J[Function: handleTextClick]
K<Event: onTextSubmit> --> L[Function: handleTextSubmit]

# UI Events
M<Event: onColorChange> --> N[Function: handleColorChange]
O<Event: onStyleChange> --> P[Function: handleStyleChange]

# Event Propagation
B --> Q[Function: stopPropagation]
C --> Q
D --> Q
J --> Q

# Callback Events
B --> R<Callback: onClick>
F --> S<Callback: onMove>
H --> T<Callback: onUpdate>
```

## Performance Optimizations

```3d-ast
title: "Performance and Optimization"

# Memoization
A[Function: useMemo] --> B<Data: derivedValues>
A --> C<Data: renderFaces>
A --> D<Data: renderFaceTexts>

# Callback Optimization
E[Function: useCallback] --> F<Function: eventHandlers>
E --> G<Function: updateFunctions>

# Rendering Optimization
H[Function: React.memo] --> I[Component: CubeComponent]
J<Function: isEqual] --> H

# Debouncing
K[Function: debounce] --> L<Function: updateDatabase>
M<Ref: timeoutRef> --> K

# Reference Stability
N[Function: useRef] --> O<Ref: meshRef>
N --> P<Ref: contentRef>
N --> Q<Ref: lastUpdateTimeRef>

# Conditional Rendering
R<State: shouldRender> --> C
R --> D
```

## Component Hierarchy

```3d-ast
title: "Component Composition Tree"

# Root Component
A[Component: Cube] --> B[Component: TransformControls]
A --> C[Component: SnapLineIndicator]
A --> D<Group: cubeGroup>

# Main Cube Group
D --> E[Component: HitBox]
D --> F[Component: EdgeLines]
D --> G<Group: facesGroup>
D --> H<Group: textGroup>
D --> I<Group: headerGroup>

# Face Group
G --> J[Component: FaceMesh]
G --> K[Component: FaceIndicator]
G --> L[Component: FaceUI]

# Text Group
H --> M[Component: FaceTextSprite]
H --> N[Component: TextStyleUI]

# Header Group
I --> O[Component: HeaderText]
I --> P[Component: HeaderInput]
I --> Q[Component: HeaderStyleUI]

# External UI
R[Component: ObjectUI] --> A : "positioned outside"
```

## Integration Points

```3d-ast
title: "External Integration Architecture"

# Parent Component Interface
A<Props: CubeProps> --> B[Component: Cube]

# 3D Scene Integration
C<Scene: ThreeScene> --> B
D<Camera: SceneCamera> --> B
E<Renderer: WebGLRenderer> --> B

# Store Integration
F<Store: GlobalState> --> B
G<Store: CubeState> --> B
H<Store: ConnectionState> --> B

# Utility Integration
I<Util: SnappingSystem> --> B
J<Util: ValidationSystem> --> B
K<Util: GeometryHelpers> --> B

# Event System Integration
L<System: EventBus> --> B
M<System: AnimationLoop> --> B
N<System: RenderLoop> --> B

# Database Integration
O<API: DatabaseAPI> --> P[Function: updateDatabase]
P --> B
```
