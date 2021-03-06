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
describe('/chats/:user_name POST "user send msg"', () => {
  it('should not allow user to send msg if nopt login', (done) => {
    chai.request(server)
      .post('/chats/Garfield')
      .end((e, res) => {
        res.should.have.status(403);
        res.body[0].err.should.equal('Please login');
        done();
      });
  });

  it('should allow user to process if login', (done) => {
    chai.request(server)
      .post('/chats/Garfield')
      .set('cookie', [user1])
      .end((e, res) => {
        res.should.have.status(200);
        res.body[0].login.should.equal(true);
        done();
      });
  });
});