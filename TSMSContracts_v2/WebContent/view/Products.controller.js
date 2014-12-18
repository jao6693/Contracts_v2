jQuery.sap.require("total.tsmscontracts.util.Controller");
jQuery.sap.require("sap.ui.core.search.OpenSearchProvider");
jQuery.sap.require("sap.ui.model.FilterOperator");

total.tsmscontracts.util.Controller.extend("total.tsmscontracts.view.Products", {

	onInit : function() {
		// subscribe to ProductRemoved event to unselect deleted products
		this.getEventBus().subscribe("app", "ProductRemoved", this.removeProduct, this);

		this.getRouter().attachRoutePatternMatched(this.routeMatched, this);

	},

	// events
	onInitialise : function(oEvent) {
		var oSmartFilterBar = oEvent.getSource();
		this.loadProducts();
	},
	
	onNavBack : function() {
		// publish the event to the channel app
		this.getEventBus().publish("app", "Return", null);
		// then back to contract view
		window.history.go(-1);
	},

	onSearch : function(oEvent) {
		var oSmartFilterBar = oEvent.getSource();
		var aFilters = [];
		var oParameters;

		aFilters = oSmartFilterBar.getFilters();
		oParameters = oSmartFilterBar.getParameters();

		this.loadProducts(aFilters, oParameters);
	},

	onReset : function(oEvent) {
		// do nothing
	},

	onPress : function(oEvent) {
		var mParams = oEvent.getParameters();
		if (mParams.selected == true) {
			// set unselected
			this.getParent().setSelectedItemById(mParams.id, false);
		} else {
			// set selected
			this.getParent().setSelectedItemById(mParams.id, true);
		};
	},
	
	onSelChange : function(oEvent) {
		var mParams = oEvent.getParameters();
		if (mParams.selected == false) {
			// the user unselected an item
			var sProductPath = mParams.listItem.getBindingContext().sPath;
			
			var oLocalModel = this.getView().getModel("local");
			// get existing items
			var aProducts = oLocalModel.getProperty("/products");
			// get products index
			var aProductsIndex = oLocalModel.getProperty("/products_i");
			
			var indx = aProductsIndex.indexOf(sProductPath);
			
			if (indx > -1) {
				// product found and should be removed for consistency
				aProducts.splice(indx, 1);
				aProductsIndex.splice(indx, 1);
				// update model accordingly
				oLocalModel.setProperty("/products", aProducts);
				oLocalModel.setProperty("/products_i", aProductsIndex);
			};
			
		};
	},
	
	onReturn : function(oEvent) {
		var oProduct = {};
		// get OData model
		var oModel = this.getView().getModel();
		// get local model
		var oLocalModel = this.getView().getModel("local");
		// get existing items
		var aProducts = oLocalModel.getProperty("/products");
		// get products index
		var aProductsIndex = oLocalModel.getProperty("/products_i");

		// add items selected by user
		var oSelectedContexts = this.getView().byId("T1P1").getSelectedContexts();
		for ( var i = 0; i < oSelectedContexts.length; i++ ) {
			oProduct = oModel.getProperty(oSelectedContexts[i].sPath, oSelectedContexts[i]);
			// does the entry already exist?
			if (aProductsIndex.indexOf(oSelectedContexts[i].sPath) == -1 ) {
				aProducts.push(oProduct)
				aProductsIndex.push(oSelectedContexts[i].sPath);
			};
		};
		// update model accordingly
		oLocalModel.setProperty("/products", aProducts);
		oLocalModel.setProperty("/products_i", aProductsIndex);

		// publish the event to the channel app
		this.getEventBus().publish("app", "Return", null);
		// then back to contract view
		window.history.go(-1);
	},

	// functions
	routeMatched : function(oEvent) {
		// var sName = oEvent.getParameter("name");
		// var oView = this.getView();

		// fetch the products from the OData service and store them in the model
		sProductPath = "/ProductCollection";
//		oView.bindElement(sProductPath);
	},

	removeProduct : function(channelId, eventId, data) {
		var aItemsContext = this.getView().byId("T1P1").getSelectedContexts();
		// get selected items
		var aItems = this.getView().byId("T1P1").getSelectedItems();
		// build the context path
		sProductPath = "/ProductCollection('" + data + "')";
		// loop over the contexts to identify the removed product
		var indx = -1;

		for (var i = 0; i < aItemsContext.length; i++) {
		    if (aItemsContext[i].sPath == sProductPath) {
		    	indx = i;
		    	break;
		    };
		}
		// mark the entry as unselected if found
		if (indx > -1) {
			var oItem = this.getView().byId("T1P1").setSelectedItem(aItems[i], false);
		};
	},

	loadProducts : function(aFilters, oParameters) {
		// get the table
		var oTable = this.getView().byId("T1P1");
		// define the template for the items structure
		var oItemTemplate = new sap.m.ColumnListItem({
			type : "Active",
			cells : [
			    new sap.m.ObjectIdentifier({
			    	title : "{ShortDescription}",
			    	text : "{Material}"
			    }),
			    new sap.m.Text({
			    	text : "{CategoryName}"
			    }),
			    new sap.m.Text({
			    	text : "{QuantityUnit}"
			    }),
			    new sap.m.ObjectNumber({
			    	number : "{Price}",
			    	unit : "{CurrencyCode}"
			    })
			],
			press : this.onPress
		});

		// bind the rows according to user selection
//		oTable.bindRows({
//			path: "/ProductCollection",
//			parameters: oParameters || {},
//			filters: aFilters || []
//		});

//		oTable.bindAggregation("items", "/ProductCollection", oItemTemplate);

		oTable.bindAggregation("items", {
			path : "/ProductCollection",
			filters: aFilters || [],
			template: oItemTemplate
		}),

		this.productsLoaded = true;
	}
});