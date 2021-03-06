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
let user3 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":3});

describe('/users/:user_name/tweets DELETE "user delete tweet"', () => {
  it('should allow user to delete tweet if meeting all requirement', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets/1?_method=DELETE')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].msg.should.equal('delete tweet id : 1');
        done();
      });
  });

  it('should not allow user to delete tweet session does not match', (done) => {
    chai.request(server)
      .post('/users/Garfield/tweets/4?_method=DELETE')
      .set('cookie', [user3])
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('user not is not owner');
        done();
      });
  });

  it('should return err if user does not exist or not the owner of tweet', (done) => {
    chai.request(server)
      .post('/users/G/tweets/1?_method=DELETE')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet or user does not exist');
        done();
      });
  });

  it('should return err if tweet does not exist under this user', (done) => {
    chai.request(server)
      .post('/users/Trex/tweets/2?_method=DELETE')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('tweet or user does not exist');
        done();
      });
  });
});