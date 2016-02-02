
(function(Application, Window, Utils, API, VFS, GUI) {
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  // WINDOWS
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationFlexCourierWindow(app, metadata, scheme) {
    Window.apply(this, ['ApplicationFlexCourierWindow', {
      icon: metadata.icon,
      title: metadata.name,
      gravity: 'center',
      allow_resize: true,
      allow_maximize: true,
      width: 900,
      height: 600,
      min_height: 400
    }, app, scheme]);
  }

  ApplicationFlexCourierWindow.prototype = Object.create(Window.prototype);
  ApplicationFlexCourierWindow.constructor = Window.prototype;

  ApplicationFlexCourierWindow.prototype.init = function (wm, app, scheme) {
    var root = Window.prototype.init.apply(this, arguments);
    scheme.render(this, 'FlexCourierWindow', root);
    return root;
  };

  /////////////////////////////////////////////////////////////////////////////
  // APPLICATION
  /////////////////////////////////////////////////////////////////////////////

  var ApplicationFlexCourier = function (args, metadata) {
      Application.apply(this, ['ApplicationFlexCourier', args, metadata]);
  };

  ApplicationFlexCourier.prototype = Object.create(Application.prototype);
  ApplicationFlexCourier.constructor = Application;

  ApplicationFlexCourier.prototype.init = function (settings, metadata, onInited) {
    Application.prototype.init.apply(this, arguments);

    var self = this;
    var url = API.getApplicationResource(this, './scheme.html');
    var scheme = GUI.createScheme(url);
    scheme.load(function(error, result) {
        self._addWindow(new ApplicationFlexCourierWindow(self, metadata, scheme));

      onInited();
    });

    this._setScheme(scheme);
  };

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Applications = OSjs.Applications || {};
  OSjs.Applications.ApplicationFlexCourier = OSjs.Applications.ApplicationFlexCourier || {};
  OSjs.Applications.ApplicationFlexCourier.Class = ApplicationFlexCourier;

})(OSjs.Core.Application, OSjs.Core.Window, OSjs.Utils, OSjs.API, OSjs.VFS, OSjs.GUI);
