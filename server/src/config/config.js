require('dotenv').config();

const getEnvVar = (name, defaultValue) => {
  const value = process.env[name];
  return value !== undefined ? value : defaultValue;
};

module.exports = {
  PORT: getEnvVar("PORT", 8000),
  DB: {
    host: getEnvVar("DB_HOST"),
    user: getEnvVar("DB_USER"),
    password: getEnvVar("DB_PASSWORD"),
    database: getEnvVar("DB_NAME"),
    port: Number(getEnvVar("DB_PORT", 5432)),
  },
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  REDIS: {
    url: getEnvVar("REDIS_URL"),
    host: getEnvVar("REDIS_HOST", "127.0.0.1"),
    port: Number(getEnvVar("REDIS_PORT", 6379)),
    password: getEnvVar("REDIS_PASSWORD"),
  },
};
