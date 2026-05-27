export const environment = {
  production: false,
  baseUrl: 'https://cargasafe-apigateway-microservice-production.up.railway.app/api/v1',
  iamPath: '/authentication',
  tripsEndpointPath: '/trips',
  deliveryOrdersEndpointPath: '/delivery-orders',
  alertsEndpointPath: '/alerts',
  profileEndpointPath: '/profiles',
  googleMapsApiKey: 'AIzaSyDEpu21mrXEAewZHnvMxOfR3Nj3VLZLECk',
} as const;
