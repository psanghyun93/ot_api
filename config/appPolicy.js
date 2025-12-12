const {getEnvVariable} = require("../utils/utils");

const MANA_REWARD = {
  DEFAULT: parseInt(getEnvVariable('CHECKIN_REWARD_DEFAULT'), 10),
  D7: parseInt(getEnvVariable('CHECKIN_REWARD_D7'), 100),
  D30: parseInt(getEnvVariable('CHECKIN_REWARD_D30'), 200),
}

// 최대 마나 관련 enum
const MAX_MANA = {
  BRONZE : parseInt(getEnvVariable('MAX_MANA_BRONZE'), 10),
  SILVER : parseInt(getEnvVariable('MAX_MANA_SILVER'), 10),
  GOLD : parseInt(getEnvVariable('MAX_MANA_GOLD'), 10),
  PLATINUM : parseInt(getEnvVariable('MAX_MANA_PLATINUM'), 10),
  DIAMOND : parseInt(getEnvVariable('MAX_MANA_DIAMOND'), 10),
}

module.exports = {
  MANA_REWARD,
  MAX_MANA,
};