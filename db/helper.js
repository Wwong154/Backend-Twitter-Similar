const { Pool } = require('pg');
const dbParams = require('./config')
const pool = new Pool(dbParams);

const checkUserExist = function(name, register = false, userInfo) {
  return pool.query(`
  select id, password
  from users
  where Lower(name) = $1;`, [name])
  .then(res => {
    if(!register) {
      return res.rows
    } else if (register && !res.rows.length){
      return userRegister(userInfo)
    } else {
      return res.rows
    }
  });
}
exports.checkUserExist = checkUserExist;

const userRegister = function(userInfo) { //make new user
  return pool.query(`
  INSERT INTO users (name, password) VALUES ($1, $2)
  returning *;
  `, [userInfo.name, userInfo.password])
  .then(res => res.rows[0]);
}

const testRemove = function() {
  return pool.query(`
  select max(id) as id
  from users;
  `)
  .then(res => {
    removeLastForTesting(res.rows[0].id)
  })
}
exports.testRemove = testRemove;

const removeLastForTesting = function(id) {
  return pool.query(`
  delete from users
  where id = $1
  returning *;`, [id])
  .then(result => result)
}