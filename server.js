
var PNG = require('node-png').PNG,
	fs = require('fs'),
	http = require('http');


function make_mandel(w, h, iters, sx, ex, sy, ey) {
	var p = new PNG({
		filterType: -1,
		width: w,
		height: h
	})
	var dx = (ex-sx) / p.width
	var dy = (ey-sy) / p.height
	console.log(dx, dy)
	var fy=sy;
	for(var j=0; j<p.height; j++) {
		var fx=sx;
		for (var i=0; i<p.width; i++) {
			var re=fx, im=fy
			var v = 0;
			for( ; v<iters && (re * re + im * im) < 4; v++)  {
				var ore = re
				re = fx + re * re - im * im;
				im = fy + 2 * ore * im;
			}
			v = iters-v  // if we reach max iters this is always 0
			var idx = (j*p.width + i) << 2
			p.data[idx] = v
			p.data[idx+1] = v
			p.data[idx+2] = v
			p.data[idx+3] = 0xFF
			fx += dx
		}
		fy += dy
	}
	return p
}

var cache = {}
http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'image/png'});
	var ret = cache[req.url]
	if (!ret)
	{
		var parts = req.url.split("/"),
			sy = parseFloat(parts[1]),
			sx = parseFloat(parts[2]),
			ey = parseFloat(parts[3]),
			ex = parseFloat(parts[4]),
			max_iter = parseFloat(parts[5]);
		console.log("Requesting "+sx+", "+ex+", "+sy+", "+ey+", "+max_iter)
		var p = make_mandel(256, 256, max_iter, sx, ex, sy, ey);
		var bufs=[]
		p.pack().on('data', function(data) {
			bufs.push(data)
		}).on('end', function(data) {
			if(data)
				bufs.push(data)
			ret = cache[req.url] = Buffer.concat(bufs)
			res.end(ret)
		})
	}
	else
		res.end(ret)
}).listen(8080);
