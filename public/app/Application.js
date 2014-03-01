
var Application = function (config) {
	
	this.configuration = config || {};
	
	this.domElement = config.domElement || document.body;
	
	this.initializationStages = [];
	
};

Application.prototype = {
	
	addInitializationStage: function (stage) {
		this.initializationStages.push(stage.stage);
	},
	
	initialize: function () {
		for (var stage = 0, len = this.initializationStages.length; stage < len; stage += 1) {
			if (this.initializationStages.hasOwnProperty(stage)) {
				try {
					this.initializationStages[stage].call(this);
				}
				catch (e) {
					console.error("Initializaiton Failed")
					this.configuration.onError(e);
					return;
				}
			}
		}
		try {
			if (this.configuration.onInitialize) {
				this.configuration.onInitialize.call(this);
			}
			else {
				console.warn("No application onInitialize callback.");
			}
		}
		catch (e) {
			console.error("Initialization callback failed:", e);
		}
	},
	
	start: function () {
		this.configuration.onStart.call(this);
	}
	
};


module.exports = Application;