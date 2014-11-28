jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.declare("total.tsmscontracts.Router");

sap.ui.core.routing.Router.extend("total.tsmscontracts.Router", {

	constructor : function() {
		sap.ui.core.routing.Router.apply(this, arguments);
		this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);
	},

	_navForward : function() {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var oPosition = oHistory.iHistoryPosition + 1;

		if (oHistory.aHistory.length > oPosition) {
			// nav back forward
			window.history.go(1);
			return true;
		} else {
			// nav to
			return false;
		}
	},

	_navBack : function(sRoute, mData) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		// history contains a previous entry
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var bReplace = true; // otherwise we go backwards with a forward history
			this.navTo(sRoute, mData, bReplace);
		}
	},

	_navToWithoutHash : function (oOptions) {
		var oApp = this._findApp(oOptions.currentView);

		// load view, add it to the page aggregation, and navigate to it
		var oView = this.getView(oOptions.targetViewName, oOptions.targetViewType);
		oApp.addPage(oView);
		oApp.to(oView.getId(), oOptions.transition || "show", oOptions.data);
	},

	_navBackWithoutHash : function (oCurrentView) {
		this._findApp(oCurrentView);
	},

	destroy : function() {
		sap.ui.core.routing.Router.prototype.destroy.apply(this, arguments);
		this._oRouteMatchedHandler.destroy();
	},

	// functions used in navigation
	_findApp : function(oControl) {
		sAncestorControlName = "idAppControl";

		if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
			return oControl.byId(sAncestorControlName);
		}

		return oControl.getParent() ? this._findApp(oControl.getParent(), sAncestorControlName) : null;
	}
});