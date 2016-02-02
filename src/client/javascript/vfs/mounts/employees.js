/*!
 * FlexOS.js
 *
 * Copyright (c) 2011-2016, TZ Advantage <tzadvantage@gmail.com>
 * All rights reserved.
 */
(function (Utils, API) {
    'use strict';

    window.OSjs = window.OSjs || {};
    OSjs.VFS = OSjs.VFS || {};
    OSjs.VFS.Modules = OSjs.VFS.Modules || {};

    /////////////////////////////////////////////////////////////////////////////
    // EXPORTS
    /////////////////////////////////////////////////////////////////////////////

    /**
     * This is a virtual module for showing 'dist' files in OS.js
     *
     * @see OSjs.VFS.Transports.Internal
     * @api OSjs.VFS.Modules.User
     */
    OSjs.VFS.Modules.Employees = OSjs.VFS.Modules.Employees || {
        readOnly: false,
        description: 'Werknemers',
        root: 'employees:///',
        icon: 'places/folder_home.png',
        match: /^employees\:\/\//,
        visible: true,
        internal: true,
        unmount: function (cb) {
            cb = cb || function () { };
            cb(API._('ERR_VFS_UNAVAILABLE'), false);
        },
        mounted: function () {
            return true;
        },
        enabled: function () {
            return true;
        },
        request: OSjs.VFS.Transports.Internal.request
    };

})(OSjs.Utils, OSjs.API);
