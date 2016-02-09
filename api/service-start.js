 var Service = require('node-mac').Service;

    // Create a new service object
    var svc = new Service({
      name:'Leviticus API',
      description: 'The API for Leviticus (i.e. wiki.bertball.com).',
      script: 'api.js'
    });

    // Listen for the "install" event, which indicates the
    // process is available as a service.
    svc.on('install',function(){
      svc.start();
    });

    svc.install();
