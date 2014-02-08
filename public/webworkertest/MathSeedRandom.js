

var Mathrnd = function(seed, max, min){
    this.seed = seed || new Date().getTime();
    this.max = max || 1;
    this.min = min || 0;
}
Mathrnd.prototype.seededRandom = function() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    var rnd = this.seed / 233280.0;

    return this.min + rnd * (this.max - this.min);
}

module.exports=Mathrnd;