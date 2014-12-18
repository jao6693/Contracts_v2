jQuery.sap.declare("total.tsmscontracts.Component");
jQuery.sap.require("total.tsmscontracts.Router");

sap.ui.core.UIComponent.extend("total.tsmscontracts.Component", {

	metadata : {
		name : "TSMS Spot Contracts App",
		version : "1.0",
		includes : [],
		dependencies : {
			libs : ["sap.ui.commons", "sap.ui.layout"],
			components : []
		},

		rootView : "total.tsmscontracts.view.App",

		config : {
			resourceBundle : "i18n/messageBundle.properties",
			serviceConfig : {
				name : "B3Z",
				serviceUrl : "http://sapb3z.rm.corp.local:8004/tsmscontracts/srv/v2"
//				serviceUrl : "http://sapb3z.rm.corp.local:8004/tsmscontracts/srv"
			}
		},

		routing : {
			config : {
				routerClass : total.tsmscontracts.Router,
				viewType : "XML",
				viewPath : "total.tsmscontracts.view",
				targetControl : "idAppControl",
				targetAggregation : "pages",
				clearTarget : false,
				transition : "show"
			},

 			routes : [
 				{
 					pattern : "",
 					name : "start",
 					view : "App",
 					subroutes : [
 						{
 							pattern : "Overview",
 							name : "overview",
 							view : "Main"
 						},
						{
							pattern : "Products",
							name : "products",
							view : "Products",
 							transition : "slide",
						},
 					]
 				}
			]
		},
	},

	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        var mConfig = this.getMetadata().getConfig();
        // always use absolute paths relative to our own component
        // (relative paths will fail if running in the Fiori Launchpad)
        var rootPath = jQuery.sap.getModulePath("total.tsmscontracts");

        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
        	bundleUrl : [rootPath, mConfig.resourceBundle].join("/")
        });

        this.setModel(i18nModel, "i18n");
        
        // create and set main model to the component
        var sServiceUrl = mConfig.serviceConfig.serviceUrl;
        var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

        this.setModel(oModel);

        // create local model for client-side data persistency
        var localModel = new sap.ui.model.json.JSONModel({
        	// user settings
        	"settings" : {},
        	// selected products
        	"products" : [],
        	// selected products: index
        	"products_i" : [],
        	// contract header
        	"header" : {},
        	// contract items
        	"items" : []
        });

        // set local model
        this.setModel(localModel, "local");

        this.getRouter().initialize();

    }
});