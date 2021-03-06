require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const mockSession = require('mock-session');

chai.use(chaiHttp);

let user1 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":1});
let user2 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":2});
let user3 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":3});

describe('/users/:user_name/tweets PUT "user update tweet"', () => {
  it('should allow user to update tweet if meeting all requirement', (done) => {
    chai.request(server)
      .post('/users/Garfield/tweets/4?_method=PUT')
      .set('cookie', [user2])
      .type('form')
      .send({
        'tweet': 'updated! Dinner'
      })
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].msg.should.equal('update tweet id : 4\nwith : updated! Dinner');
        done();
      });
  });

  it('should not allow user to update if updated tweet is empty', (done) => {
    chai.request(server)
      .post('/users/Garfield/tweets/4?_method=PUT')
      .set('cookie', [user2])
      .type('form')
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet can not be empty');
        done();
      });
  });

  it('should not allow user to PUT tweet session does not match', (done) => {
    chai.request(server)
      .post('/users/Garfield/tweets/4?_method=PUT')
      .set('cookie', [user3])
      .type('form')
      .send({
        'tweet': 'updated! Dinner'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('user not is not owner');
        done();
      });
  });

  it('should return err if user does not exist or not the owner of tweet', (done) => {
    chai.request(server)
      .post('/users/G/tweets/1?_method=PUT')
      .set('cookie', [user1])
      .type('form')
      .send({
        'tweet': 'updated! Dinner'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet or user does not exist');
        done();
      });
  });

  it('should return err if tweet does not exist under this user', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets/2?_method=PUT')
      .set('cookie', [user1])
      .type('form')
      .send({
        'tweet': 'updated! Dinner'
      })
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet or user does not exist');
        done();
      });
  });
});