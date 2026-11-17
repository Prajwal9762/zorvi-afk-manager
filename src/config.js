'use strict';

require('dotenv').config();

function readInteger(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(name + ' must be an integer between ' + min + ' and ' + max + '.');
  }
  return value;
}

function readBoolean(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  if (/^(true|1|yes)$/i.test(raw.trim())) return true;
  if (/^(false|0|no)$/i.test(raw.trim())) return false;
  throw new Error(name + ' must be true or false.');
}

const auth = (process.env.MINECRAFT_AUTH || 'offline').trim().toLowerCase();
if (!['offline', 'microsoft'].includes(auth)) {
  throw new Error('MINECRAFT_AUTH must be offline or microsoft.');
}

const config = {
  host: (process.env.MINECRAFT_HOST || 'minechat.levyathan.ch').trim(),
  port: readInteger('MINECRAFT_PORT', 25565, { min: 1, max: 65535 }),
  username: (process.env.MINECRAFT_USERNAME || 'SAROJGMG').trim(),
  auth,
  password: process.env.MINECRAFT_PASSWORD || '',
  reconnectDelayMs: readInteger('RECONNECT_DELAY_SECONDS', 30, { min: 1 }) * 1000,
  sequenceEnabled: readBoolean('COMMAND_SEQUENCE_ENABLED', false),
  commandDelayMs: readInteger('COMMAND_DELAY_SECONDS', 5, { min: 0 }) * 1000,
  commands: (process.env.COMMANDS || '/go sur,/home fish,/afk')
    .split(',')
    .map((command) => command.trim())
    .filter(Boolean),
};

if (!config.host) throw new Error('MINECRAFT_HOST cannot be empty.');
if (!config.username) throw new Error('MINECRAFT_USERNAME cannot be empty.');
if (config.sequenceEnabled && !config.password) {
  throw new Error('Set MINECRAFT_PASSWORD to enable the command sequence.');
}
if (config.commands.some((command) => !command.startsWith('/'))) {
  throw new Error('Every item in COMMANDS must start with /.');
}

module.exports = Object.freeze(config);
