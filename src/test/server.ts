import { setupServer } from 'msw/node';

/** MSW server for unit tests. Each test adds the handlers it needs with `server.use(...)`. */
export const server = setupServer();
