import express from 'express';
import { DiscordRoute } from '../modules/discord/discord.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/discord',
    route: DiscordRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
