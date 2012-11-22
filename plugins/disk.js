
/*
 * statistics for disk devices
 */
function disk() {
	this.curr = initrow();
	this.prev = initrow();
	this.data = initrow();
}

function initrow() {
	return {
		total: initdisk()
	};
}

function initdisk() {
	return {
		read: {
			count: 0,
			sector: 0,
			time: 0
		},
		write: {
			count: 0,
			sector: 0,
			time: 0
		}
	};
}

function isDisk(label) {
	return /^(dm-\d+|md\d+|[hsv]d[a-z]+\d+)$/.test(label);
}

function getdisk(row, name) {
	var data = row[name];
	if (data) {
		return data;
	}
	return row[name] = initdisk();
}

function diff(value1, value2) {
	if (value1 === 0 || value2 === 0) {
		return 0;
	} else {
		return Math.abs(value1 - value2);
	}
}

disk.prototype.get = function(nstat, callback) {

	var self = this;
	var curr = self.curr;
	var prev = self.prev;
	var data = self.data;
	var total = initdisk();

	nstat.lines(
		'/proc/diskstats',
		function (line) {
			line = nstat.trim(line);
			var columns = nstat.split(line);
			// only accept 13 column line
			if (columns.length != 13) {
				return;
			}
			var devname = columns[2];
			
			if (isDisk(devname)) {
				var currdisk = getdisk(curr, devname);
				var prevdisk = getdisk(prev, devname);
				var datadisk = getdisk(data, devname);
				
				// set current value
				currdisk.read.count = Number(columns[3]);
				currdisk.read.sector = Number(columns[5]);
				currdisk.read.time = Number(columns[6]);
				currdisk.write.count = Number(columns[7]);
				currdisk.write.sector = Number(columns[9]);
				currdisk.write.time = Number(columns[10]);
				
				// get difference
				datadisk.read.count = diff(prevdisk.read.count, currdisk.read.count);
				datadisk.read.sector = diff(prevdisk.read.sector, currdisk.read.sector);
				datadisk.read.time = diff(prevdisk.read.time, currdisk.read.time);
				datadisk.write.count = diff(prevdisk.write.count, currdisk.write.count);
				datadisk.write.sector = diff(prevdisk.write.sector, currdisk.write.sector);
				datadisk.write.time = diff(prevdisk.write.time, currdisk.write.time);
				
				total.read.count += datadisk.read.count;
				total.read.sector += datadisk.read.sector;
				total.read.time += datadisk.read.time;
				total.write.count += datadisk.write.count;
				total.write.sector += datadisk.write.sector;
				total.write.time += datadisk.write.time;
			}
		},
		function (err) {
			self.prev = self.curr;
			self.curr = initrow();
			self.data.total = total;
			if (err) {
				callback(err);
			} else {
				callback(null, data);
			}
			self.data.total = initdisk();
		}
	);
};

module.exports = new disk;

