/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, GatewayIntentBits } from 'discord.js';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const grantRole = catchAsync(async (req, res) => {
  const { userId, roleId, walletAddr } = req.body;
  const discordServerId = process.env.discordServerId;
  const TOKEN = process.env.botToken;

  // const client = new Client({
  //   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  // });

  // await client.login(botToken);
  // const guild = await client.guilds.fetch(discordServerId as string);
  // const member = await guild.members.fetch(data.userId);
  // const roles = member?.roles?.cache
  //   .filter(role => role.id !== discordServerId) // Exclude the @everyone role
  //   .map(role => role.name);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(TOKEN);

  client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  const guild = client.guilds.cache.get(discordServerId as string);
  const member = await guild?.members.fetch(userId);

  console.log({ member });

  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found in the guild');
  }

  const role = guild?.roles.cache.get(roleId);

  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found in the guild');
  }

  member.roles
    .add(role)
    .then(() => {
      sendResponse<any>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Role added successfully',
        // data: roles,
      });
    })
    .catch(error => {
      console.error(error);
      sendResponse<any>(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
      });
    });

  // if (roles.length < 1) {
  //   const role = await guild.roles.fetch(roleId as string);
  //   await member.roles.add(role as any);
  //   sendResponse<any>(res, {
  //     statusCode: httpStatus.OK,
  //     success: true,
  //     message: 'Added new role successfully',
  //   });
  // }
});

export const DiscordController = {
  grantRole,
};
