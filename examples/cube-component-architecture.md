# Cube Component Architecture

This document describes the architecture of the Cube.jsx React component using Merfolk syntax.

## Component Overview

The Cube component is a complex 3D interactive element that supports face selection, text editing, transformations, and connections.

```merfolk
graph3d "Cube Component Main Architecture"

%% Core Component Structure
A[Component: CubeComponent]
B[Component: FaceIndicator]
C[Component: TextSprite]
D[Component: ObjectUI]
E[Component: FaceUI]
F[Component: HeaderInput]
G[Component: TextStyleUI]
H[Component: FaceTextInput]
I[Component: SnapLineIndicator]

%% External Dependencies
J{Component: React}
K{Component: ReactThreeFiber}
L{Component: ReactThreeDrei}
M{Component: ThreeJS}
N{Component: Lodash}

%% Store Dependencies
O<Datapath: useCubeStore>
P<Datapath: useObjectsStore>
Q<Datapath: useConnectionStore>

%% Utility Dependencies
R<Datapath: snappingUtils>
S<Datapath: cubeHelpers>

%% Connections
A --> B : "renders"
A --> C : "displays"
A --> D : "manages"
A --> E : "controls"
A --> F : "header input"
A --> G : "text styling"
A --> H : "face text"
A --> I : "snap lines"

J --> A : "provides framework"
K --> A : "3D rendering"
L --> A : "3D helpers"
M --> A : "graphics engine"
N --> A : "utilities"

O --> A : "cube state"
P --> A : "objects state"
Q --> A : "connections state"

R --> A : "snapping logic"
S --> A : "cube helpers"
```

## Data Flow Architecture

```merfolk
graph3d "Cube Component Data Flow"

%% Props Input
A<Datapath: PropsData>
B[Function: CubeComponent]

%% Store State Management
C<Datapath: CubeState>
D<Datapath: ObjectState>
E<Datapath: ConnectionState>

%% Event Handlers
F[Function: handleSceneClick]
G[Function: handleFaceClick]
H[Function: handleIndicatorClick]
I[Function: handleTransformToggle]
J[Function: handleDrag]
K[Function: handleScale]

%% Output
L<Datapath: DatabaseUpdate>
M[Function: setCubeState]

%% Data Flow
A --> B : "props"
C --> B : "cube state"
D --> B : "object state"
E --> B : "connection state"

B --> F : "scene events"
B --> G : "face events"
B --> H : "indicator events"
B --> I : "transform events"
B --> J : "drag events"
B --> K : "scale events"

F --> L : "updates"
G --> L : "updates"
H --> L : "updates"
I --> L : "updates"
J --> L : "updates"
K --> L : "updates"

B --> M : "state changes"
M --> C : "cube updates"

%% Face connections
F@right --> G@left : "event delegation"
G@right --> H@left : "indicator selection"
H@bottom --> M@top : "state updates"
```

## Face Management System

```merfolk
graph3d "Face Management Architecture"

%% Face Data Structure
A[Component: FaceRenderer]
B[Component: FaceIndicator]
C[Component: FaceUI]
D[Component: TextSprite]

%% Face Types (6 cube faces)
E<Datapath: front>
F<Datapath: back>
G<Datapath: top>
H<Datapath: bottom>
I<Datapath: left>
J<Datapath: right>

%% Face Properties
K<Datapath: faceColors>
L<Datapath: faceTexts>
M<Datapath: faceTextStyles>
N<Datapath: faceConnections>

%% Face Events
O[Function: handleFaceClick]
P[Function: handleFaceColorChange]
Q[Function: handleFaceTextClick]
R[Function: handleFaceTextStyleClick]

%% Structure
A --> B : "indicators"
A --> C : "UI controls"
A --> D : "text display"

E --> A : "front face"
F --> A : "back face"
G --> A : "top face"
H --> A : "bottom face"
I --> A : "left face"
J --> A : "right face"

K --> A : "colors"
L --> A : "texts"
M --> A : "styles"
N --> A : "connections"

A --> O : "click events"
A --> P : "color events"
A --> Q : "text events"
A --> R : "style events"

O --> C : "UI updates"
P --> C : "color updates"
Q --> D : "text updates"
R --> D : "style updates"
```

## Transform System

```merfolk
graph3d "Transform and Interaction System"

%% Transform Controls
A[Component: TransformControls]
B[Function: handleDrag]
C[Function: handleScale]

%% Snapping System
D<Datapath: calculateAxisSnap>
E[Component: SnapLineIndicator]

%% Position Management
F<Datapath: position>
G<Datapath: scale>
H<Datapath: rotation>

%% Database Updates
I<Datapath: positionUpdate>
J<Datapath: scaleUpdate>

%% Visual Feedback
K[Component: SnapLine]
L[Component: ScaleGizmo]

%% Store Updates
M<Datapath: updatePosition>
N<Datapath: updateScale>

%% Spatial System
O[Function: onMove]
P<Datapath: SpatialRouting>

%% Connections
A --> B : "drag handling"
A --> C : "scale handling"

B --> D : "snap calculation"
D --> E : "snap indicators"

F --> B : "position input"
G --> C : "scale input"
H --> A : "rotation input"

B --> I : "position updates"
C --> J : "scale updates"

B --> K : "snap lines"
C --> L : "scale gizmo"

I --> M : "store position"
J --> N : "store scale"

B --> O : "movement events"
O --> P : "spatial routing"
```

## State Management Flow

```merfolk
graph3d "State Management Architecture"

%% Store Actions
A<Datapath: useCubeStore>
B[Function: createCube]
C[Function: updateCube]
D[Function: selectCube]
E[Function: deleteCube]

%% Store Selectors
F[Function: getCube]
G[Function: isCubeSelected]
H[Function: getCubeState]

%% Component State
I[Component: CubeComponent]
J<Datapath: cubeData>

%% External Store Integration
K<Datapath: useObjectsStore>
L<Datapath: useConnectionStore>

%% State Synchronization
M[Function: updateDatabase]
N<Datapath: persistedData>

%% Event-driven updates
O[Function: handleStateChange]

%% Connections
A --> B : "create action"
A --> C : "update action"
A --> D : "select action"
A --> E : "delete action"

A --> F : "get selector"
A --> G : "selection selector"
A --> H : "state selector"

I --> F : "data access"
F --> J : "cube data"
J --> I : "data binding"

K --> I : "objects store"
L --> I : "connections store"

C --> M : "persistence"
M --> N : "saved data"

I --> O : "state changes"
O --> C : "update trigger"
```

## Connection System

```merfolk
graph3d "Connection and Indicator System"

%% Connection Detection
A<Datapath: connections>
B[Function: isIndicatorConnected]
C[Component: FaceIndicator]

%% Connection Creation
D[Function: handleIndicatorClick]
E<Datapath: connectionStart>
F<Datapath: ConnectionManager>

%% Visual States
G<Datapath: isConnected>
H<Datapath: isActive>
I<Datapath: isSelected>

%% Connection Display
J[Component: ConnectionLine]
K<Datapath: ConnectionVisual>

%% Face-specific connections
L<Datapath: frontFace>
M<Datapath: backFace>
N<Datapath: topFace>
O<Datapath: bottomFace>
P<Datapath: leftFace>
Q<Datapath: rightFace>

%% Flow
A --> B : "connection check"
B --> C : "indicator state"

D --> E : "start event"
E --> F : "manager"

G --> C : "connected state"
H --> C : "active state"
I --> C : "selected state"

F --> J : "line creation"
J --> K : "visual render"

C@front --> L : "front connection"
C@back --> M : "back connection"
C@top --> N : "top connection"
C@bottom --> O : "bottom connection"
C@left --> P : "left connection"
C@right --> Q : "right connection"
```

## Event System

```merfolk
graph3d "Event Handling Architecture"

%% Mouse Events
A<Datapath: onClick>
B[Function: handleSceneClick]
C[Function: handleFaceClick]
D[Function: handleIndicatorClick]

%% Transform Events
E<Datapath: onDrag>
F[Function: handleDrag]
G<Datapath: onScale>
H[Function: handleScale]

%% Text Events
I<Datapath: onTextClick>
J[Function: handleTextClick]
K<Datapath: onTextSubmit>
L[Function: handleTextSubmit]

%% UI Events
M<Datapath: onColorChange>
N[Function: handleColorChange]
O<Datapath: onStyleChange>
P[Function: handleStyleChange]

%% Event Propagation
Q[Function: stopPropagation]

%% Callback Events
R<Datapath: onClick>
S<Datapath: onMove>
T<Datapath: onUpdate>

%% Event Flow
A --> B : "scene clicks"
A --> C : "face clicks"
A --> D : "indicator clicks"

E --> F : "drag events"
G --> H : "scale events"

I --> J : "text clicks"
K --> L : "text submission"

M --> N : "color changes"
O --> P : "style changes"

B --> Q : "stop propagation"
C --> Q : "stop propagation"
D --> Q : "stop propagation"
J --> Q : "stop propagation"

B --> R : "click callback"
F --> S : "move callback"
H --> T : "update callback"
```

## Performance Optimizations

```merfolk
graph3d "Performance and Optimization"

%% Memoization
A[Function: useMemo]
B<Datapath: derivedValues>
C<Datapath: renderFaces>
D<Datapath: renderFaceTexts>

%% Callback Optimization
E[Function: useCallback]
F<Datapath: eventHandlers>
G<Datapath: updateFunctions>

%% Rendering Optimization
H[Function: ReactMemo]
I[Component: CubeComponent]
J[Function: isEqual]

%% Debouncing
K[Function: debounce]
L<Datapath: updateDatabase>
M<Datapath: timeoutRef>

%% Reference Stability
N[Function: useRef]
O<Datapath: meshRef>
P<Datapath: contentRef>
Q<Datapath: lastUpdateTimeRef>

%% Conditional Rendering
R<Datapath: shouldRender>

%% Connections
A --> B : "computes"
A --> C : "optimizes"
A --> D : "caches"

E --> F : "stabilizes"
E --> G : "optimizes"

H --> I : "memoizes"
J --> H : "equality check"

K --> L : "delays"
M --> K : "timer"

N --> O : "mesh reference"
N --> P : "content reference"
N --> Q : "timing reference"

R --> C : "conditional"
R --> D : "conditional"
```

## Component Hierarchy

```merfolk
graph3d "Component Composition Tree"

%% Root Component
A[Component: Cube]
B[Component: TransformControls]
C[Component: SnapLineIndicator]
D{Component: cubeGroup}

%% Main Cube Group
E[Component: HitBox]
F[Component: EdgeLines]
G{Component: facesGroup}
H{Component: textGroup}
I{Component: headerGroup}

%% Face Group
J[Component: FaceMesh]
K[Component: FaceIndicator]
L[Component: FaceUI]

%% Text Group
M[Component: FaceTextSprite]
N[Component: TextStyleUI]

%% Header Group
O[Component: HeaderText]
P[Component: HeaderInput]
Q[Component: HeaderStyleUI]

%% External UI
R[Component: ObjectUI]

%% Hierarchy
A --> B : "transform control"
A --> C : "snap indicators"
A --> D : "main group"

D --> E : "hit detection"
D --> F : "edge rendering"
D --> G : "face group"
D --> H : "text group"
D --> I : "header group"

G --> J : "face mesh"
G --> K : "face indicators"
G --> L : "face UI"

H --> M : "text sprites"
H --> N : "text styling"

I --> O : "header text"
I --> P : "header input"
I --> Q : "header styling"

R --> A : "positioned outside"
```

## Integration Points

```merfolk
graph3d "External Integration Architecture"

%% Parent Component Interface
A<Datapath: CubeProps>
B[Component: Cube]

%% 3D Scene Integration
C<Datapath: ThreeScene>
D<Datapath: SceneCamera>
E<Datapath: WebGLRenderer>

%% Store Integration
F<Datapath: GlobalState>
G<Datapath: CubeState>
H<Datapath: ConnectionState>

%% Utility Integration
I<Datapath: SnappingSystem>
J<Datapath: ValidationSystem>
K<Datapath: GeometryHelpers>

%% Event System Integration
L<Datapath: EventBus>
M<Datapath: AnimationLoop>
N<Datapath: RenderLoop>

%% Database Integration
O<Datapath: DatabaseAPI>
P[Function: updateDatabase]

%% Integrations
A --> B : "component props"

C --> B : "3D scene"
D --> B : "camera"
E --> B : "renderer"

F --> B : "global state"
G --> B : "cube state"
H --> B : "connection state"

I --> B : "snapping"
J --> B : "validation"
K --> B : "geometry"

L --> B : "events"
M --> B : "animation"
N --> B : "rendering"

O --> P : "database access"
P --> B : "data persistence"
```
