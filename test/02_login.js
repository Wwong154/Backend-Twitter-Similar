require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const io = require('socket.io-client');
const socketURL = `http://localhost:${process.env.PORT}`;

chai.use(chaiHttp);
describe('/session POST "user login"', () => {
  it('should login if user exist', (done) => {
    chai.request(server)
      .post('/session')
      .type('form')
      .send({
        'name': 'Trex',
        'password': '123456',
      })
      .end((e, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.msg.should.equal('login');
        done();
      });
  });

  it('name should be case insensitive', (done) => {
    chai.request(server)
      .post('/session')
      .type('form')
      .send({
        'name': 'trEX',
        'password': '123456',
      })
      .end((e, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.msg.should.equal('login');
        done();
      });
  });

  it('should not login if user does not exist', (done) => {
    chai.request(server)
      .post('/session')
      .type('form')
      .send({
        'name': 'john',
        'password': '123',
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('invalid combination');
        done();
      });
  });

  it('should not login if user enter wrong password', (done) => {
    chai.request(server)
      .post('/session')
      .type('form')
      .send({
        'name': 'Trex',
        'password': '123',
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('invalid combination');
        done();
      });
  });

  it('should not login if name is empty', (done) => {
    chai.request(server)
      .post('/session')
      .type('form')
      .send({
        'password': '1234',
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in both field');
        done();
      });
  });
});