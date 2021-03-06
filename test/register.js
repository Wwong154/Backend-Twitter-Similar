const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);
describe('/users POST "register"', () => {
  it('user register when all info is enter and is correct', (done) => {
    chai.request.agent(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'Jonathan Q. Arbuckle',
        'password': '123456456',
        'password_confirm': '123456456'
      })
      .end((e, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.msg.should.equal('registered');
          (done())
      });
  });

  it('should not register if user already exist', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'Trex',
        'password': '123456',
        'password_confirm': '123456'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('user exist');
        done();
      });
  });

  it('should not register if user already exist even with space in front and end', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': '   Trex    ',
        'password': '123456',
        'password_confirm': '123456'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('user exist');
        done();
      });
  });

  it('should not register if user already exist case insensitive', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': '   TReX    ',
        'password': '123456',
        'password_confirm': '123456'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('user exist');
        done();
      });
  });

  it('should not register if passwrod is too short', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'john',
        'password': '12345',
        'password_confirm': '12345'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('password is too short');
        done();
      });
  });

  it('should not register if passwrod does not match', (done) => {
    chai.request(server)
      .post('/users')
      .type('form')
      .send({
        'name': 'john',
        'password': '1234564',
        'password_confirm': '123456'
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
        'password': '123456',
        'password_confirm': '123456'
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
        'password_confirm': '123456'
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
        'password': '123456'
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
        'password': '123456',
        'password_confirm': '123456'
      })
      .end((e, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.err.should.equal('please fill in all field');
        done();
      });
  });
});