jQuery.sap.require("sap.ui.veh_campanias.util.Formatter");
jQuery.sap.require("sap/ui/model/json/JSONModel");
jQuery.sap.require("sap/m/MessageToast");
jQuery.sap.require("sap/m/Table");
// jQuery.sap.require("sap/m/semantic");

sap.ui.define([
	"sap/ui/veh_campanias/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Token',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/veh_campanias/util/Formatter"
], function(BaseController, MessageBox, JSONModel, Token, Filter, FilterOperator, formatter) {
	"use strict";
	var Series = [];
	var fgmSelected = "";
	var click = 1;
	var clk_m = 1;
	var clk_t = 1;
	var tableuse;
	var that;
	var DATAFORSELECT = [];
	var CAMPA = [];
	var PEDIDO = [];
	var tipoRadioButton = 0;
	var isMobile;
	var urlGlobal = "/DEV_TO_ODVIATICOS/odata/SAP/ZSCP_VEHICULOS_SRV";
	// var urlGlobal = "https://gwaas-d85e9224f.us2.hana.ondemand.com/odata/SAP/ZSCP_VEHICULOS_SRV";
	var urlGlobal2 = "/ODATA_Repuestos/odata/SAP/ZSCP_REPUESTOS_SRV/";
	// var urlGlobal2 = "https://gwaas-d85e9224f.us2.hana.ondemand.com/odata/SAP/ZSCP_REPUESTOS_SRV";
	var concesionario;
	var gs_free; //+@WVF001 Limpieza del del smarttable
	return BaseController.extend("sap.ui.veh_campanias.controller.Home", {
		formatter: formatter,
		onInit: function() {
			that = this;
			Series = [];
			var oView = this.getView();
			var items = ["fechainicio", "fechafinal", "idBtnDeleteCamp", "idBtnDataG", "Column1", "Column2", "Column3", "Column4"];
			for (var i = 0; i < items.length; i++) {
				this.getView().byId(items[i]).setVisible(false);
			}
			tipoRadioButton = 1;
			// Configurando Multi Input de Serie
			var oMultiInput1 = oView.byId("serie");
			oMultiInput1.addValidator(function(args) {
				var text = args.text;
				return new Token({
					key: text,
					text: text
				});
			});

			// Configurando Multi Input de Versión
			var oMultiInput3 = oView.byId("material");
			oMultiInput3.addValidator(function(args) {
				var text = args.text;
				return new Token({
					key: text,
					text: text
				});
			});
			//Creamos los parámetros
			var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);

			//Creamos los filtros
			var Filter1 = [];
			var Filter = [];

			Filter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "03");
			Filter1.push(Filter);
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/PRC_VEHICULOSSet", { //Entre comillas el EntitySet del metadata correspondiente
				method: "GET",
				filters: Filter1,
				urlParameters: {
					"search": "GET"
				},
				success: function(result) {
					var resultado = JSON.parse(result.results[0].Json);
					concesionario = resultado;
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(xhr.statusText);
				}
			});
			// Configuración del smarttable
			isMobile = sap.ui.Device.system.phone;
			if (isMobile) {
				tableuse = "tblVisualizarM";
				that.getView().byId("tblVisualizarT").setVisible(false);
				that.getView().byId("tblVisualizarM").setVisible(true);
			} else {
				tableuse = "tblVisualizarT";
				that.getView().byId("tblVisualizarT").setVisible(true);
				that.getView().byId("tblVisualizarM").setVisible(false);
				that.getView().byId("botonVolver").setVisible(false);
			}

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(99999);

			that.getView().byId("btnSiguiente").setEnabled(false);
			that.getView().byId("btnAnterior").setEnabled(false);
			this.getView().byId("tblVisualizarT").getTable().setMode("SingleSelectLeft");
//{+@WVF001	Busqueda en cuanto vuelva de la pagina ContinuarBeneficio		
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("home").attachMatched(function(oEvent) {
			if (gs_free == "Y" ){
				that.onSearchList();
                gs_free = "";	
			}
			});
//{+@WVF001	
		},
		onSearchingAgain: function(){//+@WVF001 Se llama cuando se halla realizado la grabacion en los beneficios
		  gs_free = "Y";	
		},
		onPressItem: function() {
			tableuse = "tblVisualizarT";

			this.getView().byId("tblVisualizarT").setVisible(true);
			this.getView().byId("botonVolver").setVisible(true);
			this.getView().byId("tblVisualizarM").setVisible(false);

			click = clk_t;
			this.goTo(click);

			if (click === 1) {
				this.getView().byId("btnAnterior").setEnabled(false);
			} else {
				this.getView().byId("btnAnterior").setEnabled(true);
			}

		},
		onVolver: function() {
			tableuse = "tblVisualizarM";

			this.getView().byId("tblVisualizarT").setVisible(false);
			this.getView().byId("botonVolver").setVisible(false);
			this.getView().byId("tblVisualizarM").setVisible(true);

			click = clk_m;
			this.goTo(click);

			if (click === 1) {
				this.getView().byId("btnAnterior").setEnabled(false);
			} else {
				this.getView().byId("btnAnterior").setEnabled(true);
			}

		},
		onNavBack: function() {
			window.history.back();
		},

		//RadioButton Disponible para Campaña
		onDisponible: function() {
			var items = ["fechainicio", "fechafinal", "idBtnDeleteCamp", "idBtnDataG", "Column1", "Column2", "Column3", "Column4"];
			for (var i = 0; i < items.length; i++) {
				this.getView().byId(items[i]).setVisible(false);
			}
			this.getView().byId("tblVisualizarT").setIgnoreFromPersonalisation(
				"Cmpgntxt,Motor,Fecdesad,Fecduareal,Color,Dias,Ubica,Vhvin,Avail,Statu,Fecven,Lifnr,Fecarri,Zzlibbloq,Observacion,Destino,Vapor,Cmpgn,PagoAnticipado"
			);
			this.getView().byId("tblVisualizarT").setRequestAtLeastFields(
				"Cmpgntxt,Motor,Fecdesad,Fecduareal,Color,Dias,Ubica,Vhvin,Avail,Statu,Fecven,Lifnr,Fecarri,Zzlibbloq,Observacion,Destino,Vapor,Cmpgn,PagoAnticipado"
			);
			//this.getView().byId("tblVisualizarT").getModel().refresh(true); -@WVF001
			this.getView().byId("idCbo").setVisible(true);
			this.getView().byId("idBtnSelectedCamp").setVisible(true);
			this.getView().byId("fechaini").setValue();
			this.getView().byId("fechafin").setValue();
			tipoRadioButton = 1;
		},
		//RadioButton Campañas Procesadas
		onCampania: function() {
			var items = ["fechainicio", "fechafinal", "Column1", "Column2", "Column3", "Column4", "idBtnDeleteCamp", "idBtnDataG"];
			for (var i = 0; i < items.length; i++) {
				this.getView().byId(items[i]).setVisible(true);
			}
			this.getView().byId("tblVisualizarT").setIgnoreFromPersonalisation(
				"Color,Dias,Ubica,Vhvin,Avail,Statu,Fecven,Lifnr,Fecarri,Zzlibbloq,Observacion,Destino,Vapor,Cmpgn,PagoAnticipado");
			this.getView().byId("tblVisualizarT").setRequestAtLeastFields(
				"Color,Dias,Ubica,Vhvin,Avail,Statu,Fecven,Lifnr,Fecarri,Zzlibbloq,Observacion,Destino,Vapor,Cmpgn,PagoAnticipado");
			//this.getView().byId("tblVisualizarT").getModel().refresh(true); -@WVF001
			this.getView().byId("idCbo").setVisible(false);
			this.getView().byId("idBtnSelectedCamp").setVisible(false);
			tipoRadioButton = 2;

		},
		// {+@WVF001 Nueva version del evento del radiobutton, de esta forma es llamada una sola vez
		onRBSelected: function(Event) {
			switch (Event.getParameters().selectedIndex) {
				case 0:
					this.onDisponible();
					break;
				case 1:
					this.onCampania();
					break;
			}

			gs_free = "X";
			if (isMobile) {
				that.getView().byId("tblVisualizarT").rebindTable();
				that.getView().byId("tblVisualizarM").rebindTable();
			} else {
				that.getView().byId("tblVisualizarT").rebindTable();
			}
			gs_free = "";
		},
		// }+@WVF001

		//Función cuando selecciono una fila del smarttable
		onChangeItem: function(event) {
			if (tipoRadioButton == 1) {
				var cont = that.getView().byId(tableuse).getTable().getSelectedItems();
				if (cont.length !== 0) {
					sap.ui.core.BusyIndicator.show();
					var MODEL = event.getSource().getSelectedItem().getBindingContext().getObject().Matnr;
					var COLOR = event.getSource().getSelectedItem().getBindingContext().getObject().Zzcolor;
					var ANHO_MOD = event.getSource().getSelectedItem().getBindingContext().getObject().ZzanoMod;
					var ANHO_FAB = event.getSource().getSelectedItem().getBindingContext().getObject().ZzanoFab;
					var filter = [];
					var filterPar;
					var jsonParametros = {
						"MODEL": MODEL,
						"COLOR": COLOR,
						"ANHO_MOD": ANHO_MOD,
						"ANHO_FAB": ANHO_FAB
					};
					jsonParametros = JSON.stringify(jsonParametros);

					filterPar = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, jsonParametros);
					filter.push(filterPar);

					var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "61");
					filter.push(filterId);
					var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
					oModel.read("/PRC_VEHICULOSSet", {
						method: "GET",
						filters: filter,
						urlParameters: {
							search: "GET"
						},
						success: function(result, status, xhr) {
							var resultado = JSON.parse(result.results[0].Json);
							var ItemsTrans = new JSONModel({
								"itemsTrans": resultado
							});
							that.getView().byId("idCbo").setModel(ItemsTrans, "resultado");
							sap.ui.core.BusyIndicator.hide(0);
						},
						error: function(xhr, status, error) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(xhr.statusText);
						},
					});
				}
			}
		},
		//Boton Seleccionar Campaña***********************************************************************
		onSeleccionarCampania: function(event) {
			var cont = that.getView().byId(tableuse).getTable().getSelectedItems();
			if (cont.length !== 0) {
				sap.ui.core.BusyIndicator.show();
				CAMPA = [];
				PEDIDO = [];
				var oTable = that.getView().byId(tableuse).getTable();
				var oSelectedItem = oTable.getSelectedItem();
				var index = oTable.indexOfItem(oSelectedItem);
				var DataST = DATAFORSELECT.results[index];

				var Serie = DataST.Serie;
				var Matnr = DataST.Matnr;
				var Model = DataST.Model;
				var Availtxt = DataST.Availtxt;
				var ZzanoFab = DataST.ZzanoFab;
				var Zzcolor = DataST.Zzcolor;
				var ZzcolorDesc = DataST.ZzcolorDesc;
				var Kunnr = DataST.Kunnr;
				var ZzanoMod = DataST.ZzanoMod;
				var Statut = DataST.Statut;
				var Zzlibbloqtxt = DataST.Zzlibbloqtxt;
				var Cmpgntxt = DataST.Cmpgntxt;
				var Motor = DataST.Motor;
				var Fecdesad = DataST.Fecdesad;
				Fecdesad = that.getfecha(Fecdesad);
				var Fecduareal = DataST.Fecduareal;
				Fecduareal = that.getfecha(Fecduareal);
				var Color = DataST.Color;
				var Dias = DataST.Dias;
				var Ubica = DataST.Ubica;
				var Vhvin = DataST.Vhvin;
				var Avail = DataST.Avail;
				var Statu = DataST.Statu;
				var Fecven = DataST.Fecven;
				Fecven = that.getfecha(Fecven);
				var Lifnr = DataST.Lifnr;
				var Fecarri = DataST.Fecarri;
				Fecarri = that.getfecha(Fecarri);
				var Zzlibbloq = DataST.Zzlibbloq;
				var Observacion = DataST.Observacion;
				var Destino = DataST.Destino;
				var Vapor = DataST.Vapor;
				var Cmpgn = DataST.Cmpgn;
				var PagoAnticipado = DataST.PagoAnticipado;

				var data = {
					"Serie": Serie,
					"Matnr": Matnr,
					"Model": Model,
					"Availtxt": Availtxt,
					"ZzanoFab": ZzanoFab,
					"Zzcolor": Zzcolor,
					"ZzcolorDesc": ZzcolorDesc,
					"Kunnr": Kunnr,
					"ZzanoMod": ZzanoMod,
					"Statut": Statut,
					"Zzlibbloqtxt": Zzlibbloqtxt,
					"Cmpgntxt": Cmpgntxt,
					"Motor": Motor,
					"Fecdesad": Fecdesad,
					"Fecduareal": Fecduareal,
					"Color": Color,
					"Dias": Dias,
					"Ubica": Ubica,
					"Vhvin": Vhvin,
					"Avail": Avail,
					"Statu": Statu,
					"Fecven": Fecven,
					"Lifnr": Lifnr,
					"Fecarri": Fecarri,
					"Zzlibbloq": Zzlibbloq,
					"Observacion": Observacion,
					"Destino": Destino,
					"Vapor": Vapor,
					"Cmpgn": Cmpgn,
					"PagoAnticipado": PagoAnticipado
				};
				data = JSON.stringify(data);

				var key = that.getView().byId("idCbo").getSelectedItem().getKey();
				var text = that.getView().byId("idCbo").getSelectedItem().getText();
				var jsonParametros = {
					"cmpgn": key,
					"cmpgntxt": text,
				};
				jsonParametros = JSON.stringify(jsonParametros);

				var filter = [];
				var filterPar;
				filterPar = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, jsonParametros);
				filter.push(filterPar);

				filterPar = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.EQ, data);
				filter.push(filterPar);

				var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "64");
				filter.push(filterId);
				var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
				oModel.read("/PRC_VEHICULOSSet", {
					method: "GET",
					filters: filter,
					urlParameters: {
						search: "GET"
					},
					success: function(result, status, xhr) {
						var resultado = JSON.parse(result.results[0].Json);
						var campa = new JSONModel(resultado.campa);
						var benef = new JSONModel(resultado.benef);
						if (resultado.return.length > 0) {
							if (resultado.return[0].type == "E") {
								MessageBox.error(resultado.return[0].message);
							}
						} else {
							CAMPA = resultado.campa;
							PEDIDO = resultado.pedid;

							that._oDialog6 = sap.ui.xmlfragment("idDetBenf", "sap.ui.veh_campanias.fragment.DetalleBeneficio", that);
							sap.ui.getCore().byId("idDetBenf--tbBene2").setModel(campa);

							if (resultado.benef.length > 0) {
								sap.ui.getCore().byId("idDetBenf--tbBeneOtor").setVisible(true);
								sap.ui.getCore().byId("idDetBenf--tbBeneOtor").setModel(benef);
							}
							that._oDialog6.open();
						}

						sap.ui.core.BusyIndicator.hide(0);
					},
					error: function(xhr, status, error) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(xhr.statusText);
					},
				});
			}
		},
		//FECHA VALIDACIÓN
		getfecha: function(fecha) {
			if (fecha != "" && fecha != null) {
				var valueDate = fecha;
				var d = new Date(valueDate);
				d.setDate(d.getDate() + 1);
				d = d.toLocaleDateString();
				var parts = d.split('/');
				if (parts[0] < 10) parts[0] = '0' + parts[0];
				if (parts[1] < 10) parts[1] = '0' + parts[1];
				return parts[0] + '.' + parts[1] + '.' + parts[2];
			} else {
				return "";
			}
		},
		//Boton Continuar Detalle Beneficio
		onContinuar: function() {
			sap.ui.core.BusyIndicator.show();
			var filter = [];
			var filterPar;
			var newCampa = [];
			var checktb = '';
			// if(checktb == 'X'){
			var TBCHECK = sap.ui.getCore().byId("idDetBenf--tbBene2").getItems();
			$.each(CAMPA, function(key, item) {
				var checknew = '';
				var valor = TBCHECK[key].mAggregations.cells[1].mProperties.selected;
				if (valor == true) {
					checknew = 'X';
				} else {
					checknew = '';
				}
				var element = {
					"descripcion": item.descripcion,
					"fec_crea": item.fec_crea,
					"fec_sol_ben": item.fec_sol_ben,
					"id_beneficio": item.id_beneficio,
					"marca_ben": checknew,
					"status": item.status,
					"usuario": item.usuario,
					"vhcle": item.vhcle
				};
				newCampa.push(element);
			});
			filterPar = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, JSON.stringify(newCampa));
			filter.push(filterPar);

			filterPar = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.EQ, JSON.stringify(PEDIDO));
			filter.push(filterPar);

			var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "65");
			filter.push(filterId);
			var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
			oModel.read("/PRC_VEHICULOSSet", {
				method: "GET",
				filters: filter,
				urlParameters: {
					search: "GET"
				},
				success: function(result, status, xhr) {
					var resultado = JSON.parse(result.results[0].Json);
					if (resultado.return.length > 0) {
						sap.m.MessageBox.error(resultado.return[0].message);
					} else {
						localStorage["detalleCampania"] = result.results[0].Json;
						localStorage["newCampa"] = JSON.stringify(newCampa);
						CAMPA = [];
						PEDIDO = [];
						that._oDialog6.destroy();
						var VistaContinuar = that.getOwnerComponent().getRouter();
						VistaContinuar.navTo("continuarb");
					}
					sap.ui.core.BusyIndicator.hide(0);
				},
				error: function(xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(xhr.statusText);
				},
			});
			// }     
		},
		//Boton Cerrar Detalle Beneficio
		onCerrarDetalle: function() {
			this._oDialog6.destroy();
			CAMPA = [];
			PEDIDO = [];
		},

		//Boton Visualizar Campaña***********************************************************************
		onVisualizarCabecera: function() {
			var index = this.getView().byId(tableuse).getTable().getSelectedItems();
			if (index.length > 0) {
				var Cells = index[0].mAggregations.cells;
				var Vhcle = Cells[0].mProperties.text;
				sap.ui.core.BusyIndicator.show(0); // mostrando la barra de Busy
				var jsonParametros = {
					"Vhcle": Vhcle
				};
				jsonParametros = JSON.stringify(jsonParametros);

				var Filter1 = [];
				var Filter = [];
				Filter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "60");
				Filter1.push(Filter);
				Filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, jsonParametros);
				Filter1.push(Filter);
				var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
				oModel.read("/PRC_VEHICULOSSet", {
					method: "GET",
					filters: Filter1,
					urlParameters: {
						"search": "GET"
					},
					success: function(result, status, xhr) {
						var result = JSON.parse(result.results[0].Json);
						var DataCab1 = new JSONModel(result.e_camp);
						var DataCab2 = new JSONModel(result.e_ped);
						that._oDialog7 = sap.ui.xmlfragment("sap.ui.veh_campanias.fragment.VisualizarCabecera", that);
						//Van todas los métodos antes de abrir el diálogo
						sap.ui.getCore().byId("Cabecera1").setModel(DataCab1);
						sap.ui.getCore().byId("Cabecera2").setModel(DataCab2);
						that._oDialog7.open();
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(xhr, status, error) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(xhr.statusText);
					},
				});
			} else {
				MessageBox.error("Debe Seleccionar una fila");
			}
		},
		onCerrarCabecera: function() {
			this._oDialog7.destroy();
		},
		//Botón Borrar Campaña*********************************************************************************
		onDeleteCampania: function() {
			var index = this.getView().byId(tableuse).getTable().getSelectedItems();
			if (index.length > 0) {
				sap.m.MessageBox.confirm("¿Está seguro que desea borrar la campaña?", {
					title: "Confirmación de Borrado",
					action: [sap.m.MessageBox.Action.Ok, sap.m.MessageBox.Action.CANCEL],
					onClose: function(sAction) {
						if (sAction !== "CANCEL") {
							var Cells = index[0].mAggregations.cells;
							var Serie = that.onCompleteFormat(Cells[0].mProperties.text, 10);
							var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);;
							//Creamos los filtros
							var Filter1 = [];
							var Filter = [];
							Filter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "68");
							Filter1.push(Filter);

							Filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, Serie);
							Filter1.push(Filter);
							sap.ui.core.BusyIndicator.show(0); // mostrando la barra de Busy
							oModel.read("/PRC_VEHICULOSSet", { //Entre comillas el EntitySet del metadata correspondiente
								method: "GET",
								filters: Filter1,
								urlParameters: {
									"search": "GET"
								},
								success: function(result) {
									sap.ui.core.BusyIndicator.hide();
									var resultado = JSON.parse(result.results[0].Json);
									if (resultado[0].type == "E") {
										sap.m.MessageBox.error(resultado[0].message);
									} else if (resultado[0].type == "S") {
										sap.m.MessageBox.success(resultado[0].message);
									}
								},
								error: function(xhr, status, error) {
									sap.ui.core.BusyIndicator.hide();
									MessageBox.error(xhr.statusText);
								},
							});
						}
					}
				});
			} else {
				MessageBox.error("Debe Seleccionar una fila");
			}
		},
		//Abrir ventana de la busqueda de Serie**********************************************************************
		buscaSerie: function() {
			this._oDialog9 = sap.ui.xmlfragment("diagSerie", "sap.ui.veh_campanias.fragment.Serie", this);
			this._oDialog9.open();
		},
		BuscarSerie: function() {
			sap.ui.core.BusyIndicator.show(0); // mostrando la barra de Busy

			var tokenSeries = sap.ui.getCore().byId("diagSerie--codigo").getTokens();
			var material = sap.ui.getCore().byId("diagSerie--material").getValue();
			var descripcion = sap.ui.getCore().byId("diagSerie--descripcion").getValue();
			var nreg = sap.ui.getCore().byId("diagSerie--cantidad").getSelectedKey();
			var PI_SERIE = [];
			var filter = [];
			var filterPar;

			var serieTmp = tokenSeries.map(function(c) {
				return c.getKey();
			});

			// Esctructura de numeros de serie
			$.each(serieTmp, function(index, item) {
				var elemento = {
					'SIGN': 'I',
					'OPTION': "EQ",
					'LOW': item
				};
				PI_SERIE.push(elemento);
			});

			// Esctructura de materiales
			if (material != "") {
				var PI_MATNR = [{
					'SIGN': 'I',
					'OPTION': "EQ",
					'LOW': material
				}];
			} else {
				var PI_MATNR = [];
			}

			// Estructura a enviar en servicio
			var datos = {
				'|PI_MAKTX': descripcion,
				'|PI_NREG': nreg,
				'|PI_SERIE': PI_SERIE,
				'|PI_MATNR': PI_MATNR
			};

			filterPar = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, JSON.stringify(datos));
			filter.push(filterPar);

			var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "06");
			filter.push(filterId);

			// Obteniendo los datos del servicio odata
			var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);

			//EntitySet es el entityset del metadata 
			oModel.read("/PRC_VEHICULOSSet", {
				method: "GET",
				filters: filter,
				success: function(result, status, xhr) {
					var rpta = JSON.parse(result.results[0].Json);

					var oModel = new JSONModel(rpta);
					var oTable = sap.ui.getCore().byId("diagSerie--tbBusqueda");
					oTable.setModel(oModel);

					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(xhr.statusText);
				},
				urlParameters: {
					search: "POST"
				}

			});
		},
		//Seleccionar serie de la búsqueda
		seleccionarSerie: function() {
			var oTable = sap.ui.getCore().byId("diagSerie--tbBusqueda");
			var tokenTmp = [];
			var contexts = oTable.getSelectedContexts();

			if (contexts.lenght != 0) {
				var items = contexts.map(function(c) {
					return c.getObject();
				});

				var oView = this.getView();
				var oMultiInput1 = oView.byId("serie");

				$.each(items, function(index, item) {
					oMultiInput1.addToken(new Token({
						text: parseInt(item.vhcle),
						key: parseInt(item.vhcle)
					}));
				});

				this._oDialog9.destroy();
			} else {
				sap.m.MessageBox.error("Debe seleccionar por lo menos una serie");
			}
		},
		//Cerrar ventana de la busqueda de serie
		cancelarBuscarSerie: function() {
			this._oDialog9.destroy();
		},
		//Abrir ventana de la busqueda de Versión**********************************************************************
		onFiltroMaterial: function() {
			this._oDialog8 = sap.ui.xmlfragment("xmlFilterMaterial", "sap.ui.veh_campanias.fragment.FiltroMaterial", this);
			this._oDialog8.open();
		},
		onSearchMat: function() {
			var desc = sap.ui.getCore().byId("xmlFilterMaterial--desc").getValue();
			var material = sap.ui.getCore().byId("xmlFilterMaterial--material").getValue();
			var range1 = sap.ui.getCore().byId("xmlFilterMaterial--range1").getValue();
			var range2 = sap.ui.getCore().byId("xmlFilterMaterial--range2").getValue();
			var cant = sap.ui.getCore().byId("xmlFilterMaterial--CantMat").getValue();
			var filters = [];
			var filter;

			var datajs = [];
			var datasend = "";
			var typeFilter = "EQ";

			if (cant == "" || cant == 0 || cant.includes("e")) {
				sap.ui.getCore().byId("xmlFilterMaterial--CantMat").setValue("500");
				cant = 500;
			}

			if (range1 != "" && range2 != "") {
				typeFilter = "BT";
				range1 = range1;
				range2 = range2;
			} else if (material != "") {
				if (material.includes("*")) {
					typeFilter = "CP";
					range1 = material;
				} else {
					range1 = material;
					typeFilter = "EQ";
				}
				range2 = "";
			} else if (desc == "") {
				MessageBox.information("Ingrese los filtros");
				return;
			}

			if (range1 != "" || range2 != "")
				datajs = [{
					"SIGN": "I",
					"OPTION": typeFilter,
					"LOW": range1,
					"HIGH": range2
				}];
			datasend = JSON.stringify(datajs);

			sap.ui.core.BusyIndicator.show();

			filters = [];

			filter = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "06");

			filters.push(filter);

			filter = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.EQ, datasend);

			filters.push(filter);

			var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal2, true);
			oModel.read("/ODATASet", {
				filters: filters,
				urlParameters: {
					"search": desc + "," + cant
				},
				success: function(result, status, xhr) {
					result = JSON.parse(result.results[0].Json);

					if (result[0].type === undefined) {
						var oModelJson = new sap.ui.model.json.JSONModel(result);
						sap.ui.getCore().byId("xmlFilterMaterial--tbFilterMaterial").setModel(oModelJson);
					} else {
						MessageBox.information(result[0].message);
						sap.ui.getCore().byId("xmlFilterMaterial--tbFilterMaterial").setModel(new JSONModel());
					}

					sap.ui.core.BusyIndicator.hide();
				},
				error: function(xhr, status, error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(xhr.statusText);
				},
			});

		},
		onAcceptMat: function() {
			var oTable = sap.ui.getCore().byId("xmlFilterMaterial--tbFilterMaterial");
			var tokenTmp = [];
			var contexts = oTable.getSelectedContexts();

			if (contexts.lenght != 0) {
				var items = contexts.map(function(c) {
					return c.getObject();
				});

				var oView = this.getView();
				var oMultiInput1 = oView.byId("material");

				$.each(items, function(index, item) {
					oMultiInput1.addToken(new Token({
						text: item.matnr,
						key: item.matnr
					}));
				});

				this._oDialog8.destroy();
			} else {
				sap.m.MessageBox.error("Debe seleccionar por lo menos un material");
			}
		},
		oEscape: function() {
			this._oDialog8.destroy();
		},
		//Funciones para la Paginación**************************************************************************
		onShow: function(oEvent) {
			click = 1;
			this.goTo(click);
		},
		goNext: function() {
			this.goTo(click += 1);
			if (tableuse == "tblVisualizarM") clk_m = click;
			else clk_t = click;

			if (click != 0) {
				this.getView().byId("btnAnterior").setEnabled(true);
			} else {
				this.getView().byId("btnAnterior").setEnabled(false);
			}
		},
		goPrevious: function() {
			this.goTo(click -= 1);

			if (tableuse == "tblVisualizarM") clk_m = click;
			else clk_t = click;

			if (click <= 1) {
				this.getView().byId("btnAnterior").setEnabled(false);
			} else {
				this.getView().byId("btnAnterior").setEnabled(true);
			}
		},
		goTo: function(oClick) {
			var oSelectItem = this.getView().byId("sShow").getSelectedKey();
			var oTable = this.getView().byId(tableuse).getTable().getItems();
			var oTotal = oTable.length;
			var oShow = Math.ceil(oTotal / oSelectItem);

			if (oClick <= oShow) {

				if (oShow == oClick) {
					this.getView().byId("btnSiguiente").setEnabled(false);
				} else {
					this.getView().byId("btnSiguiente").setEnabled(true);
				}

				this.range(oSelectItem * (oClick - 1), (oSelectItem * oClick) - 1, oTable);
			}

			if (oClick <= 1) {
				this.getView().byId("btnAnterior").setEnabled(false);
			}
		},
		range: function(oInit, oEnd, oData) {
			$.each(oData, function(key, item) {

				var sId = item.sId;

				if (key >= oInit && key <= oEnd) {
					sap.ui.getCore().byId(sId).setVisible(true);
				} else {
					sap.ui.getCore().byId(sId).setVisible(false);
				}

			});
		},
		onLoadT: function(oEvent) { //Evento se activa cuando trae data el smart table desktop
			var tblcant = this.getView().byId(tableuse).getTable().getItems().length;

			if (tblcant == 0) {
				this.getView().byId("btnSiguiente").setEnabled(false);
				this.getView().byId("btnAnterior").setEnabled(false);
			} else {
				this.getView().byId("btnSiguiente").setEnabled(true);
				this.getView().byId("btnAnterior").setEnabled(true);
			}
			this.goTo(click);
			if (click == 1) this.getView().byId("btnAnterior").setEnabled(false);
			else this.getView().byId("btnAnterior").setEnabled(true);
			DATAFORSELECT = oEvent.getParameters().getParameter('data');
			var array = ["Column1", "Column2", "Column3", "Column4"];
			for (var i = 0; i < array.length; i++) {
				this.getView().byId(array[i]).setVisible(false);
			}
			sap.ui.core.BusyIndicator.hide(0);
		},
		onLoadM: function(oEvent) { //Evento se activa cuando trae data el smart table mobile
			sap.ui.core.BusyIndicator.hide(0);
			var tblcant = this.getView().byId(tableuse).getTable().getItems().length;

			if (tblcant == 0) {
				this.getView().byId("btnSiguiente").setEnabled(false);
				this.getView().byId("btnAnterior").setEnabled(false);
			} else {
				this.getView().byId("btnSiguiente").setEnabled(true);
				this.getView().byId("btnAnterior").setEnabled(true);
			}
			this.goTo(click);

			if (click == 1) this.getView().byId("btnAnterior").setEnabled(false);
			else this.getView().byId("btnAnterior").setEnabled(true);
		},
		onBeforeTBL: function(oEvent) {
			var fdesde = that.getView().byId("fechaini").getValue();
			var fhasta = that.getView().byId("fechafin").getValue();
			var rbtn1 = that.getView().byId("idDisponibles").getSelected();
			var rbtn2 = that.getView().byId("idProcesadas").getSelected();
			var serie = that.getView().byId("serie").getTokens();
			var version = that.getView().byId("material").getTokens();

			var vVacio = [{}];
			var Puvacio = new JSONModel({
				"itemsTrans": vVacio
			});
			that.getView().byId("idCbo").setModel(Puvacio, "resultado");

			// var vVacio = [];
			// var Puvacio = new JSONModel(vVacio);
			// that.getView().byId("visualizarTable").setModel(Puvacio);

			if (fdesde === null) {
				fdesde = "";
			}
			if (fhasta === null) {
				fhasta = "";
			}

			var serieTmp = serie.map(function(c) {
				return c.getKey();
			});
			var versionTmp = version.map(function(c) {
				return c.getKey();
			});

			var color = "";
			if (rbtn1 == true) {
				color = "1";
			} else if (rbtn2 == true) {
				color = "2";
			} else {
				color = "";
			}

			if (serie.length == 1) {
				var aFilter = [{
					"MATNR": versionTmp,
					"COLOR": color,
					"VHCLE": serieTmp[0],
					"KUNNR": concesionario,
					"FECVED": fdesde,
					"FECVEH": fhasta,
					"VHCLES": "",
					"FREE": gs_free
				}];
			} else {
				var aFilter = [{
					"MATNR": versionTmp,
					"COLOR": color,
					"VHCLE": "",
					"KUNNR": concesionario,
					"FECVED": fdesde,
					"FECVEH": fhasta,
					"VHCLES": serieTmp,
					"FREE": gs_free
				}];
			}
			oEvent.mParameters.bindingParams.parameters.custom = {
				"search": window.btoa(JSON.stringify(aFilter))
			};

		},
		onSearchList: function() {
			
			sap.ui.core.BusyIndicator.show();
			var array = ["Column1", "Column2", "Column3", "Column4"];
			for (var i = 0; i < array.length; i++) {
				this.getView().byId(array[i]).setVisible(true);
			}
			if (isMobile) {
				that.getView().byId("tblVisualizarT").rebindTable();
				that.getView().byId("tblVisualizarM").rebindTable();
			} else {
				that.getView().byId("tblVisualizarT").rebindTable();
			}
		},
		onClean: function() {
			that.getView().byId("fechaini").setValue();
			that.getView().byId("fechafin").setValue();
			that.getView().byId("material").removeAllTokens();
			that.getView().byId("serie").removeAllTokens();
			that.getView().byId("idDisponibles").setSelected(false);
			that.getView().byId("idProcesadas").setSelected(false);
			var vVacio = [{}];
			var Puvacio = new JSONModel({
				"itemsTrans": vVacio
			});
			that.getView().byId("idCbo").setModel(Puvacio, "resultado");
			gs_free = "X"; //+@WVF001 se envia el flaga de limpeiza del smarttable
			if (isMobile) {
				that.getView().byId("tblVisualizarT").rebindTable();
				that.getView().byId("tblVisualizarM").rebindTable();
			} else {
				that.getView().byId("tblVisualizarT").rebindTable();
			}
		},
		//COMPLETO DE FORMATO DE CEROS
		onCompleteFormat: function(txt, cant) {
			var rtn = "";
			var cycles = cant - txt.length;
			for (var i = 0; i < cycles; i++) {
				rtn += "0";
			}
			return rtn + txt;
		}
	});
});