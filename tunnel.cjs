const lt = require('/tmp/node_modules/localtunnel');

(async () => {
  try {
    const tunnel = await lt({ port: 16001, subdomain: 'cet4-study' });
    console.log('TUNNEL_URL:', tunnel.url);
    console.log('Tunnel is open');

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
    });

    // Keep alive
    setInterval(() => {}, 1000);
  } catch(e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();