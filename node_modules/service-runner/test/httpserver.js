var http = require('http');
module.exports = function (opts) {
    console.log(opts);
    return new Promise(function(resolve, reject) {
        http.createServer(function (req, res) {
            opts.logger.log('info', {
                uri: req.url
            });
            if (req.url === '/foo/') {
                res.writeHead(302, {
                    'Content-Type': 'text/plain',
                    'Location': 'bar'
                });
                res.end('bar');
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                });
                res.end('okay');
            }
        }).listen(opts.config.port || 8888, opts.config.interface || '0.0.0.0', resolve);
    });
};
