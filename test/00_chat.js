require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const chai = require('chai');
const server = require('../server');
const should = chai.should();
const io = require('socket.io-client');
const socketURL = `http://localhost:${process.env.PORT}`;

const options ={
  transports: ['websocket'],
  'force new connection': true
};

const chatUser1 = {'id':'1'};
const chatUser2 = {'id':'2'};
const chatUser3 = {'id':'3'};

describe("Socket / DM function test",function(){
  it('Should check socket is working', function(done){
    let client1 = io.connect(socketURL, options);
    
    client1.on('connect', function(data){
      client1.emit('connection id', chatUser1);
      client1.emit('connect test');
      client1.on('connected', function(sucess){
        sucess.should.equal('connection sucess')
        client1.disconnect();
        done();
      });
    })
  });
  
  it('Should be able to send dm if both user is online', function(done){
    let client1, client2, client3;
    let message = {to: chatUser1.id, txt:'Private Hello World'};
    let messages = 0;
  
    const completeTest = function(){
      messages.should.equal(1);
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      done();
    };
  
    const checkPrivateMessage = function(client){
      client.on('dm', function(msg){
        message.txt.should.equal(msg.txt);
        msg.from.should.equal(chatUser3.id);
        messages++;
        if(client === client1){
          /* The first client has received the message
          we give some time to ensure that the others
          will not receive the same message. */
          setTimeout(completeTest, 40);
        };
      });
    };
  
    client1 = io.connect(socketURL, options);
    checkPrivateMessage(client1);
  
    client1.on('connect', function(data){
      client1.emit('connection id', chatUser1);
      client2 = io.connect(socketURL, options);
      checkPrivateMessage(client2);
  
      client2.on('connect', function(data){
        client2.emit('connection id', chatUser2);
        client3 = io.connect(socketURL, options);
        checkPrivateMessage(client3);
  
        client3.on('connect', function(data){
          client3.emit('connection id', chatUser3);
          client3.emit('dm', message)
        });
      });
    });
  });
  
  it('Should not be able to send dm if only 1 user is online, but msg will be insert for later', function(done){
    let client1, client3;
    let message = {to: chatUser2.id, txt:'Private Hello World'};
  
    client1 = io.connect(socketURL, options);
    client1.on('connect', function(data){
      client1.emit('connection id', chatUser1);
      client3 = io.connect(socketURL, options);

      client3.on('connect', function(data){
        client3.emit('connection id', chatUser3);
        client3.emit('dm', message)
        client3.on('receiver offline', function(res){
          res.should.equal('message sent')
          client3.disconnect();
          client1.disconnect();
          done();
        });
      });
    });
  });
});
