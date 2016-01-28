/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * WebAPI Handler: Login screen and session/settings handling via database
 * PLEASE NOTE THAT THIS AN EXAMPLE ONLY, AND SHOUD BE MODIFIED BEFORE USAGE
 *
 * Copyright (c) 2011-2016, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/*
See doc/WebAPI-handler.txt
*/

(function(API, Utils, VFS) {
  'use strict';

  window.OSjs  = window.OSjs || {};
  OSjs.Core    = OSjs.Core   || {};

  /////////////////////////////////////////////////////////////////////////////
  // HANDLER
  /////////////////////////////////////////////////////////////////////////////

  var APIURI = API.getConfig('Connection.APIURI');
  var FSURI = API.getConfig('Connection.FSURI');
  var token, path, controller, action, payload;


  /**
   * @extends OSjs.Core._Handler
   * @class
   */
  var WebAPIHandler = function() {
    OSjs.Core._Handler.apply(this, arguments);
    this._saveTimeout = null;
  };

  WebAPIHandler.prototype = Object.create(OSjs.Core._Handler.prototype);

  /**
   * Override default init() method
   */
  WebAPIHandler.prototype.custom = true;
  WebAPIHandler.prototype.init = function(callback) {
    // Located in src/client/javasript/hander.js
    var self = this;
    this.initLoginScreen(function() {
      OSjs.Core._Handler.prototype.init.call(self, callback);
    });
  };

  /**
   * WebAPI login api call
   */
  WebAPIHandler.prototype.login = function(username, password, callback) {
    console.debug('OSjs::Handlers::WebAPIHandler::login()');
    var opts = {username: username, password: password};
    this.callAPI('login', opts, function(response) {
      if ( response.result ) { // This contains an object with user data
        callback(response.result);
      } else {
        callback(false, response.error ? ('Error while logging in: ' + response.error) : 'Invalid login');
      }

    }, function(error) {
      callback(false, 'Login error: ' + error);
    });
  };

  /**
   * WebAPI logout api call
   */
  WebAPIHandler.prototype.logout = function(save, callback) {
    console.debug('OSjs::Handlers::WebAPIHandler::logout()', save);
    var self = this;

    function _finished() {
      var opts = {};
      self.callAPI('logout', opts, function(response) {
        if ( response.result ) {
          callback(true);
        } else {
          callback(false, 'An error occured: ' + (response.error || 'Unknown error'));
        }
      }, function(error) {
        callback(false, 'Logout error: ' + error);
      });
    }

    OSjs.Core._Handler.prototype.logout.call(this, save, _finished);
  };

  /**
   * Override default settings saving
   */
  WebAPIHandler.prototype.saveSettings = function(pool, storage, callback) {
    console.debug('OSjs::Handlers::DemoHandler::saveSettings()');

    var self = this;
    var opts = {settings: storage};

    function _save() {
      self.callAPI('settings', opts, function(response) {
        console.debug('WebAPIHandler::syncSettings()', response);
        if ( response.result ) {
          callback.call(self, true);
        } else {
          callback.call(self, false);
        }
      }, function(error) {
        console.warn('WebAPIHandler::syncSettings()', 'Call error', error);
        callback.call(self, false);
      });
    }

    if ( this._saveTimeout ) {
      clearTimeout(this._saveTimeout);
      this._saveTimeout = null;
    }
    setTimeout(_save, 100);
  };


    /**
 * Default method to perform a call to the backend (API)
 *
 * Please note that this function is internal, and if you want to make
 * a actual API call, use "API.call()" instead.
 *
 * @see OSjs.API.call()
 *
 * @method  _Handler::callAPI()
 */
  WebAPIHandler.prototype.callAPI = function (method, args, cbSuccess, cbError, options) {
      args = args || {};
      cbSuccess = cbSuccess || function () { }
      ;
      cbError = cbError || function () { }
      ;

      var self = this;

      function checkState() {
          if (self.offline) {
              cbError('You are currently off-line and cannot perform this operation!');
              return false;
          } else if ((API.getConfig('Connection.Type') === 'standalone')) {
              cbError('You are currently running locally and cannot perform this operation!');
              return false;
          }
          return true;
      }

      function _call() {
          if ((API.getConfig('Connection.Type') === 'nw')) {
              try {
                  self.nw.request(method, args, function (err, res) {
                      cbSuccess({
                          error: err,
                          result: res
                      });
                  });
              } catch (e) {
                  console.warn('callAPI() NW.js Warning', e.stack, e);
                  cbError(e);
              }
              return true;
          }


          token = self.userData.token || '';
          //Map to a controller and action
          switch (method) {
              case "login":
                  path = APIURI;
                  controller = "/auth/";
                  action = method;
                  payload = { companyname: 'test', username: args.username, password: args.password };
                  break;
              case "logout":
                  path = APIURI;
                  controller = "/auth/";
                  action = method;
                  payload = { token: token };
                  break;
              case "settings":
                  path = APIURI;
                  controller = "/auth/";
                  action = method;
                  payload = { token: token, settings: args.settings };
                  break;
              case "FS:exists":
                  path = FSURI;
                  controller = '/';
                  action = "exists";
                  payload = { token: token, path: args.path };
                  break;
              case "FS:read":
                  path = FSURI;
                  controller = '/';
                  action = "read";
                  payload = { token: token, path: args.path };
                  break;
              default:
                  path = "";
                  controller = "";
                  action = "";
                  payload = {};
                  break;
          }

          var data = {
              url: path + controller + action,
              method: 'POST',
              json: true,
              body: payload,
              onsuccess: function (/*response, request, url*/) {
                  cbSuccess.apply(self, arguments);
              },
              onerror: function (/*error, response, request, url*/) {
                  cbError.apply(self, arguments);
              }
          };

          if (options) {
              Object.keys(options).forEach(function (key) {
                  data[key] = options[key];
              });
          }

          return Utils.ajax(data);
      }

      console.group('Handler::callAPI()');
      console.log('Method', method);
      console.log('Arguments', args);
      console.groupEnd();

      if (checkState()) {
          return _call();
      }

      return false;
  }
    ;



  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Core.Handler = WebAPIHandler;

})(OSjs.API, OSjs.Utils, OSjs.VFS);
