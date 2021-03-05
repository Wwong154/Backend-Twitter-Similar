const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);
describe('/users POST "register"', () => {
  it('user register when all info is enter and is correct', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'Jonathan Q. Arbuckle',
        'password': '123',
        'password_confirm': '123'
      })
      .end((e, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.msg.should.equal('registered');
        done();
      });
  });

  it('should not register if passwrod does not match', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'john',
        'password': '1234',
        'password_confirm': '123'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('password does not match');
        done();
      });
  });

  it('should not register if no name is enter', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'password': '123',
        'password_confirm': '123'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in all field');
        done();
      });
  });

  it('should not register if no password is enter', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'john',
        'password_confirm': '123'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in all field');
        done();
      });
  });

  it('should not register if no password confirm is enter', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'john',
        'password': '123'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in all field');
        done();
      });
  });

  it('should not register if user name only contain space', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': '     ',
        'password': '123',
        'password_confirm': '123'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in all field');
        done();
      });
  });
});