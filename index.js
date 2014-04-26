'use strict';

var util = require('util');
var stream = require('stream');
var nodecast = require('nodecast');

util.inherits(Driver,stream);
util.inherits(Device,stream);


function Driver(opts,app) {
  this.app = app;
  this.opts = opts;

  this.opts.devices = opts.devices || {};

  app.once('client::up', this.init.bind(this));

}

Driver.prototype.init = function() {

  var casts = nodecast.find();

  casts.on('device', function(device) {


    if (device.types.indexOf('chromecast')==-1) return;

    var G = device.info.UDN.split(':')[1].replace(/[^a-z0-9]/ig, '');
    console.log('Found device', device);  

    this.opts.devices[G] = device;
    this.emit('register',new Device(G,this));

  }.bind(this));

};


function Device(G,driver) {

  this.G = G;
  this.V = 0;
  this.D = 240;
  this._driver = driver;
  this.name = this._driver.opts.devices[G].name;

  process.nextTick(function() {

    this.emit('data','')
  }.bind(this));
};

Device.prototype.write = function(data) {

  var app = this._driver.opts.devices[this.G].app('YouTube');

  app.start(data,function(err) {
      if (err) console.log('error starting', err);
      console.log('Started');
  });
};

module.exports = Driver;