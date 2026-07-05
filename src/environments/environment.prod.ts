export const environment = {
  production: true,
  // Fake local API: every request to this prefix is intercepted and resolved
  // in-browser by src/app/core/fake-backend/fake-backend.interceptor.ts.
  // No external backend / server is contacted.
  baseUrl: '/api/v1',
  iamPath: '/authentication',
  tripsEndpointPath: '/trips',
  deliveryOrdersEndpointPath: '/delivery-orders',
  alertsEndpointPath: '/alerts',
  profileEndpointPath: '/profiles',
  googleMapsApiKey: 'AIzaSyDEpu21mrXEAewZHnvMxOfR3Nj3VLZLECk',
} as const;
