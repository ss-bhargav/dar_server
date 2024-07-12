const { Client } = require("pg");

class DataBase {

  /////////////////////////////////// FOR DEVELOPMENT 
  // static URL = "postgres://postgres:postgres@localhost:5432/DARIS"
  // static DB = new Client({connectionString: DataBase.URL});


  ///////////////////////////////////// FOR DEPLOYMENT
  static db_URL = process.env.DATABASE_URL || "postgres://wutsrfmrgeovnx:078d1b1d82f0be0fa6ed90307df17a491930b89eac9f1ef99770023796ee1a2d@ec2-54-157-100-65.compute-1.amazonaws.com:5432/d1hl025dilramn";
  static DB = new Client({ connectionString: DataBase.db_URL,ssl:{rejectUnauthorized:false} });

  static Connect() {
    DataBase.DB.connect();
  }
}

module.exports = DataBase;