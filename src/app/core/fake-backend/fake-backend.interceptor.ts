/**
 * FAKE BACKEND INTERCEPTOR
 * ------------------------------------------------------------------
 * Intercepts every HttpClient request aimed at `environment.baseUrl`
 * and resolves it locally against the fake database (fake-db.ts),
 * instead of reaching out to any external server.
 *
 * This is what allows the whole application to run as a standalone,
 * front-end-only demo: no external API, no local json-server process,
 * nothing to deploy besides the Angular app itself.
 *
 * How it works:
 *  1. Every request whose URL starts with `environment.baseUrl` is
 *     caught here and never reaches the network.
 *  2. `handleRequest()` pattern-matches `METHOD + path` against a long
 *     list of routes that mirror the real API surface used by every
 *     `*-api.ts` file in the project.
 *  3. Successful matches resolve as an `HttpResponse`; failures throw
 *     a `FakeApiError`, translated into an `HttpErrorResponse` so the
 *     app's existing error-handling code keeps working unmodified.
 *  4. A small artificial delay is added so loading spinners/skeletons
 *     remain visible, just like with a real network call.
 */

import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FakeDatabase,
  FakeDeliveryOrder,
  FakeTrip,
  displayNameForUser,
  getDb,
  nextId,
  nowIso,
  saveDb,
} from './fake-db';

class FakeApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(typeof body === 'string' ? body : JSON.stringify(body));
  }
}

interface FakeResult {
  status: number;
  body: unknown;
}

function ok(body: unknown, status = 200): FakeResult {
  return { status, body };
}

// ---------------------------------------------------------------
// Fake JWT (header.payload.signature, unsigned) — enough for
// `jwt-decode` (used by TokenRepository) to read the payload back.
// ---------------------------------------------------------------

function base64UrlEncode(value: unknown): string {
  const json = JSON.stringify(value);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  const fullPayload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    ...payload,
  };
  return `${base64UrlEncode(header)}.${base64UrlEncode(fullPayload)}.${base64UrlEncode({ fake: true }).slice(0, 16)}`;
}

// ---------------------------------------------------------------
// Composition helpers
// ---------------------------------------------------------------

function composeTripResource(db: FakeDatabase, trip: FakeTrip) {
  const originPoint = db.originPoints.find((o) => o.id === trip.originPointId) ?? db.originPoints[0] ?? null;
  const deliveryOrders = db.deliveryOrders.filter((d) => d.tripId === trip.id);

  return {
    id: trip.id,
    statusId: 0,
    driverId: trip.driverId,
    driverName: trip.driverName,
    deviceId: trip.deviceId,
    vehicleId: trip.vehicleId,
    departureAt: trip.departureAt,
    merchantId: trip.merchantId,
    originPoint,
    deliveryOrders,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt,
    status: trip.status,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

// ---------------------------------------------------------------
// Route matching
// ---------------------------------------------------------------

function match(pattern: RegExp, pathname: string): RegExpExecArray | null {
  return pattern.exec(pathname);
}

function handleRequest(method: string, pathname: string, query: URLSearchParams, req: HttpRequest<unknown>): FakeResult {
  const db = getDb();
  const body = (req.body ?? {}) as any;
  let m: RegExpExecArray | null;

  // ---------------- AUTHENTICATION ----------------
  if (method === 'POST' && pathname === '/authentication/sign-in') {
    const { email, password } = body as { email: string; password: string };
    const user = db.users.find(
      (u) => u.email.toLowerCase() === String(email ?? '').toLowerCase() && u.password === password
    );
    if (!user) throw new FakeApiError(401, { message: 'Invalid credentials' });

    const accessToken = createFakeJwt({
      uid: user.id,
      sub: String(user.id),
      email: user.email,
      roles: user.roles,
    });
    const refreshToken = `refresh-${Math.random().toString(36).slice(2)}`;
    return ok({ accessToken, refreshToken });
  }

  if (method === 'POST' && pathname === '/authentication/sign-up') {
    const { email, password, roles, profile } = body as {
      email: string;
      password: string;
      roles?: string[];
      profile?: { firstName: string; lastName: string };
    };
    if (!email || !password) throw new FakeApiError(400, { message: 'Email and password are required' });
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new FakeApiError(409, { message: 'This email is already registered' });
    }

    const newUser = { id: nextId(db.users), email, password, roles: roles?.length ? roles : ['CLIENT'] };
    db.users.push(newUser);
    db.profiles.push({
      id: nextId(db.profiles),
      userId: newUser.id,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phoneNumber: null,
      documentType: null,
      document: null,
      birthDate: null,
    });
    saveDb(db);
    return ok({}, 201);
  }

  if (method === 'POST' && pathname === '/authentication/logout') {
    return ok({});
  }

  // ---------------- USERS ----------------
  if (method === 'GET' && (m = match(/^\/users\/(\d+)$/, pathname))) {
    const user = db.users.find((u) => u.id === Number(m![1]));
    if (!user) throw new FakeApiError(404, { message: 'User not found' });
    return ok({ id: user.id, username: user.email, roles: user.roles });
  }

  // ---------------- PROFILES ----------------
  if (method === 'GET' && (m = match(/^\/profiles\/user\/(\d+)$/, pathname))) {
    const profile = db.profiles.find((p) => p.userId === Number(m![1]));
    if (!profile) throw new FakeApiError(404, { message: 'Profile not found' });
    return ok(profile);
  }

  if (method === 'PUT' && (m = match(/^\/profiles\/(\d+)$/, pathname))) {
    const id = Number(m![1]);
    const idx = db.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new FakeApiError(404, { message: 'Profile not found' });
    db.profiles[idx] = { ...db.profiles[idx], ...body };
    saveDb(db);
    return ok(db.profiles[idx]);
  }

  // ---------------- TRIPS ----------------
  if (method === 'POST' && (m = match(/^\/trips\/(\d+)\/start$/, pathname))) {
    const trip = db.trips.find((t) => t.id === Number(m![1]));
    if (!trip) throw new FakeApiError(404, { message: 'Trip not found' });
    trip.status = 'IN_PROGRESS';
    trip.startedAt = nowIso();
    trip.updatedAt = nowIso();
    saveDb(db);
    return ok(composeTripResource(db, trip));
  }

  if (method === 'GET' && (m = match(/^\/trips\/(\d+)$/, pathname))) {
    const trip = db.trips.find((t) => t.id === Number(m![1]));
    if (!trip) throw new FakeApiError(404, { message: 'Trip not found' });
    return ok(composeTripResource(db, trip));
  }

  if (method === 'GET' && pathname === '/trips') {
    return ok(db.trips.map((t) => composeTripResource(db, t)));
  }

  if (method === 'POST' && pathname === '/trips') {
    const { driverId, deviceId, vehicleId, merchantId, originPointId, deliveryOrders } = body as {
      driverId: number;
      deviceId: number;
      vehicleId: number;
      merchantId: number;
      originPointId: number;
      deliveryOrders: Array<Partial<FakeDeliveryOrder> & { clientEmail: string; address: string; latitude: number; longitude: number; sequenceOrder: number }>;
    };

    const trip: FakeTrip = {
      id: nextId(db.trips),
      driverId,
      driverName: displayNameForUser(db, driverId),
      deviceId,
      vehicleId,
      merchantId,
      originPointId,
      departureAt: null,
      startedAt: null,
      completedAt: null,
      status: 'CREATED',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.trips.push(trip);

    (deliveryOrders ?? []).forEach((order) => {
      db.deliveryOrders.push({
        id: nextId(db.deliveryOrders),
        tripId: trip.id,
        clientEmail: order.clientEmail,
        address: order.address,
        latitude: order.latitude,
        longitude: order.longitude,
        sequenceOrder: order.sequenceOrder,
        maxHumidity: order.maxHumidity ?? null,
        minHumidity: order.minHumidity ?? null,
        maxTemperature: order.maxTemperature ?? null,
        minTemperature: order.minTemperature ?? null,
        maxVibration: order.maxVibration ?? null,
        arrivalAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        status: 'PENDING',
      });
    });

    saveDb(db);
    return ok(composeTripResource(db, trip), 201);
  }

  // ---------------- DELIVERY ORDERS ----------------
  if (method === 'POST' && (m = match(/^\/delivery-orders\/(\d+)\/delivery$/, pathname))) {
    const order = db.deliveryOrders.find((d) => d.id === Number(m![1]));
    if (!order) throw new FakeApiError(404, { message: 'Delivery order not found' });
    order.status = 'DELIVERED';
    order.arrivalAt = nowIso();
    order.updatedAt = nowIso();
    saveDb(db);
    return ok(order);
  }

  if (method === 'GET' && pathname === '/delivery-orders') {
    return ok(db.deliveryOrders);
  }

  // ---------------- ORIGIN POINTS ----------------
  if (method === 'GET' && pathname === '/origin-points') {
    const tripId = query.get('tripId');
    if (tripId) {
      const trip = db.trips.find((t) => String(t.id) === tripId);
      const point = trip ? db.originPoints.find((o) => o.id === trip.originPointId) : undefined;
      return ok(point ? [point] : []);
    }
    return ok(db.originPoints);
  }

  // ---------------- TRIP PARAMETERS ----------------
  if (method === 'GET' && pathname === '/trip_parameters') {
    const tripId = query.get('tripId');
    if (tripId) {
      return ok(db.tripParameters.filter((p) => String(p.tripId) === tripId));
    }
    return ok(db.tripParameters);
  }

  // ---------------- FLEET: VEHICLES ----------------
  if (method === 'GET' && (m = match(/^\/fleet\/vehicles\/by-type\/([^/]+)$/, pathname))) {
    const type = decodeURIComponent(m[1]).toUpperCase();
    return ok(db.vehicles.filter((v) => v.type.toUpperCase() === type));
  }

  if (method === 'GET' && (m = match(/^\/fleet\/vehicles\/by-status\/([^/]+)$/, pathname))) {
    const status = decodeURIComponent(m[1]).toUpperCase();
    return ok(db.vehicles.filter((v) => v.status.toUpperCase() === status));
  }

  if (method === 'GET' && (m = match(/^\/fleet\/vehicles\/by-plate\/([^/]+)$/, pathname))) {
    const plate = decodeURIComponent(m[1]).toUpperCase();
    const vehicle = db.vehicles.find((v) => v.plate.toUpperCase() === plate);
    if (!vehicle) throw new FakeApiError(404, { message: 'Vehicle not found' });
    return ok(vehicle);
  }

  if (method === 'POST' && (m = match(/^\/fleet\/vehicles\/(\d+)\/assign-device\/([^/]+)$/, pathname))) {
    const vehicle = db.vehicles.find((v) => v.id === Number(m![1]));
    if (!vehicle) throw new FakeApiError(404, { message: 'Vehicle not found' });
    const imei = decodeURIComponent(m[2]);
    if (!vehicle.deviceImeis.includes(imei)) vehicle.deviceImeis.push(imei);
    const device = db.devices.find((d) => d.imei === imei);
    if (device) device.vehiclePlate = vehicle.plate;
    saveDb(db);
    return ok(vehicle);
  }

  if (method === 'POST' && (m = match(/^\/fleet\/vehicles\/(\d+)\/unassign-device\/([^/]+)$/, pathname))) {
    const vehicle = db.vehicles.find((v) => v.id === Number(m![1]));
    if (!vehicle) throw new FakeApiError(404, { message: 'Vehicle not found' });
    const imei = decodeURIComponent(m[2]);
    vehicle.deviceImeis = vehicle.deviceImeis.filter((i) => i !== imei);
    const device = db.devices.find((d) => d.imei === imei);
    if (device && device.vehiclePlate === vehicle.plate) device.vehiclePlate = null;
    saveDb(db);
    return ok({});
  }

  if (method === 'PATCH' && (m = match(/^\/fleet\/vehicles\/(\d+)\/status$/, pathname))) {
    const vehicle = db.vehicles.find((v) => v.id === Number(m![1]));
    if (!vehicle) throw new FakeApiError(404, { message: 'Vehicle not found' });
    vehicle.status = (body as { status: string }).status;
    saveDb(db);
    return ok(vehicle);
  }

  if (method === 'GET' && (m = match(/^\/fleet\/vehicles\/(\d+)$/, pathname))) {
    const vehicle = db.vehicles.find((v) => v.id === Number(m![1]));
    if (!vehicle) throw new FakeApiError(404, { message: 'Vehicle not found' });
    return ok(vehicle);
  }

  if (method === 'PUT' && (m = match(/^\/fleet\/vehicles\/(\d+)$/, pathname))) {
    const id = Number(m![1]);
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new FakeApiError(404, { message: 'Vehicle not found' });
    db.vehicles[idx] = { ...db.vehicles[idx], ...body, id };
    saveDb(db);
    return ok(db.vehicles[idx]);
  }

  if (method === 'DELETE' && (m = match(/^\/fleet\/vehicles\/(\d+)$/, pathname))) {
    const id = Number(m![1]);
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    saveDb(db);
    return ok({});
  }

  if (method === 'GET' && pathname === '/fleet/vehicles') {
    return ok(db.vehicles);
  }

  if (method === 'POST' && pathname === '/fleet/vehicles') {
    const created = { ...(body as object), id: nextId(db.vehicles) } as (typeof db.vehicles)[number];
    created.deviceImeis = created.deviceImeis ?? [];
    created.capabilities = created.capabilities ?? [];
    db.vehicles.push(created);
    (created.deviceImeis ?? []).forEach((imei) => {
      const device = db.devices.find((d) => d.imei === imei);
      if (device) device.vehiclePlate = created.plate;
    });
    saveDb(db);
    return ok(created, 201);
  }

  // ---------------- FLEET: DEVICES ----------------
  if (method === 'GET' && (m = match(/^\/fleet\/devices\/by-online\/([^/]+)$/, pathname))) {
    const online = decodeURIComponent(m[1]) === 'true';
    return ok(db.devices.filter((d) => d.online === online));
  }

  if (method === 'GET' && (m = match(/^\/fleet\/devices\/by-imei\/([^/]+)$/, pathname))) {
    const imei = decodeURIComponent(m[1]);
    const device = db.devices.find((d) => d.imei === imei);
    if (!device) throw new FakeApiError(404, { message: 'Device not found' });
    return ok(device);
  }

  if (method === 'POST' && (m = match(/^\/fleet\/devices\/(\d+)\/firmware$/, pathname))) {
    const device = db.devices.find((d) => d.id === Number(m![1]));
    if (!device) throw new FakeApiError(404, { message: 'Device not found' });
    device.firmware = query.get('firmware') ?? device.firmware;
    saveDb(db);
    return ok(device);
  }

  if (method === 'PATCH' && (m = match(/^\/fleet\/devices\/(\d+)\/online$/, pathname))) {
    const device = db.devices.find((d) => d.id === Number(m![1]));
    if (!device) throw new FakeApiError(404, { message: 'Device not found' });
    device.online = (body as { online: boolean }).online;
    saveDb(db);
    return ok(device);
  }

  if (method === 'GET' && (m = match(/^\/fleet\/devices\/(\d+)$/, pathname))) {
    const device = db.devices.find((d) => d.id === Number(m![1]));
    if (!device) throw new FakeApiError(404, { message: 'Device not found' });
    return ok(device);
  }

  if (method === 'PUT' && (m = match(/^\/fleet\/devices\/(\d+)$/, pathname))) {
    const id = Number(m![1]);
    const idx = db.devices.findIndex((d) => d.id === id);
    if (idx === -1) throw new FakeApiError(404, { message: 'Device not found' });
    db.devices[idx] = { ...db.devices[idx], ...body, id };
    saveDb(db);
    return ok(db.devices[idx]);
  }

  if (method === 'DELETE' && (m = match(/^\/fleet\/devices\/(\d+)$/, pathname))) {
    const id = Number(m![1]);
    db.devices = db.devices.filter((d) => d.id !== id);
    saveDb(db);
    return ok({});
  }

  if (method === 'GET' && pathname === '/fleet/devices') {
    return ok(db.devices);
  }

  if (method === 'POST' && pathname === '/fleet/devices') {
    const created = { ...(body as object), id: nextId(db.devices) } as (typeof db.devices)[number];
    db.devices.push(created);
    saveDb(db);
    return ok(created, 201);
  }

  // ---------------- ALERTS ----------------
  if (method === 'PATCH' && (m = match(/^\/alerts\/(\d+)\/acknowledgment$/, pathname))) {
    const alert = db.alerts.find((a) => a.id === Number(m![1]));
    if (!alert) throw new FakeApiError(404, { message: 'Alert not found' });
    alert.alertStatus = 'ACKNOWLEDGED';
    saveDb(db);
    return ok(alert);
  }

  if (method === 'PATCH' && (m = match(/^\/alerts\/(\d+)\/closure$/, pathname))) {
    const alert = db.alerts.find((a) => a.id === Number(m![1]));
    if (!alert) throw new FakeApiError(404, { message: 'Alert not found' });
    alert.alertStatus = 'CLOSED';
    alert.closedAt = nowIso();
    saveDb(db);
    return ok(alert);
  }

  if (method === 'GET' && pathname === '/alerts') {
    return ok(db.alerts);
  }

  // ---------------- DASHBOARD ANALYTICS ----------------
  if (method === 'GET' && (m = match(/^\/analytics\/trips\/([^/]+)$/, pathname))) {
    const trip = db.analyticsTrips.find((t) => String(t.id) === m![1]);
    if (!trip) throw new FakeApiError(404, { message: 'Trip not found' });
    return ok(trip);
  }

  if (method === 'GET' && pathname === '/analytics/trips') {
    return ok(db.analyticsTrips);
  }

  if (method === 'GET' && pathname === '/analytics/alerts') {
    const tripId = query.get('tripId');
    if (tripId) return ok(db.analyticsAlerts.filter((a) => a.tripId === tripId));
    return ok(db.analyticsAlerts);
  }

  if (method === 'GET' && pathname === '/analytics/incidents-by-month') {
    return ok(db.incidentsByMonth);
  }

  // ---------------- BILLING: PLANS / SUBSCRIPTIONS / PAYMENTS ----------------
  if (method === 'GET' && pathname === '/plans') {
    return ok(db.plans);
  }

  if (method === 'GET' && (m = match(/^\/subscription\/user-id\/(\d+)$/, pathname))) {
    const subscription = db.subscriptions.find((s) => s.userId === Number(m![1]));
    if (!subscription) throw new FakeApiError(404, { message: 'No subscription for this user' });
    return ok(subscription);
  }

  if (method === 'PUT' && (m = match(/^\/subscription\/(\d+)\/plan$/, pathname))) {
    const subscription = db.subscriptions.find((s) => s.id === Number(m![1]));
    if (!subscription) throw new FakeApiError(404, { message: 'Subscription not found' });
    const newPlanId = Number((body as { newPlanId: number }).newPlanId);
    const plan = db.plans.find((p) => p.id === newPlanId);
    if (!plan) throw new FakeApiError(400, { message: 'Plan not found' });
    subscription.plan = plan;
    subscription.status = 'ACTIVE';
    saveDb(db);
    return ok(subscription);
  }

  if (method === 'DELETE' && (m = match(/^\/subscription\/(\d+)$/, pathname))) {
    const subscription = db.subscriptions.find((s) => s.id === Number(m![1]));
    if (!subscription) throw new FakeApiError(404, { message: 'Subscription not found' });
    subscription.status = 'CANCELED';
    saveDb(db);
    return ok({});
  }

  if (method === 'GET' && (m = match(/^\/payments\/user-id\/(\d+)$/, pathname))) {
    return ok(db.payments.filter((p) => p.userId === Number(m![1])));
  }

  throw new FakeApiError(404, { message: `No fake route matches ${method} ${pathname}` });
}

// ---------------------------------------------------------------
// Interceptor
// ---------------------------------------------------------------

export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const base = environment.baseUrl;
  if (!req.url.startsWith(base)) {
    return next(req);
  }

  const remainder = req.url.slice(base.length);
  const [pathname, queryString] = remainder.split('?');
  const query = new URLSearchParams(queryString ?? '');

  // Small, randomized latency so loading states remain visible, just like a real API.
  const latency = 200 + Math.floor(Math.random() * 250);

  try {
    const { status, body } = handleRequest(req.method, pathname, query, req);
    return of(new HttpResponse({ status, body: body as object })).pipe(delay(latency)) as Observable<any>;
  } catch (e) {
    const fakeError = e instanceof FakeApiError ? e : new FakeApiError(500, { message: String(e) });
    return throwError(
      () =>
        new HttpErrorResponse({
          status: fakeError.status,
          error: fakeError.body,
          url: req.url,
          statusText: 'Fake Backend Error',
        })
    ).pipe(delay(latency)) as Observable<any>;
  }
};
