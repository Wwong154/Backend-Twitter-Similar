const { Pool } = require('pg');
const dbParams = require('./config')
const pool = new Pool(dbParams);

/*
take in 3 arg:
1st is the name of the user
2nd is if this is call for register purposes
3rd is userinfo use for regisration
*/
const checkUserExist = function(name, register = false, userInfo, chat = false, chatFrom) {

  return pool.query(`
  select id, password
  from users
  where Lower(name) = $1;`, [name])
  .then(res => {
    if(!register && !chat) { //if this is not for register or chat, return result either exist or not
      return res.rows
    } else if (chat && res.rows.length) {//if this is for chat, and user does exist
      return checkConversationExist({from: chatFrom,to: res.rows[0].id}, true)
    } else if (register && !res.rows.length) { //if for register, and user does not exist
      return userRegister(userInfo) //register user
    } else { //if user exist and is for register, or if user does
      return res.rows
    }
  });
}
exports.checkUserExist = checkUserExist;

const userRegister = function(userInfo) { //make new user, this function should not be export, unless all input field is validate by server/client side script
  return pool.query(`
  INSERT INTO users (name, password) VALUES ($1, $2)
  returning *;
  `, [userInfo.name, userInfo.password])
  .then(res => res.rows[0]);
}

const checkConversationExist = function(msg, getChat = false) { //check if the conversation between the 2 user exist in db
  if(msg.from == msg.to) {
    return [{err: 'same user'}]
  }
  let user = Math.min(Number(msg.from), Number(msg.to));
  let user2 = Math.max(Number(msg.from), Number(msg.to));
  return pool.query(`
  select id
  from conversations
  where user1_id = $1 and user2_id = $2;`, [user, user2])
  .then(res => {
    if(!res.rows.length && !getChat) {
      return makeNewConversation(user, user2 ,msg)//user with smaller id should always be user1, so it will be easier to check 
    } else if (getChat && res.rows.length) {
      return getChatLog(res.rows[0].id);
    } else if (!getChat) {
      return insertMsg(res.rows[0].id, msg.from, msg.to, msg.txt) //if exist, add msg and ref to that table
    } else {
      return [{msg: 'empty chat'}]
    }
  });
}
exports.checkConversationExist = checkConversationExist;

const makeNewConversation = function(user1, user2 ,msg) { //make new conversation
  return pool.query(`
  INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2)
  returning id;
  `, [user1, user2])
  .then(res => {
    insertMsg(res.rows[0].id, msg.from, msg.to, msg.txt)
  })//call insertMsg to add msg
}

const insertMsg = function(conversation, from, to, content) { //insert msg into db
  return pool.query(`
  INSERT INTO msgs (conversation_id,from_id,to_id,content,send_date)
  VALUES ($1, $2, $3, $4, now())
  returning *;
  `, [conversation, from, to, content])
  .then(res => res.rows[0]);
}

const userHaveUnreadMsg = function(userID) { //update user unread status in db, now I think about this. should chain it into insertMsg. if I have time
  return pool.query(`
  update users
  set unread_msg = TRUE
  where id = $1
  returning *;
  `, [userID])
  .then(res => res.rows[0]);
}
exports.userHaveUnreadMsg = userHaveUnreadMsg;

/*
get tweets for landing page, default is set for showcasing purpose
2 args
1st how many tweet you want to get
2nd how many this function is called, so it will not load dup tweet

Todo: should take 4th arg to check last recieve tweet, and use it as ref to get more tweet, to prevent db update between load.
*/
const getTweets = function(amount = 2, called = 0) {
  if (isNaN(amount) || isNaN(called)){ // just in case
    return new Error('only use number for function getTweets')
  }
  return pool.query(`
  select * 
  from tweets
  order by tweet_date desc
  limit $1
  offset $2;
  `, [amount, amount * called])
  .then(res => res.rows)//call insertMsg to add msg
}
exports.getTweets = getTweets;

const getTweetsByID = function(amount = 2, called = 0, id) {
  if (isNaN(amount) || isNaN(called)){ // just in case
    return new Error('only use number for function getTweets')
  }
  return pool.query(`
  select * 
  from tweets
  where user_id = $1
  order by tweet_date desc
  limit $2
  offset $3;
  `, [id, amount, amount * called])
  .then(res => res.rows)//call insertMsg to add msg
}
exports.getTweetsByID = getTweetsByID;

const checkOwnershipOfTweet = function(userName, tweetID) {
  return pool.query(`
  select u.id as user_id, t.content 
  from tweets t
  join users u on t.user_id = u.id
  where Lower(u.name) = $1 and t.id = $2;
  `, [userName, tweetID])
  .then(res => res.rows)//return whatever is found
}
exports.checkOwnershipOfTweet = checkOwnershipOfTweet;

const postTweet = function(userID, tweet) {
  return pool.query(`
  insert into tweets (user_id, content, tweet_date) 
  values ($1,$2,now())
  returning *;
  `, [userID, tweet])
  .then(res => res.rows)
}
exports.postTweet = postTweet;

const deleteTweet = function(id) {
  return pool.query(`
  delete from tweets
  where id = $1
  returning id;
  `, [id])
  .then(res => res.rows[0])
}
exports.deleteTweet = deleteTweet;

const updateTweet = function(id, content) {
  return pool.query(`
  update tweets
  set content = $1, last_update_date = now()
  where id = $2
  returning *;
  `, [content, id])
  .then(res => res.rows[0])
}
exports.updateTweet = updateTweet;

const getChatLog = function (conID) {
  return pool.query(`
  select c.id as con_id,m.from_id, m.to_id, m.content, m.send_date
  from conversations c
  join msgs m on c.id = m.conversation_id
  where c.id = $1
  order by m.send_date desc;
  `, [conID])
  .then(res => res.rows)
}