import express, { Router } from 'express';
import { DiscordController } from './discord.controller';
const router: Router = express.Router();

router.post('/grant-role', DiscordController.grantRole);

export const DiscordRoute = router;
