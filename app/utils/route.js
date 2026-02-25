/**
 * Mock route helper for Inertia.js in Next.js
 * Maps route names to URLs
 */

const routes = {
  'dashboard': '/dashboard',
  'events.index': '/events',
  'events.show': '/events',
  'events.create': '/events/create',
  'events.edit': '/events',
  'login': '/login',
  'register': '/register',
  'logout': '/logout',
};

export function route(name, params = {}) {
  let url = routes[name] || `/${name}`;
  
  // Replace route parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
}

// Mock route object with current method
export const createRouteHelper = () => {
  const baseRoute = (name, params) => route(name, params);
  
  baseRoute.current = (name) => {
    // This would check the current route in a real Inertia app
    // For now, return false
    return false;
  };
  
  return baseRoute;
};
