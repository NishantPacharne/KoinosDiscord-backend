// @ts-nocheck

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, GatewayIntentBits } from 'discord.js';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

import {
  Signer,
  Contract,
  Provider,
  Transaction,
  Serializer,
  utils,
} from "koilib";

const grantRole = catchAsync(async (req, res) => {

  let nftContract: Contract;
  let accounts;

  async function getContract() {
    if (nftContract) return nftContract;

    const provider = new Provider(["https://harbinger-api.koinos.io"]);
    // const userAddress = accounts[0].address;
    const nftContractAddress = "1PZMHh8PBkhE8WGNTTkeCorZdJBqVkibev"; // Replace with your NFT contract address
    nftContract = new Contract({
        id: nftContractAddress,
        provider
    });

    // get the abi of nftContract
    await nftContract.fetchAbi();

    nftContract.abi.methods.balance_of.entry_point = Number(nftContract.abi.methods.balance_of["entry-point"]);
    nftContract.abi.methods.balance_of.read_only = Number(nftContract.abi.methods.balance_of["read-only"]);

    return nftContract;
  }


  
  const { userId, roleId, walletAddr } = req.body;
  const discordServerId = process.env.discordServerId;
  const TOKEN = process.env.botToken;

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

  const contract = await getContract();
  console.log('get supply')
  const suppply = await contract.functions.balance_of({owner: walletAddr});
  
  if (suppply.result.value >= 1){
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
          message: `Role added successfullydddddddd`,
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
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Insufficient balance');
  }

  

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
