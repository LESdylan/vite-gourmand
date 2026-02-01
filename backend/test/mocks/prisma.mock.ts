/**
 * Prisma Mock for E2E Tests
 * ==========================
 * 
 * Provides a mock PrismaClient that works with Jest.
 * This mock uses in-memory storage to simulate real database behavior.
 */

// In-memory storage
let users: any[] = [];
let roles: any[] = [
  { id: 1, libelle: 'admin' },
  { id: 2, libelle: 'manager' },
  { id: 3, libelle: 'client' },
];
let orders: any[] = [];
let menus: any[] = [];
let publishes: any[] = [];
let idCounters = { user: 1, order: 1, menu: 1, publish: 1 };

// Helper to reset data
export const resetMockData = () => {
  users = [];
  orders = [];
  menus = [];
  publishes = [];
  idCounters = { user: 1, order: 1, menu: 1, publish: 1 };
};

// Create model mock with real behavior
const createUserMock = () => ({
  findUnique: jest.fn().mockImplementation(async ({ where }) => {
    return users.find(u => u.id === where.id || u.email === where.email) || null;
  }),
  findFirst: jest.fn().mockImplementation(async ({ where }) => {
    return users.find(u => {
      if (where?.email) return u.email === where.email;
      if (where?.roleId) return u.roleId === where.roleId;
      return true;
    }) || null;
  }),
  findMany: jest.fn().mockImplementation(async ({ where } = {}) => {
    if (!where) return users;
    return users.filter(u => {
      if (where.email?.contains) return u.email.includes(where.email.contains);
      return true;
    });
  }),
  create: jest.fn().mockImplementation(async ({ data, include }) => {
    const user = { ...data, id: idCounters.user++ };
    users.push(user);
    if (include?.role) {
      user.role = roles.find(r => r.id === user.roleId);
    }
    return user;
  }),
  update: jest.fn().mockImplementation(async ({ where, data }) => {
    const idx = users.findIndex(u => u.id === where.id);
    if (idx >= 0) users[idx] = { ...users[idx], ...data };
    return users[idx];
  }),
  delete: jest.fn().mockImplementation(async ({ where }) => {
    const idx = users.findIndex(u => u.id === where.id);
    if (idx >= 0) {
      const deleted = users[idx];
      users.splice(idx, 1);
      // Cascade delete orders
      orders = orders.filter(o => o.userId !== where.id);
      return deleted;
    }
    return null;
  }),
  deleteMany: jest.fn().mockImplementation(async ({ where }) => {
    const before = users.length;
    users = users.filter(u => !u.email?.includes(where?.email?.contains || ''));
    return { count: before - users.length };
  }),
  upsert: jest.fn().mockImplementation(async ({ where, create, update }) => {
    let user = users.find(u => u.id === where.id || u.email === where.email);
    if (user) {
      Object.assign(user, update);
    } else {
      user = { ...create, id: where.id || idCounters.user++ };
      users.push(user);
    }
    return user;
  }),
  groupBy: jest.fn().mockResolvedValue([]),
  aggregate: jest.fn().mockResolvedValue({ _count: users.length }),
});

const createRoleMock = () => ({
  findUnique: jest.fn().mockImplementation(async ({ where }) => 
    roles.find(r => r.id === where.id) || null
  ),
  findFirst: jest.fn().mockImplementation(async ({ where }) =>
    roles.find(r => r.libelle === where?.libelle) || null
  ),
  findMany: jest.fn().mockResolvedValue(roles),
  create: jest.fn().mockImplementation(async ({ data }) => {
    const role = { ...data, id: roles.length + 1 };
    roles.push(role);
    return role;
  }),
  upsert: jest.fn().mockImplementation(async ({ where, create }) => {
    let role = roles.find(r => r.id === where.id);
    if (!role) {
      role = { ...create, id: where.id || roles.length + 1 };
      roles.push(role);
    }
    return role;
  }),
});

const createOrderMock = () => ({
  findUnique: jest.fn().mockImplementation(async ({ where, include }) => {
    const order = orders.find(o => o.id === where.id);
    if (order && include?.menus) {
      order.menus = menus.filter(m => order.menuIds?.includes(m.id));
    }
    return order || null;
  }),
  findFirst: jest.fn().mockImplementation(async ({ where }) => orders[0] || null),
  findMany: jest.fn().mockImplementation(async ({ where } = {}) => orders),
  create: jest.fn().mockImplementation(async ({ data, include }) => {
    const menuConnections = data.menus?.connect || [];
    const order = {
      ...data,
      id: idCounters.order++,
      menuIds: menuConnections.map((m: any) => m.id),
      menus: undefined,
    };
    delete order.menus;
    orders.push(order);
    if (include?.menus) {
      return { ...order, menus: menus.filter(m => order.menuIds.includes(m.id)) };
    }
    return order;
  }),
  update: jest.fn().mockImplementation(async ({ where, data }) => {
    const idx = orders.findIndex(o => o.id === where.id);
    if (idx >= 0) orders[idx] = { ...orders[idx], ...data };
    return orders[idx];
  }),
  delete: jest.fn().mockImplementation(async ({ where }) => {
    const idx = orders.findIndex(o => o.id === where.id);
    if (idx >= 0) return orders.splice(idx, 1)[0];
    return null;
  }),
  deleteMany: jest.fn().mockImplementation(async ({ where }) => {
    const before = orders.length;
    if (where?.order_number?.startsWith) {
      orders = orders.filter(o => !o.order_number?.startsWith(where.order_number.startsWith));
    } else if (where?.id) {
      orders = orders.filter(o => o.id !== where.id);
    }
    return { count: before - orders.length };
  }),
  groupBy: jest.fn().mockResolvedValue([]),
  aggregate: jest.fn().mockResolvedValue({ _avg: { menu_price: 500 }, _count: orders.length }),
});

const createMenuMock = () => ({
  findUnique: jest.fn().mockImplementation(async ({ where }) =>
    menus.find(m => m.id === where.id) || null
  ),
  findFirst: jest.fn().mockImplementation(async () => menus[0] || null),
  findMany: jest.fn().mockResolvedValue(menus),
  create: jest.fn().mockImplementation(async ({ data }) => {
    const menu = { ...data, id: idCounters.menu++ };
    menus.push(menu);
    return menu;
  }),
  update: jest.fn().mockImplementation(async ({ where, data }) => {
    const idx = menus.findIndex(m => m.id === where.id);
    if (idx >= 0) menus[idx] = { ...menus[idx], ...data };
    return menus[idx];
  }),
  delete: jest.fn().mockImplementation(async ({ where }) => {
    const idx = menus.findIndex(m => m.id === where.id);
    if (idx >= 0) return menus.splice(idx, 1)[0];
    return null;
  }),
  deleteMany: jest.fn().mockImplementation(async ({ where }) => {
    const before = menus.length;
    menus = menus.filter(m => m.title !== where?.title);
    return { count: before - menus.length };
  }),
});

const createPublishMock = () => ({
  findUnique: jest.fn().mockImplementation(async ({ where }) =>
    publishes.find(p => p.id === where.id) || null
  ),
  findFirst: jest.fn().mockResolvedValue(publishes[0] || null),
  findMany: jest.fn().mockImplementation(async ({ where } = {}) => {
    if (where?.status) return publishes.filter(p => p.status === where.status);
    return publishes;
  }),
  create: jest.fn().mockImplementation(async ({ data }) => {
    const publish = { ...data, id: idCounters.publish++ };
    publishes.push(publish);
    return publish;
  }),
  update: jest.fn().mockImplementation(async ({ where, data }) => {
    const idx = publishes.findIndex(p => p.id === where.id);
    if (idx >= 0) publishes[idx] = { ...publishes[idx], ...data };
    return publishes[idx];
  }),
  delete: jest.fn().mockImplementation(async ({ where }) => {
    const idx = publishes.findIndex(p => p.id === where.id);
    if (idx >= 0) return publishes.splice(idx, 1)[0];
    return null;
  }),
  deleteMany: jest.fn().mockImplementation(async ({ where }) => {
    const before = publishes.length;
    publishes = publishes.filter(p => !p.description?.includes(where?.description?.contains || ''));
    return { count: before - publishes.length };
  }),
});

const createGenericMock = () => ({
  findUnique: jest.fn().mockResolvedValue(null),
  findFirst: jest.fn().mockResolvedValue(null),
  findMany: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation(async ({ data }) => ({ ...data, id: 1 })),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(null),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  upsert: jest.fn().mockImplementation(async ({ create }) => create),
});

// Mock PrismaClient class
export class PrismaClient {
  user = createUserMock();
  role = createRoleMock();
  order = createOrderMock();
  menu = createMenuMock();
  publish = createPublishMock();
  dish = createGenericMock();
  diet = createGenericMock();
  theme = createGenericMock();
  allergen = createGenericMock();
  workingHours = createGenericMock();

  $connect = jest.fn().mockResolvedValue(undefined);
  $disconnect = jest.fn().mockResolvedValue(undefined);
  $executeRaw = jest.fn().mockResolvedValue(0);
  $executeRawUnsafe = jest.fn().mockResolvedValue(0);
  $queryRaw = jest.fn().mockResolvedValue([]);
  $queryRawUnsafe = jest.fn().mockResolvedValue([]);
  $transaction = jest.fn().mockImplementation(async (fn) => {
    if (typeof fn === 'function') {
      return fn(this);
    }
    return Promise.all(fn);
  });
}

// Type exports for compatibility
export type User = {
  id: number;
  email: string;
  password: string;
  first_name: string;
  telephone_number: string;
  city: string;
  country: string;
  postal_address: string;
  roleId: number | null;
  gdprConsent: boolean;
  gdprConsentDate: Date | null;
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Role = { id: number; libelle: string };
export type Order = { id: number; status: string; userId: number };
export type Menu = { id: number; title: string };
export type Publish = { id: number; status: string; userId: number };

export default { PrismaClient, resetMockData };
