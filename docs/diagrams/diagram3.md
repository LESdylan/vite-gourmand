```mermaid
sequenceDiagram
  participant User
  participant System
  participant Admin

  User->>System: Registers or Logs in
  User->>System: Publishes a Menu/Order
  System-->>User: Confirms Publish
  User->>System: Places Order
  System-->>User: Order Arrived
  System->>Admin: Notifies Admin if New Role/Publish Needed
  Admin-->>System: Approves/Assigns Role
  System-->>User: Notifies Role/Publish Approval
```