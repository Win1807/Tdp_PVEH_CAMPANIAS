jQuery.sap.require("sap.ui.veh_campanias.util.Formatter");

sap.ui.define([
   "sap/ui/veh_campanias/controller/BaseController",
   "sap/m/MessageBox",
   "sap/m/Token",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/Sorter",
  "sap/ui/core/format/DateFormat"
], function (BaseController, MessageBox, Token, JSONModel, Sorter, DateFormat) {
    "use strict";
    var oView;
    var that;
    var urlGlobal = "/DEV_TO_ODVIATICOS/odata/SAP/ZSCP_VEHICULOS_SRV";
    // var urlGlobal = "https://gwaas-d85e9224f.us2.hana.ondemand.com/odata/SAP/ZSCP_VEHICULOS_SRV";
    var urlGlobal2 = "/ODATA_Repuestos/odata/SAP/ZSCP_REPUESTOS_SRV/";
    // var urlGlobal2 = "https://gwaas-d85e9224f.us2.hana.ondemand.com/odata/SAP/ZSCP_REPUESTOS_SRV";
    return BaseController.extend("sap.ui.veh_campanias.controller.ContinuarBeneficio", {

        onInit : function () {
            oView = this.getView();
            that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            sap.ui.core.BusyIndicator.show();
            oRouter.getRoute("continuarb").attachMatched(function(oEvent) {
                var myModel = that.getOwnerComponent().getModel();
                myModel.setSizeLimit(99999);
                var result = JSON.parse(localStorage["detalleCampania"]);
                if(result.nodo_vis == "1"){
                    oView.byId("FormGIFCARD").setVisible(false);
                }else{
                    oView.byId("FormGIFCARD").setVisible(true);
                }

                var array = ["idNIF", "idApePat", "idNombres", "idApeMat", "idFecVenMen", "idRBG", "idFacMen"];
                if(result.read_only == "1"){
                    for(var i = 0; i < array.length; i++){
                        oView.byId(array[i]).setEnabled(false);
                    }
                }else{
                    for(var i = 0; i < array.length; i++){
                        oView.byId(array[i]).setEnabled(true);
                    }
                }
                var Data = result.camp[0];

                oView.byId("idCampania").setText(Data.cmpgntxt);
                oView.byId("idMaterial").setText(Data.matnr);
                oView.byId("idFecIni").setText(that.getfecha(Data.zzfech_inicio));
                oView.byId("idFecVenta").setText(that.getfecha(Data.zfec_vta_may));

                var serie = that.borrar0izalfanumerico(Data.charg);
                oView.byId("idLote").setText(serie);
                oView.byId("idFecFin").setText(that.getfecha(Data.zzfech_fin));
                if(Data.zfech_vta_men == "00000000"){var fecvtamen = "";}else{var fecvtamen = Data.zfech_vta_men;};
                oView.byId("idFecVenMen").setValue(fecvtamen);
                oView.byId("idNIF").setValue(Data.stcd1);

                oView.byId("idFacMen").setValue(Data.zfact_menor);

                var check = 0;
                if(Data.tip_doc == "1"){
                    check = 0;
                        oView.byId("idApeMat").setVisible(true);
                        oView.byId("idApePat").setVisible(true);
                        oView.byId("idApeMat").setValue(Data.secondname);
                        oView.byId("idApePat").setValue(Data.lastname);
                        oView.byId("idNombres").setValue(Data.firstname);
                }else if(Data.tip_doc == "2"){
                    check = 1;
                        oView.byId("idApeMat").setVisible(false);
                        oView.byId("idApePat").setVisible(false);
                        oView.byId("idNombres").setValue(Data.firstname);
                }else if(Data.tip_doc == "3"){
                    check = 2;
                        oView.byId("idApeMat").setVisible(true);
                        oView.byId("idApePat").setVisible(true);
                        oView.byId("idApeMat").setValue(Data.secondname);
                        oView.byId("idApePat").setValue(Data.lastname);
                        oView.byId("idNombres").setValue(Data.firstname);
                }else{
                    oView.byId("idApeMat").setVisible(true);
                    oView.byId("idApePat").setVisible(true);
                    check = 0;
                }
                oView.byId("idRBG").setSelectedIndex(check);

            });
            sap.ui.core.BusyIndicator.hide(0);
        },
        getfecha : function(fecha){
            var date1 = fecha;
            if(date1 != "" && date1 != null){
              return date1.substring(6,8) + "." + date1.substring(4,6) + "." + date1.substring(0,4);
            }else{
              return "";
            }
        },
        //Función para botón Nuevo Beneficiario
        onBeneficio: function(){
            var button = oView.byId("idRBG").getSelectedIndex();
            if(button === 0){
                oView.byId("idRBDni").setSelected(true);
            }else if(button === 2){
                oView.byId("idRBCarnet").setSelected(true);
            }else{
                oView.byId("idRBDni").setSelected(false);
                oView.byId("idRBCarnet").setSelected(false);
            }
            oView.byId("idNIF2").setValue(oView.byId("idNIF").getValue());
            oView.byId("idApePat2").setValue(oView.byId("idApePat").getValue());
            oView.byId("idApeMat2").setValue(oView.byId("idNombres").getValue());
            oView.byId("idNombres2").setValue(oView.byId("idApeMat").getValue());
        },
        //Abrir departamentos************************************************************************
        openDepart: function(){
            var filter = [];

            var jsonParametros = {
                "tipo" : "2",
                "pais" : "PE"
            };
            jsonParametros = JSON.stringify(jsonParametros);

            var Filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, jsonParametros);
            filter.push(Filter);
            var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "66");
            filter.push(filterId);

            var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
            oModel.read("/PRC_VEHICULOSSet",{
                method: "GET",
                filters: filter,
                urlParameters: {
                search: "GET"
                },
                success: function(result, status, xhr){
                    var resultado = JSON.parse(result.results[0].Json);
                    that._oDialogDept = sap.ui.xmlfragment("idDepart", "sap.ui.veh_campanias.fragment.Departamentos", that);
                    var model = new JSONModel(resultado);
                    sap.ui.getCore().byId("idDepart--tbDepartamentos").setModel(model);
                    var myModel = that.getOwnerComponent().getModel();
                    myModel.setSizeLimit(99999);
                    that._oDialogDept.open();
                    sap.ui.core.BusyIndicator.hide(0);
                },
                error: function(xhr,status,error){
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(xhr.statusText);
                  },
            });
        },
        onChangeDepa: function(event){
            var Depa = event.getParameters().listItems[0].mAggregations.cells[0].mProperties.text;
            var Denominacion = event.getParameters().listItems[0].mAggregations.cells[1].mProperties.text;
            that._oDialogDept.destroy();
            oView.byId("idDepa").setValue(Depa);
            oView.byId("idDepaText").setText(Denominacion);
        },
        //Cerrar departamentos
        closeDepat: function(){
            this._oDialogDept.destroy();
        },
        //Abrir paises*******************************************************************************
        openPais: function(){
            sap.ui.core.BusyIndicator.show();
            var filter = [];

            var jsonParametros = {
                "tipo" : "1"
            };
            jsonParametros = JSON.stringify(jsonParametros);

            var Filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, jsonParametros);
            filter.push(Filter);

            var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "66");
            filter.push(filterId);
            
            var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
            oModel.read("/PRC_VEHICULOSSet",{
                method: "GET",
                filters: filter,
                urlParameters: {
                search: "GET"
                },
                success: function(result, status, xhr){
                    var resultado = JSON.parse(result.results[0].Json);
                    that._oDialogPais = sap.ui.xmlfragment("idPais", "sap.ui.veh_campanias.fragment.Pais", that);

                    var model = new JSONModel(resultado);
                    sap.ui.getCore().byId("idPais--tbPais").setModel(model);

                    var myModel = that.getOwnerComponent().getModel(); //Modelo mas de 100
                    myModel.setSizeLimit(99999);

                    sap.ui.core.BusyIndicator.hide(0);
                    that._oDialogPais.open(); //Abrir el díalogo
                },
                error: function(xhr,status,error){
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(xhr.statusText);
                  },
            });
        },
        onChangePais: function(event){
            var Pais = event.getParameters().listItems[0].mAggregations.cells[0].mProperties.text;
            that._oDialogPais.destroy();
            oView.byId("idPais").setValue(Pais);
        },
        onSearchPais: function(){
            var value = sap.ui.getCore().byId("idPais--idPais").getValue();
        },
        closePais: function(){
            this._oDialogPais.destroy();
        },
        //Cambio de botones en "Tip.Doc.Iden"
        onRB1: function(){
        	oView.byId("lblApePat").setVisible(true);
        	oView.byId("idApePat").setVisible(true);
        	oView.byId("lblApeMat").setVisible(true);
        	oView.byId("idApeMat").setVisible(true);
        },
        onRB2: function(){
        	oView.byId("lblApePat").setVisible(false);
        	oView.byId("idApePat").setVisible(false);
        	oView.byId("lblApeMat").setVisible(false);
        	oView.byId("idApeMat").setVisible(false);
        },
        onRB3: function(){
        	oView.byId("lblApePat").setVisible(true);
        	oView.byId("idApePat").setVisible(true);
        	oView.byId("lblApeMat").setVisible(true);
        	oView.byId("idApeMat").setVisible(true);
        },
        onRBCarnet: function(){
        	oView.byId("idBtnPaisN").setVisible(true);
        	oView.byId("idPais").setVisible(true);
        },
        onRBDNI: function(){
        	oView.byId("idBtnPaisN").setVisible(false);
        	oView.byId("idPais").setVisible(false);
        },
        onSave: function(){
            var result = JSON.parse(localStorage["detalleCampania"]);
            var Data = result.camp[0];
            var ZFECH_VTA_MEN = oView.byId("idFecVenMen").getValue();
            var ZFACT_MENOR = oView.byId("idFacMen").getValue();
            var FIRSTNAME = oView.byId("idNombres").getValue();
            var LASTNAME = oView.byId("idApePat").getValue();
            var SECONDNAME = oView.byId("idApeMat").getValue();
            var TIP_DOC = oView.byId("idRBG").getSelectedIndex();
            var check = 0;
            var thes = this;
            if(TIP_DOC == 0){
                check = 1;
            }else if(TIP_DOC == 1){
                check = 2;
            }else if(TIP_DOC == 2){
                check = 3;
            }
            var STCD1 = oView.byId("idNIF").getValue();
            var BIRTHNAME = oView.byId("idFecNacimiento").getValue();
            var IMPORTEAB = oView.byId("idImporte").getValue();
            var TELF1 = oView.byId("idTelContaco").getValue();
            var DIRECCION = oView.byId("idDireccion").getValue();
            var PROVINCIA = oView.byId("idProvincia").getValue();
            var DEPARTAMENTO = oView.byId("idDepaText").getText();
            var OFREMISION = oView.byId("idOficina").getValue();
            var DISTRITO = oView.byId("idDistrito").getValue();
            var CODPAIS = oView.byId("idPaisButton").getValue();
            var CODDEPA = oView.byId("idDepa").getValue();
            var TIP_DOC2 = 0;
            if(oView.byId("idRBDni").getSelected() == true){
                TIP_DOC2 = 1;
            }else if(oView.byId("idRBCarnet").getSelected() == true){
                TIP_DOC2 = 2;
            }

            var NICKNAME = oView.byId("idNombres2").getValue();
            var BIRTHNAME2 = oView.byId("idApeMat2").getValue();
            var MIDDLENAME = oView.byId("idApePat2").getValue();
            var EMPLOYER = oView.byId("idNIF2").getValue();
            var NATIONALITY = "";
            if(oView.byId("idRBDni").getSelected() == true){
                NATIONALITY = "";
            }else if(oView.byId("idRBCarnet").getSelected() == true){
                NATIONALITY = oView.byId("idPais").getValue();
            }
            var FirstData = [{
                "CMPGN" : Data.cmpgn,
                "CMPGNTXT" : Data.cmpgntxt,
                "MATNR" : Data.matnr,
                "MODEL" : Data.model,
                "CHARG" : Data.charg,
                "ZFECH_VTA_MEN" : ZFECH_VTA_MEN,
                "ZFEC_VTA_MAY" : Data.zfec_vta_may,
                "ZFACT_MENOR" : ZFACT_MENOR,
                "FIRSTNAME" : FIRSTNAME,
                "LASTNAME" : LASTNAME,
                "SECONDNAME" : SECONDNAME,
                "TIP_DOC" : check,
                "STCD1" : STCD1,
                "BIRTHNAME" : BIRTHNAME,
                "IMPORTEAB" : IMPORTEAB,
                "TELF1" : TELF1,
                "DIRECCION" : Data.direccion,
                "CIUDAD" : Data.ciudad,
                "PROVINCIA" : PROVINCIA,
                "DEPARTAMENTO" : DEPARTAMENTO,
                "OFREMISION" : OFREMISION,
                "DISTRITO" : DISTRITO,
                "ZZFECH_INICIO" : Data.zzfech_inicio,
                "ZZFECH_FIN" : Data.zzfech_fin,
                "CODPAIS" : CODPAIS,
                "CODDEPA" : CODDEPA,
                "TIP_DOC2" : TIP_DOC2,
                "NICKNAME" : NICKNAME,
                "BIRTHNAME2" : BIRTHNAME2,
                "MIDDLENAME" : MIDDLENAME,
                "EMPLOYER" : EMPLOYER,
                "DIR_LARGA" : DIRECCION,
                "NATIONALITY" : NATIONALITY,
                "RAZ_SOC" : Data.raz_soc
            }];
            var SecondData = JSON.parse(localStorage["newCampa"]);
            var result = JSON.parse(localStorage["detalleCampania"]);

            sap.ui.core.BusyIndicator.show();
            var filter = [];

            var Filter = new sap.ui.model.Filter("Parametros", sap.ui.model.FilterOperator.EQ, JSON.stringify(FirstData));
            filter.push(Filter);

            var Filter = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.EQ, JSON.stringify(SecondData));
            filter.push(Filter);

            var Filter = new sap.ui.model.Filter("Json", sap.ui.model.FilterOperator.EQ, result.nodo_vis);
            filter.push(Filter);

            var filterId = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, "67");
            filter.push(filterId);
            
            var oModel = new sap.ui.model.odata.v2.ODataModel(urlGlobal, true);
            oModel.read("/PRC_VEHICULOSSet",{
                method: "GET",
                filters: filter,
                urlParameters: {
                search: "GET"
                },
                success: function(result, status, xhr){
                    var resultado = JSON.parse(result.results[0].Json);
                    if(resultado[0].type == "E"){
                        sap.m.MessageBox.error(resultado[0].message);
                    }else if(resultado[0].type == "S"){
                        sap.m.MessageBox.success(resultado[0].message, {
                            onClose: function(){
                                var oRouter = thes.getOwnerComponent().getRouter();
                                sap.ui.controller("sap.ui.veh_campanias.controller.Home").onSearchingAgain();//+@WVF001
                                oRouter.navTo("home");
                                oView.byId("idApeMat").setValue();
                                oView.byId("idApePat").setValue();
                                oView.byId("idNombres").setValue();
                                oView.byId("idFecVenMen").setValue();
                                oView.byId("idNIF").setValue();
                                oView.byId("idFacMen").setValue();
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
                    }
                    sap.ui.core.BusyIndicator.hide(0);
                },
                error: function(xhr,status,error){
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(xhr.statusText);
                }
            });
        },
        onClose: function(){
            sap.ui.core.BusyIndicator.show();
            oView.byId("idRBG").setSelectedIndex(0);
            oView.byId("idApeMat").setValue();
            oView.byId("idApePat").setValue();
            oView.byId("idNombres").setValue();
            oView.byId("idFecVenMen").setValue();
            oView.byId("idNIF").setValue();
            oView.byId("idFacMen").setValue();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("home");
            sap.ui.core.BusyIndicator.hide(0);
           
        },
        borrar0izalfanumerico: function(valor){
            if(valor != null && valor != undefined && valor != ""){
                var val = valor;
                for (var i = 0; i < valor.length; i++) {
                    if(val.substr(0, 1) == 0){
                        val=val.substr(1, val.length-1);
                    }
                }
                return val;
            }else{
                return valor;
            }
        }        
    });
});