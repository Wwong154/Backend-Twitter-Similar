const { Pool } = require('pg');
const dbParams = require('./config')
const pool = new Pool(dbParams);

const checkUserExist = function(name) {
  return pool.query(`
  select *
  from users
  where name = $1;`, [name])
  .then(res => res.rows);
}
exports.checkUserExist = checkUserExist;

/*
const userNew = function(newUser) { //make new user
  return pool.query(`
  INSERT INTO users (name, email, password, gaming_name, is_online) VALUES ($1, $2, $3, $4, true)
  returning *;
  `, [newUser.full_name, newUser.email, newUser.password, newUser.name])
  .then(res => res.rows[0]);
}
exports.userNew = userNew;
*/