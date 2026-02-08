# Analysis of Needs — Role Hierarchy & Data Architecture

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                          │
│  Full system access + infrastructure + code deployment  │
├─────────────────────────────────────────────────────────┤
│                      ADMIN                              │
│  Business management, employee oversight, analytics     │
├──────────────────────┬──────────────────────────────────┤
│      EMPLOYEE        │           CLIENT                 │
│  Order processing,   │  Browse menus, place orders,     │
│  delivery, reviews   │  track delivery, leave reviews   │
└──────────────────────┴──────────────────────────────────┘
```

---

## Permission Matrix

| Resource | Action | Super Admin | Admin | Employee | Client |
|----------|--------|:-----------:|:-----:|:--------:|:------:|
| **Users** | Create | ✅ | ✅ | ❌ | ❌ |
| **Users** | Read all | ✅ | ✅ | ❌ | ❌ |
| **Users** | Read own | ✅ | ✅ | ✅ | ✅ |
| **Users** | Update any | ✅ | ✅ | ❌ | ❌ |
| **Users** | Update own | ✅ | ✅ | ✅ | ✅ |
| **Users** | Suspend | ✅ | ✅ | ❌ | ❌ |
| **Users** | Delete (GDPR) | ✅ | ✅ | ❌ | ✅ (own) |
| **Menus** | Create | ✅ | ✅ | ✅ | ❌ |
| **Menus** | Update | ✅ | ✅ | ✅ | ❌ |
| **Menus** | Delete | ✅ | ✅ | ❌ | ❌ |
| **Menus** | Publish | ✅ | ✅ | ❌ | ❌ |
| **Menus** | View published | ✅ | ✅ | ✅ | ✅ |
| **Orders** | Place | ✅ | ✅ | ✅ | ✅ |
| **Orders** | View all | ✅ | ✅ | ✅ | ❌ |
| **Orders** | View own | ✅ | ✅ | ✅ | ✅ |
| **Orders** | Update status | ✅ | ✅ | ✅ | ❌ |
| **Orders** | Cancel (any) | ✅ | ✅ | ❌ | ❌ |
| **Orders** | Cancel (own, pre-confirm) | ✅ | ✅ | ❌ | ✅ |
| **Orders** | Assign employee | ✅ | ✅ | ❌ | ❌ |
| **Reviews** | Write | ✅ | ✅ | ❌ | ✅ |
| **Reviews** | Moderate | ✅ | ✅ | ✅ | ❌ |
| **Reviews** | Delete | ✅ | ✅ | ❌ | ❌ |
| **Delivery** | Assign | ✅ | ✅ | ❌ | ❌ |
| **Delivery** | Update status | ✅ | ✅ | ✅ | ❌ |
| **Delivery** | Track (own order) | ✅ | ✅ | ✅ | ✅ |
| **Analytics** | View dashboard | ✅ | ✅ | ❌ | ❌ |
| **Analytics** | Export data | ✅ | ✅ | ❌ | ❌ |
| **Support** | Create ticket | ✅ | ✅ | ✅ | ✅ |
| **Support** | View all tickets | ✅ | ✅ | ✅ | ❌ |
| **Support** | Assign ticket | ✅ | ✅ | ❌ | ❌ |
| **Kanban** | Configure columns | ✅ | ✅ | ❌ | ❌ |
| **Kanban** | Manage tags | ✅ | ✅ | ❌ | ❌ |
| **Kanban** | Move cards | ✅ | ✅ | ✅ | ❌ |
| **Loyalty** | Configure program | ✅ | ✅ | ❌ | ❌ |
| **Loyalty** | View own points | ✅ | ✅ | ✅ | ✅ |
| **Discounts** | Create codes | ✅ | ✅ | ❌ | ❌ |
| **System** | DB monitoring | ✅ | ❌ | ❌ | ❌ |
| **System** | Manage roles | ✅ | ❌ | ❌ | ❌ |
| **System** | GDPR requests | ✅ | ✅ | ❌ | ❌ |

---

## Data Ownership: What Goes Where?

```
┌──────────────────────────────────────────────────────────┐
│                    PostgreSQL (ACID)                      │
│                                                          │
│  ✅ Users, Roles, Permissions, Sessions                  │
│  ✅ Menus, Dishes, Allergens, Ingredients                │
│  ✅ Orders, OrderItems, OrderStatusHistory               │
│  ✅ Deliveries, Reviews, ReviewImages                    │
│  ✅ Loyalty accounts, Transactions, Discounts            │
│  ✅ Messages, Notifications, Support Tickets             │
│  ✅ Working Hours, Time-off Requests                     │
│  ✅ GDPR Consent, Deletion Requests                     │
│  ✅ Kanban Config, Tags                                  │
│  ✅ Password Reset Tokens                                │
│                                                          │
│  → Source of truth for ALL business logic                 │
│  → Every write is transactional                          │
│  → Referential integrity enforced                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    MongoDB (Analytics)                    │
│                                                          │
│  📊 Menu view counts, order counts, revenue per menu     │
│  📊 Dashboard statistics (pre-computed daily/weekly)     │
│  📊 Search query analytics, conversion tracking          │
│  📊 User activity logs (clickstream, navigation)         │
│  📊 Audit logs (who changed what, JSON diffs)            │
│  📊 Order snapshots (denormalized for fast reads)        │
│                                                          │
│  → Expendable: can be rebuilt from PostgreSQL events     │
│  → TTL indexes auto-delete old data                     │
│  → App works without it (analytics just disabled)        │
└──────────────────────────────────────────────────────────┘
```

---

## Employee Restriction Rules

| Rule | Enforcement |
|------|-------------|
| Cannot cancel confirmed orders | Backend: check `order.status != 'pending'` before allowing cancel |
| Cannot modify order contents post-confirmation | Backend: reject PUT if `status NOT IN ('pending')` |
| Must contact client before major changes | UI: force phone/email dialog before status change |
| Cannot access financial reports | Permission: no `read` on `analytics` resource |
| Cannot create/delete menus | Permission: only `update` on `menus` resource |
| Can moderate reviews | Permission: `update` on `reviews` resource |
| Cannot see other employees' performance | Backend: filter queries by `user_id = currentUser.id` |

---

## Client Business Rules

| Rule | Enforcement |
|------|-------------|
| Can cancel only before confirmation | Backend: check `order.status = 'pending'` |
| Can modify all items before confirmation | Backend: allow PUT on order_items if `status = 'pending'` |
| Notified by email on `delivered` status | Trigger: send email via queue when status changes |
| Can rate 1-5 stars after delivery | Backend: allow review creation only if order `status = 'delivered'` |
| Loyalty points earned on delivery | Trigger: PostgreSQL trigger + update loyalty_account |
| Can request GDPR data export | API endpoint: serialize user data to JSON/CSV |
| Can request account deletion | API endpoint: create DataDeletionRequest, soft-delete after approval |