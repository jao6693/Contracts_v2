jQuery.sap.require("total.tsmscontracts.util.Controller");

total.tsmscontracts.util.Controller.extend("total.tsmscontracts.view.App", {

	onInit : function() {
		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
	},

	onRouteMatched : function(oEvent) {

		var sName = oEvent.getParameter("name");
		// empty hash means the application is started
		if (sName === "start") {
			var oArguments = oEvent.getParameter("arguments");
			var newRoute = oArguments.newRoute;
			if (!oArguments.newRoute) {
				newRoute = "Overview";
			} else {
				newRoute = oArguments.newRoute;
			}

			this.getRouter().navTo("overview", newRoute, false);
		}
	},
});