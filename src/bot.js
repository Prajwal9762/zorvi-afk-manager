'use strict';

const mineflayer = require('mineflayer');
const config = require('./config');
const logger = require('./logger');

let bot = null;
let reconnectTimer = null;
let commandTimer = null;
let shuttingDown = false;

function clearCommandTimer() {
  if (commandTimer) {
    clearTimeout(commandTimer);
    commandTimer = null;
  }
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;

  logger.info('Disconnected. Reconnecting...');
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, config.reconnectDelayMs);
}

function beginCommandSequence(connection) {
  const sequence = [`/login ${config.password}`, ...config.commands];
  let index = 0;

  const sendNext = () => {
    if (shuttingDown || bot !== connection || !connection.player) return;

    if (index >= sequence.length) {
      logger.info('AFK session active.');
      return;
    }

    // Do not log the command; the first command contains the server password.
    connection.chat(sequence[index]);
    index += 1;
    commandTimer = setTimeout(sendNext, config.commandDelayMs);
  };

  sendNext();
}

function connect() {
  if (shuttingDown || bot) return;

  logger.info('Connecting to server...');
  let connection;

  try {
    connection = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      auth: config.auth,
    });
    bot = connection;
  } catch {
    logger.error('Could not create the Minecraft connection.');
    scheduleReconnect();
    return;
  }

  let spawned = false;

  connection.once('spawn', () => {
    if (bot !== connection || shuttingDown) return;
    spawned = true;
    logger.info('Connected successfully.');
    logger.info('Authentication completed.');

    if (config.sequenceEnabled) {
      beginCommandSequence(connection);
    } else {
      logger.info('AFK session active.');
    }
  });

  connection.on('error', () => {
    // Intentionally omit error details; library/server messages may contain credentials.
    logger.error('Connection error.');
  });

  connection.once('end', () => {
    if (bot !== connection) return;
    bot = null;
    clearCommandTimer();
    if (spawned || !shuttingDown) scheduleReconnect();
  });
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  clearCommandTimer();
  logger.info(`Shutting down (${signal}).`);

  if (bot) {
    const activeBot = bot;
    bot = null;
    activeBot.quit('AFK Manager shutting down');
  }
}

logger.info('Starting AFK Manager...');
if (config.sequenceEnabled) {
  logger.info('Command sequence enabled; use only when permitted by server rules.');
} else {
  logger.info('Command sequence disabled.');
}
connect();

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', () => {
  logger.error('Unexpected application error.');
  shutdown('uncaught exception');
  process.exitCode = 1;
});

process.on('unhandledRejection', () => {
  logger.error('Unexpected asynchronous error.');
  shutdown('unhandled rejection');
  process.exitCode = 1;
});
