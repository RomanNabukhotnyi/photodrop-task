import TelegramBot from 'node-telegram-bot-api';
import { DynamoDBStreamEvent } from 'aws-lambda';

const sendMessage = async (event: DynamoDBStreamEvent) => {
    const number = event.Records[0].dynamodb.Keys.number.S;
    const bot = await new TelegramBot(process.env.TOKEN, { polling: true } );
    await bot.sendMessage(process.env.CHAT_ID, `Photodrop\n${number}\nYour photos have dropped.`);
};

export const main = sendMessage;