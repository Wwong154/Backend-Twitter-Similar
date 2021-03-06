require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const mockSession = require('mock-session');

chai.use(chaiHttp);

let user3 = mockSession('session', `${process.env.SESSIONKEY}`, {"user_ID":3});  

describe('/session DELETE "user logout"', () => {
  it('should always allow user to logout ', (done) => {
    chai.request(server)
      .post('/session?_method=DELETE')
      .set('cookie', [user3])
      .end((e, res) => {
        res.should.have.status(200);
        done();
      });
  });
});