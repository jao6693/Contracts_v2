jQuery.sap.require("total.tsmscontracts.util.Controller");
jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.ca.ui.message.message");

total.tsmscontracts.util.Controller.extend("total.tsmscontracts.view.Main", {

	onInit : function() {
//		this.oInitialLoadFinishedDeferred = jQuery.Deferred();
//		this.getView().setBusy(true);
//		this.getView().attachEvent("updateFinished", function() {

		// subscribe to Return event to close all items in Tab Bar
		this.getEventBus().subscribe("app", "Return", this.returnToContract, this);
		// subscribe to live change in quantity/price fields to update total amount
		this.getEventBus().subscribe("app", "UpdateAmount", this.updateAmount, this);

		this.getRouter().attachRoutePatternMatched(this.routeMatched, this);
		// define keys for Supplier Value Help Dialog
		this.aKeys = ["SupplierId", "SupplierName"];
	},

	onBeforeRendering : function() {
		var oModel = this.getView().getModel();
		var oLocalModel = this.getView().getModel("local");
		// initialize date
		var sNow = new Date().toDateString();
		var dNow = new Date();
//		oLocalModel.oData.createdAt = now.toDateString();
		oLocalModel.setProperty("/createdAt", sNow);
//		oLocalModel.oData.negociatedAt = new Date();
		oLocalModel.setProperty("/negociatedAt", dNow);
		// initialize amount
		oLocalModel.setProperty("/amount", 0);
		
		// asynchronous call
        oModel.read("/PersonalizationCollection", null, null, false,
            function(oData) {
        		// store values in local instance of JSON model
//        		oLocalModel.oData.createdBy = oData.results[0].UserName;
        		oLocalModel.setProperty("/createdBy", oData.results[0].UserName);
//        		oLocalModel.oData.negociatedBy = oData.results[0].UserName;
        		oLocalModel.setProperty("/negociatedBy", oData.results[0].UserName);
        });

        // set company code
//      var oFieldsCC = this.getView().byId("CompanyCode");
        oLocalModel.setProperty("/header/CompCode", "0100");
        
        this.getView().setModel(oLocalModel, "local");
        this.getView().byId("ohMain").bindElement("local>/");
	},
	
	// events
	onAddProduct : function() {
		// use false to get no entry in history (use nav button?)
		this.getRouter().navTo("products", null, false);
	},

	onDelete : function(oEvent) {
		var sProductId = oEvent.getSource().data("productId");
		// get local model
		var oLocalModel = this.getView().getModel("local");
		// get existing items
		var aProducts = oLocalModel.getProperty("/products");
		// get products index
		var aProductsIndex = oLocalModel.getProperty("/products_i");
		// get the index of the related entry
		var indx = -1;

		for (var i = 0; i < aProducts.length; i++) {
		    if (aProducts[i].Material == sProductId) {
		    	indx = i;
		    	break;
		    };
		}
		// delete the entry if found
		if (indx > -1) {
			aProducts.splice(indx, 1);
			aProductsIndex.splice(indx, 1);
		};
		// update the model accordingly
		oLocalModel.setProperty("/products", aProducts);
		oLocalModel.setProperty("/products_i", aProductsIndex);
		// tell the application the product has been removed from the selected ones
		this.getEventBus().publish("app", "ProductRemoved", sProductId);
	},

	onAmountChange : function(oEvent) {
		// var sQty = oEvent.getParameter("newValue");
		var iQty = oEvent.getSource().data("quantity");
		var iPrice = oEvent.getSource().data("price");
		var iAmount = oEvent.getSource().data("amount");
		var iAdjustment = iPrice * iQty - iAmount;
		// let the view know that is has to refresh
		this.getEventBus().publish("app", "UpdateAmount", {
			adjustment : iAdjustment
		});
	},

	onConfigure : function(oEvent) {
		// var sProductId = oEvent.getSource().data("productId");
	},

	onCompanyChange : function(oEvent) {
//		var oSource = oEvent.getSource();
//		var oParams = oEvent.getParameters();
	},

	onSupplierF4 : function() {
		var that = this;
		// get OData model
		var oModel = this.getView().getModel();
		// get local model
		this.oLocalModel = this.getView().getModel("local");
		// define Value Help Dialog
		var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
			title: "Supplier",
			modal: true,
			supportMultiselect: false,
			supportRanges: false,
			filterMode: false,
			// SupplierId
			key: this.aKeys[0],
			// SupplierName
			descriptionKey: this.aKeys[1],

			ok: function(oEvent) {
				// retrieve selected token (sap.m.Token)
				var aTokens = oEvent.getParameter("tokens");
				// build supplier path
				var sSupplier = aTokens[0].getKey();
		        // supplier selected so bind it to the corresponding form
	        	var sSupplierPath = "/SupplierCollection('" + sSupplier + "')";
		        that.getView().byId("F_MainSupplier").bindElement(sSupplierPath);
		        // update the model accordingly
		        that.oLocalModel.setProperty("/header/SupplierId", sSupplier);
				// oValueHelpDialog.close();
		        this.close();
				
			},

			cancel: function(oEvent) {
				// oValueHelpDialog.close();
				this.close();
			},

			afterClose: function() {
				// oValueHelpDialog.destroy();
				this.destroy();
			}
		});

		// set OData model to Value Help Dialog
		oValueHelpDialog.setModel(oModel);
		// define the structure of the table to display the suppliers
		var oColumnsModel = new sap.ui.model.json.JSONModel();
		// template names must match with the OData service entity type Supplier
		oColumnsModel.setData({
			cols: [
			    {label: "Supplier Id", template: "SupplierId"},
			    {label: "Supplier name", template: "SupplierName"},
			    {label: "City", template: "City"},
			    {label: "Country", template: "Country"}
			]
		});

		oValueHelpDialog.setModel(oColumnsModel, "columns");

		// bind suppliers to rows (initial binding w/o filters)
		oValueHelpDialog.theTable.bindRows({
				path: "/SupplierCollection"
				// filters: oFiltersF4 || []
		});
		// set key(s)
		oValueHelpDialog.setKey(this.aKeys[0]);
		oValueHelpDialog.setKeys(this.aKeys);
		// set filter bar
		oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
			filterItems : [
				new sap.ui.comp.filterbar.FilterItem({
					label: "Name",
					name: "nameSF",
					control: new sap.m.SearchField()
				}),
				new sap.ui.comp.filterbar.FilterItem({
					label: "Country",
					name: "countrySF",
					control: new sap.m.SearchField()
				})
				],
			search : function(oEvent) {
				var oFilters = oEvent.getParameter("selectionSet");
				var oFiltersF4 = that.searchInF4(oFilters);
				// refresh result table
				oValueHelpDialog.theTable.bindRows({
						path: "/SupplierCollection",
						filters: oFiltersF4
				});
			}
		}));
		// finally trigger the UI to interact with the user
		oValueHelpDialog.open();

	},

	onSave : function() {
		// set the busy dialog
		if (!this.oBusyDialog) {
			this.oBusyDialog = new sap.m.BusyDialog();
		};

		var that = this;
//		this.getView().setBusyIndicatorDelay(0);
//		this.getView().setBusy(true);

		// get local model
		var oLocalModel = this.getView().getModel("local");

		var mPayload = {};
		mPayload.Number = '0000000001';
//		mPayload.CompCode = oContract.header[0].companyCode;
		mPayload.CompCode = oLocalModel.getProperty("/header/CompCode");
		// null doesn't work so it has to be ''
		mPayload.DocType = '';
		mPayload.Vendor = oLocalModel.getProperty("/header/SupplierId");
		mPayload.Pmnttrms = '';
		mPayload.PurchOrg = '';
		mPayload.Currency = 'EUR';
		mPayload.DocDate = '2014-10-10T00:00:00';
		mPayload.Incoterms1 = '';
		mPayload.Incoterms2 = '';

		var mPayloadItems = [];
		var aProducts = oLocalModel.getProperty("/products");

		for (var i = 0; i < aProducts.length; i++) {
//			var itemNumber = i + 1;
			// basic payload data
			var oItem = {
				PriceUnit: '1',
				NetPrice : aProducts[i].Price,
//				NetPrice: '1',
				PoUnit : aProducts[i].QuantityUnit,
//				PoUnit:  'EA',
				TargetQty : aProducts[i].Weight,
//				TargetQty: '1',
				Plant: '',
				Material: aProducts[i].Material,
//				ItemNo : itemNumber
				ItemNo: '1'
			};
			// push new item to contract items payload
			mPayloadItems.push(oItem);
		};

		// put items in navigation property of header
		// see service gateway implementation for details
		mPayload.PurchaseContractItems = mPayloadItems;

		// send OData Create request
		var oModel = this.getView().getModel();
		oModel.attachRequestSent(function() {
			that.oBusyDialog.open();
		});
		oModel.attachRequestCompleted(function() {
			that.oBusyDialog.close();
		});
		oModel.refreshSecurityToken();

		this.oBusyDialog.open();
		// create deep INSERT create request
		this.oModel = oModel;

		oModel.create("/PurchaseContractHeaderCollection", mPayload, {
			async : true,
			// request is asynchronous to be able to see the busy dialog
			// otherwise waiting for response blocks execution of JavaScript
			success : jQuery.proxy(function(oData, oResponse) {
				// get headers
				// headers is an array without index!?!?!?
//				var oSAPMsg = oResponse.headers['sap-message'];
				
				var oMsgModel = new sap.ui.model.json.JSONModel();
				oMsgModel = JSON.parse(oResponse.headers['sap-message']);
				// ID of newly inserted product is available in mResponse.ID
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.SUCCESS,
					message: "Contract '" + oData.Number + "' created",
					details: "Contract '" + oData.Number + "' created"
					});

				// add messages from backend in the toolbar

				// get toolbar
				var oNotificationBar = this.getView().byId("NB1");

				if (oNotificationBar.indexOfNotifier("Notifier") == -1) {
					var oNotifier = new sap.ui.ux3.Notifier({
						title : "Messages"
					});
				};
				// initialize date
				if (!sNow) {
					var sNow = new Date().toDateString();
				};

				// get number of detailed messages in response
				var aMsgDetails = oMsgModel.details;
				
				for ( var i = 0; i < aMsgDetails.length; i++ ) {

					var oMessage = new sap.ui.core.Message({
						text : aMsgDetails[i].message,
						timestamp : sNow,
						icon : "images/Thumbnail_32.png",
						readOnly : true
					});

					oNotifier.addMessage(oMessage);

//					oMessage.destroy();
				};

//				oNotificationBar.removeAllNotifiers();
				oNotificationBar.addNotifier(oNotifier);
				oNotificationBar.setVisibleStatus("Default");
			}, this),

			error : jQuery.proxy(function() {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Application error",
					details: "See notification bar for details"
					});	
			}, this)
		});
	},

	// functions
	routeMatched : function(oEvent) {

//		var sName = oEvent.getParameter("name");
		// only way out is to go to Products page
	},

	returnToContract : function(channelId, eventId, data) {
		var oITBar = this.getView().byId("itbMain");
		oITBar.setExpanded(false);
	},

	updateAmount : function(channelId, eventId, data) {
		// get local model
		var oLocalModel = this.getView().getModel("local");
		// get the total amount of the contract
		var iAmount = oLocalModel.getProperty("/amount");
		// adjust the value
		iAmount += data.adjustment;
		// update the model accordingly
		oLocalModel.setProperty("/amount", iAmount);
	},
	
	searchInF4 : function(oFilters) {
		var aFilters = [];
		// get restriction on supplier name
		var oSupplierFilter = new sap.ui.model.Filter({
			path: "SupplierName",
			operator: sap.ui.model.FilterOperator.EQ,
			// get supplier name from filter tab
			value1: oFilters[0].getProperty("value")
		});
		// push it to the filter
		aFilters.push(oSupplierFilter);

		var oCountryFilter = new sap.ui.model.Filter({
			path: "Country",
			operator: sap.ui.model.FilterOperator.EQ,
			// get country code from filter tab
			value1: oFilters[1].getProperty("value")
		});
		// push it to the filter
		aFilters.push(oCountryFilter);
		// return the array of filters to restrict the display of the result
		return aFilters;
	}
});