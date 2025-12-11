const MANA_REWARD = {
  DEFAULT: parseInt(getEnvVariable('CHECKIN_REWARD_DEFAULT'), 10),
  D7: parseInt(getEnvVariable('CHECKIN_REWARD_D7'), 100),
  D30: parseInt(getEnvVariable('CHECKIN_REWARD_D7'), 99999),
}


module.exports = {
  MANA_REWARD,
};