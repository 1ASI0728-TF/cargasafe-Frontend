/**
 * FAKE DATABASE (localStorage-backed)
 * ------------------------------------------------------------------
 * This module is the single source of truth for the "fake backend".
 * It replaces any external API with a database that lives entirely
 * in the browser's localStorage.
 *
 * - On first load, it seeds itself with demo data (3 demo accounts,
 *   a small fleet, trips, alerts, subscriptions, etc).
 * - Every write goes straight to localStorage, so data survives
 *   page reloads and browser restarts.
 * - `resetDb()` wipes everything (including the live IoT simulation
 *   snapshots) and reseeds it from scratch.
 * - A tiny listener registry (`onDbChange`) lets the rest of the app
 *   react whenever the database changes — e.g. the Dashboard and the
 *   Alerts screen re-fetch automatically when the IoT simulation
 *   raises a new alert, or when an operator adds a vehicle.
 *
 * NOTE: this file has no Angular dependency on purpose, so it can be
 * imported both from the HTTP interceptor and from any component or
 * service that needs direct access to the fake data (e.g. the IoT
 * simulation engine).
 */

export const FAKE_DB_STORAGE_KEY = 'cargasafe_fake_db_v2';
const SEED_VERSION = 2;

/** Prefix used by the IoT simulation engine to persist per-vehicle sensor snapshots. */
export const IOT_SIM_STORAGE_PREFIX = 'cargasafe_iot_sim::';

// ---------------------------------------------------------------
// Types (kept loose/plain so they match the *Resource shapes used
// by the real assemblers without importing Angular domain models)
// ---------------------------------------------------------------

export interface FakeUser {
  id: number;
  email: string;
  password: string;
  roles: string[];
}

export interface FakeProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  documentType: string | null;
  document: string | null;
  birthDate: string | null; // ISO date
}

export interface FakeVehicle {
  id: number;
  plate: string;
  type: string;
  capabilities: string[];
  status: string;
  odometerKm: number;
  deviceImeis: string[];
}

export interface FakeDevice {
  id: number;
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate: string | null;
}

export interface FakeOriginPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface FakeTrip {
  id: number;
  driverId: number;
  driverName: string;
  deviceId: number;
  vehicleId: number;
  merchantId: number;
  originPointId: number;
  departureAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface FakeDeliveryOrder {
  id: number;
  tripId: number;
  clientEmail: string;
  sequenceOrder: number;
  address: string;
  latitude: number;
  longitude: number;
  maxHumidity: number | null;
  minHumidity: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  maxVibration: number | null;
  arrivalAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';
}

export interface FakeTripParameter {
  id: number;
  tripId: number;
  minTemperature: number | null;
  maxTemperature: number | null;
  minHumidity: number | null;
  maxHumidity: number | null;
  maxVibration: number | null;
}

export interface FakeAlert {
  id: number;
  alertType: string;
  alertStatus: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  description: string;
  incidents: any[];
  notifications: any[];
  deliveryOrderId?: number;
}

export interface FakePlan {
  id: number;
  name: string;
  price: number;
  limits: string;
  description: string;
}

export interface FakeSubscription {
  id: number;
  userId: number;
  status: 'ACTIVE' | 'CANCELED' | 'PENDING' | 'PAST_DUE';
  renewal: string; // ISO date
  paymentMethod: string;
  plan: FakePlan;
}

export interface FakePayment {
  id: number;
  userId: number;
  receiptUrl: string;
  transactionId: string;
  status: string;
  amount: number;
  paymentDate: string;
}

export interface FakeIncidentsByMonth {
  month: string;
  year: number;
  temperatureIncidents: number;
  movementIncidents: number;
  totalIncidents: number;
  incidents: { timestamp: string; vehiclePlate: string; deviceId: string; type: string }[];
}

export interface FakeDatabase {
  _seedVersion: number;
  users: FakeUser[];
  profiles: FakeProfile[];
  vehicles: FakeVehicle[];
  devices: FakeDevice[];
  originPoints: FakeOriginPoint[];
  trips: FakeTrip[];
  deliveryOrders: FakeDeliveryOrder[];
  tripParameters: FakeTripParameter[];
  alerts: FakeAlert[];
  plans: FakePlan[];
  subscriptions: FakeSubscription[];
  payments: FakePayment[];
  incidentsByMonth: FakeIncidentsByMonth[];
}

// ---------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------

export function nowIso(): string {
  return new Date().toISOString();
}

function hoursAgoIso(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgoIso(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

function daysFromNowIso(d: number): string {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
}

function dateOnly(iso: string): string {
  return iso.split('T')[0];
}

// ---------------------------------------------------------------
// Seed data
// ------------------------------------------------------------------
// TEST BUILD NOTE: the fleet intentionally starts small — just the
// two trucks and single IoT device needed to demo every screen
// (an in-progress trip with live sensor data, a completed trip with
// only historical data, and a not-yet-started trip on the vehicle
// that has no device attached).
// ---------------------------------------------------------------

function createSeedDatabase(): FakeDatabase {
  const plans: FakePlan[] = [
    { id: 1, name: 'STANDARD', price: 59, limits: 'Hasta 5 vehículos', description: 'Ideal para flotas pequeñas que están empezando.' },
    { id: 2, name: 'PRO', price: 149, limits: 'Hasta 20 vehículos', description: 'Monitoreo avanzado, alertas en tiempo real y soporte prioritario.' },
    { id: 3, name: 'ENTERPRISE', price: 399, limits: 'Vehículos ilimitados', description: 'Solución a medida para operaciones logísticas grandes.' },
  ];

  const originPoints: FakeOriginPoint[] = [
    { id: 1, name: 'Almacén Central Lima', address: 'Av. Industrial 1200, Callao, Lima, Perú', latitude: -12.0223, longitude: -77.1111 },
    { id: 2, name: 'Almacén Arequipa', address: 'Av. Aviación 450, Arequipa, Perú', latitude: -16.409, longitude: -71.5375 },
  ];

  const vehicles: FakeVehicle[] = [
    { id: 1, plate: 'TRK-001', type: 'TRUCK', capabilities: ['REFRIGERATED', 'GPS'], status: 'IN_SERVICE', odometerKm: 82150, deviceImeis: ['IMEI-8841205'] },
    { id: 2, plate: 'TRK-002', type: 'TRUCK', capabilities: ['REFRIGERATED'], status: 'IN_SERVICE', odometerKm: 41890, deviceImeis: [] },
  ];

  const devices: FakeDevice[] = [
    { id: 1, imei: 'IMEI-8841205', firmware: 'v2.1.0', online: true, vehiclePlate: 'TRK-001' },
  ];

  const trips: FakeTrip[] = [
    {
      // TRK-001 has the only IoT device and is currently on the road ->
      // this is the trip that demonstrates the real-time chart.
      id: 1, driverId: 1, driverName: 'Carlos Ramos', deviceId: 1, vehicleId: 1, merchantId: 1, originPointId: 1,
      departureAt: hoursAgoIso(3), startedAt: hoursAgoIso(3), completedAt: null,
      status: 'IN_PROGRESS', createdAt: hoursAgoIso(4), updatedAt: hoursAgoIso(1),
    },
    {
      // TRK-002 has no device assigned and hasn't started yet.
      id: 2, driverId: 1, driverName: 'Carlos Ramos', deviceId: 0, vehicleId: 2, merchantId: 1, originPointId: 2,
      departureAt: null, startedAt: null, completedAt: null,
      status: 'CREATED', createdAt: hoursAgoIso(2), updatedAt: hoursAgoIso(2),
    },
    {
      // Finished trip on TRK-001 -> demonstrates the history-only view
      // (no live chart once a trip is COMPLETED).
      id: 3, driverId: 1, driverName: 'Carlos Ramos', deviceId: 1, vehicleId: 1, merchantId: 1, originPointId: 1,
      departureAt: daysAgoIso(3), startedAt: daysAgoIso(3), completedAt: daysAgoIso(2),
      status: 'COMPLETED', createdAt: daysAgoIso(3), updatedAt: daysAgoIso(2),
    },
  ];

  const deliveryOrders: FakeDeliveryOrder[] = [
    {
      id: 1, tripId: 1, clientEmail: 'juan.perez@mail.com', sequenceOrder: 1,
      address: 'Calle Los Pinos 340, Surco, Lima', latitude: -12.1453, longitude: -77.0034,
      maxHumidity: 70, minHumidity: 30, maxTemperature: 8, minTemperature: 2, maxVibration: 5,
      arrivalAt: null, createdAt: hoursAgoIso(4), updatedAt: hoursAgoIso(4), status: 'PENDING',
    },
    {
      id: 2, tripId: 1, clientEmail: 'ana.torres@mail.com', sequenceOrder: 2,
      address: 'Av. Larco 1200, Miraflores, Lima', latitude: -12.1219, longitude: -77.0297,
      maxHumidity: 70, minHumidity: 30, maxTemperature: 8, minTemperature: 2, maxVibration: 5,
      arrivalAt: null, createdAt: hoursAgoIso(4), updatedAt: hoursAgoIso(4), status: 'PENDING',
    },
    {
      id: 3, tripId: 2, clientEmail: 'luis.mamani@mail.com', sequenceOrder: 1,
      address: 'Calle Mercaderes 123, Arequipa', latitude: -16.398, longitude: -71.536,
      maxHumidity: 65, minHumidity: 35, maxTemperature: 6, minTemperature: 2, maxVibration: 4,
      arrivalAt: null, createdAt: hoursAgoIso(2), updatedAt: hoursAgoIso(2), status: 'PENDING',
    },
    {
      id: 4, tripId: 3, clientEmail: 'sofia.reyes@mail.com', sequenceOrder: 1,
      address: 'Jr. de la Unión 500, Lima', latitude: -12.0464, longitude: -77.0322,
      maxHumidity: 70, minHumidity: 30, maxTemperature: 8, minTemperature: 2, maxVibration: 5,
      arrivalAt: daysAgoIso(2), createdAt: daysAgoIso(3), updatedAt: daysAgoIso(2), status: 'DELIVERED',
    },
  ];

  const tripParameters: FakeTripParameter[] = [
    { id: 1, tripId: 1, minTemperature: 2, maxTemperature: 8, minHumidity: 30, maxHumidity: 70, maxVibration: 5 },
    { id: 2, tripId: 2, minTemperature: 2, maxTemperature: 6, minHumidity: 35, maxHumidity: 65, maxVibration: 4 },
    { id: 3, tripId: 3, minTemperature: 2, maxTemperature: 8, minHumidity: 30, maxHumidity: 70, maxVibration: 5 },
  ];

  const alerts: FakeAlert[] = [
    {
      id: 1, alertType: 'High Temperature', alertStatus: 'OPEN', createdAt: hoursAgoIso(1), closedAt: null,
      description: 'La temperatura registrada supera el máximo de 8°C configurado para el pedido.',
      incidents: [], notifications: [], deliveryOrderId: 2,
    },
    {
      id: 2, alertType: 'Excessive Vibration', alertStatus: 'ACKNOWLEDGED', createdAt: daysAgoIso(2), closedAt: null,
      description: 'Se detectó una vibración superior a 5g durante el trayecto.',
      incidents: [], notifications: [], deliveryOrderId: 1,
    },
    {
      id: 3, alertType: 'Low Humidity', alertStatus: 'CLOSED', createdAt: daysAgoIso(5), closedAt: daysAgoIso(4),
      description: 'La humedad descendió por debajo del mínimo configurado.',
      incidents: [], notifications: [], deliveryOrderId: 4,
    },
  ];

  const subscriptions: FakeSubscription[] = [
    {
      id: 1, userId: 1, status: 'ACTIVE', renewal: dateOnly(daysFromNowIso(21)),
      paymentMethod: 'Visa •••• 1234', plan: plans[0],
    },
  ];

  const payments: FakePayment[] = [
    { id: 1000, userId: 1, receiptUrl: 'https://example.com/receipts/1000.pdf', transactionId: 'TX-0001', status: 'SUCCEEDED', amount: 59, paymentDate: daysAgoIso(9) },
    { id: 1001, userId: 1, receiptUrl: 'https://example.com/receipts/1001.pdf', transactionId: 'TX-0002', status: 'SUCCEEDED', amount: 59, paymentDate: daysAgoIso(39) },
  ];

  const incidentsByMonth: FakeIncidentsByMonth[] = [
    { month: 'Febrero', year: 2026, temperatureIncidents: 1, movementIncidents: 0, totalIncidents: 1, incidents: [{ timestamp: daysAgoIso(130), vehiclePlate: 'TRK-001', deviceId: 'IMEI-8841205', type: 'TEMPERATURE' }] },
    { month: 'Marzo', year: 2026, temperatureIncidents: 0, movementIncidents: 2, totalIncidents: 2, incidents: [{ timestamp: daysAgoIso(100), vehiclePlate: 'TRK-001', deviceId: 'IMEI-8841205', type: 'MOVEMENT' }] },
    { month: 'Abril', year: 2026, temperatureIncidents: 3, movementIncidents: 1, totalIncidents: 4, incidents: [{ timestamp: daysAgoIso(70), vehiclePlate: 'TRK-001', deviceId: 'IMEI-8841205', type: 'TEMPERATURE' }] },
    { month: 'Mayo', year: 2026, temperatureIncidents: 1, movementIncidents: 1, totalIncidents: 2, incidents: [{ timestamp: daysAgoIso(40), vehiclePlate: 'TRK-002', deviceId: 'N/A', type: 'MOVEMENT' }] },
    { month: 'Junio', year: 2026, temperatureIncidents: 2, movementIncidents: 0, totalIncidents: 2, incidents: [{ timestamp: daysAgoIso(10), vehiclePlate: 'TRK-001', deviceId: 'IMEI-8841205', type: 'TEMPERATURE' }] },
  ];

  return {
    _seedVersion: SEED_VERSION,
    users: [
      { id: 1, email: 'operador@cargasafe.com', password: 'operator123', roles: ['OPERATOR'] },
      { id: 2, email: 'cliente@cargasafe.com', password: 'client123', roles: ['CLIENT'] },
      { id: 3, email: 'admin@cargasafe.com', password: 'admin123', roles: ['ADMIN', 'OPERATOR'] },
    ],
    profiles: [
      { id: 1, userId: 1, firstName: 'Carlos', lastName: 'Ramos', phoneNumber: '+51 912345678', documentType: 'DNI', document: '45678912', birthDate: '1990-05-12' },
      { id: 2, userId: 2, firstName: 'María', lastName: 'Lopez', phoneNumber: '+51 987654321', documentType: 'DNI', document: '71234567', birthDate: '1995-08-23' },
      { id: 3, userId: 3, firstName: 'Admin', lastName: 'CargaSafe', phoneNumber: '+51 999999999', documentType: 'DNI', document: '00000000', birthDate: '1988-01-01' },
    ],
    vehicles,
    devices,
    originPoints,
    trips,
    deliveryOrders,
    tripParameters,
    alerts,
    plans,
    subscriptions,
    payments,
    incidentsByMonth,
  };
}

// ---------------------------------------------------------------
// Change notification (plain pub/sub, no Angular/rxjs dependency)
// ---------------------------------------------------------------

type DbChangeListener = () => void;
const dbChangeListeners: DbChangeListener[] = [];

/** Subscribes to database changes (any `saveDb`/`resetDb` call). Returns an unsubscribe function. */
export function onDbChange(listener: DbChangeListener): () => void {
  dbChangeListeners.push(listener);
  return () => {
    const idx = dbChangeListeners.indexOf(listener);
    if (idx >= 0) dbChangeListeners.splice(idx, 1);
  };
}

function notifyDbChange(): void {
  // Copy the array in case a listener unsubscribes itself while running.
  dbChangeListeners.slice().forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('[fake-backend] dbChange listener threw', e);
    }
  });
}

// ---------------------------------------------------------------
// Storage access
// ---------------------------------------------------------------

let memoryDb: FakeDatabase | null = null;

function readFromStorage(): FakeDatabase | null {
  try {
    const raw = localStorage.getItem(FAKE_DB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FakeDatabase;
    if (!parsed || parsed._seedVersion !== SEED_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(db: FakeDatabase): void {
  try {
    localStorage.setItem(FAKE_DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('[fake-backend] Could not persist fake database to localStorage', e);
  }
}

/** Removes every persisted IoT simulation snapshot (per-vehicle sensor history). */
function clearIotSimulationStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(IOT_SIM_STORAGE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('[fake-backend] Could not clear IoT simulation storage', e);
  }
}

/** Returns the current fake database, seeding it on first use. */
export function getDb(): FakeDatabase {
  if (memoryDb) return memoryDb;

  const stored = readFromStorage();
  if (stored) {
    memoryDb = stored;
    return memoryDb;
  }

  const seeded = createSeedDatabase();
  memoryDb = seeded;
  writeToStorage(seeded);
  return memoryDb;
}

/** Persists the given database (or the in-memory one) to localStorage and notifies listeners. */
export function saveDb(db: FakeDatabase = getDb()): void {
  memoryDb = db;
  writeToStorage(db);
  notifyDbChange();
}

/** Wipes all fake data (including the live IoT simulation) and reseeds it from scratch. */
export function resetDb(): FakeDatabase {
  const seeded = createSeedDatabase();
  memoryDb = seeded;
  writeToStorage(seeded);
  clearIotSimulationStorage();
  notifyDbChange();
  return seeded;
}

// ---------------------------------------------------------------
// Small helpers shared by the interceptor / feature modules
// ---------------------------------------------------------------

export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

export function findUserById(db: FakeDatabase, userId: number): FakeUser | undefined {
  return db.users.find((u) => u.id === userId);
}

export function displayNameForUser(db: FakeDatabase, userId: number): string {
  const profile = db.profiles.find((p) => p.userId === userId);
  if (profile) return `${profile.firstName} ${profile.lastName}`.trim();
  const user = findUserById(db, userId);
  return user?.email ?? `Driver #${userId}`;
}
