import { setupServer } from 'msw/node';

/** Serveur MSW des tests : chaque test déclare ses réponses avec `server.use(...)`. */
export const server = setupServer();
