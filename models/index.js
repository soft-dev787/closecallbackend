const dbConfig = require("../config/db.config.js");
const SQLite = require("sqlite3");
const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  mode: SQLite.OPEN_READWRITE,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Email = require("./Email.js")(sequelize, Sequelize);

module.exports = db;
