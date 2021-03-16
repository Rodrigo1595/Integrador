sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "EjIntegrador1/EjIntegrador1/util/Services",
        "EjIntegrador1/EjIntegrador1/util/Constants",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "EjIntegrador1/EjIntegrador1/util/Formatter"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller,JSONModel,Services,Constants,MessageBox,Filter,FilterOperator,Formatter) {
		"use strict";

		return Controller.extend("EjIntegrador1.EjIntegrador1.controller.mainIntegrador", {
            //Inicializar Formatter
            Formatear:Formatter,

            // Cargar apenas abra la pagina
			onInit: function () {
                this.loadModelBase();
            },
            
            loadModelBase: async function(){
                //Crear modelo con promesa asincrona
                //Usar component para mas detallado
                var oComponent = this.getOwnerComponent();
                const oResponse = await Services.getLocalJSON(Constants.routes.JSON.productos);
                const oData = oResponse[0];
                var oNameModel = new JSONModel();
                oNameModel.setData(oData);
                oComponent.setModel(oNameModel,Constants.model.modeloProductos);

            },

            onPressBuscar: function(){
                //Llamar Fragment para buscar x id
                let sFragmentId = this.getView().createId(Constants.ids.FRAGMENTS.frTabla);
                //Ingresar datos al modelo de filtrado
                let oFiltros = {
                    Fecha:sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.filtroFecha).getValue(),
                    Proveedor:sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.filtroProveedor).getValue(),
                    Pais:sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.filtroPais).getValue()
                };

                //Modelo para guardar Filtros pasar a JSON
                let oModelFiltros = new JSONModel(oFiltros);
                //Setear
                this.getOwnerComponent().setModel(oModelFiltros,Constants.model.modeloFiltros);

                //Obtener datos desde el modelo
                let oFiltrado = this.getView().getModel(Constants.model.modeloFiltros).getData();

                //Crear Bundle con i18n para mostrar en messagealert
                let oBundleFecha= this.getOwnerComponent().getModel(Constants.model.I18n).getResourceBundle().getText("messageBoxFecha");
                let oBundleProveedor = this.getOwnerComponent().getModel(Constants.model.I18n).getResourceBundle().getText("messageBoxProveedor");
                let oBundlePais = this.getOwnerComponent().getModel(Constants.model.I18n).getResourceBundle().getText("messageBoxPais");
                
                //Message Box con la informacion
                MessageBox.information(` ${oBundleFecha} : ${oFiltrado.Fecha}
                ${oBundleProveedor}: ${oFiltrado.Proveedor}
                ${oBundlePais}: ${oFiltrado.Pais}`);

                //Hacer la tabla visible con los resultados
                sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.tablaValores).setVisible(true);

            },

            onChangeBuscar: function(evento){
                //Array para bindear filtros
                var aFilters = [];
                //Valor de la query al momento del evento
                var sQuery = evento.getSource().getValue();

                if(sQuery && sQuery.length > 0){
                    //Agregar filtros y pushearlos al array segun corresponda
                    var oFilter = new Filter(Constants.ids.JSON.producto, FilterOperator.Contains, sQuery);
                    aFilters.push(oFilter);
                    var oFilter = new Filter(Constants.ids.JSON.proveedor, FilterOperator.Contains, sQuery);
                    aFilters.push(oFilter);
                    //Aqui se recopilan todos los filtros de los array anteriores
                    var oFilters = new Filter(aFilters);
                    
                }
                let sFragmentId = this.getView().createId(Constants.ids.FRAGMENTS.frTabla);
                var oTable = sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.tablaValores)
                //Seleccionar items a vincular
                var oBindingInfo = oTable.getBinding("items");
                //Entregar Filtro para los items
                oBindingInfo.filter(oFilters,Constants.ids.FRAGMENTS.bindingFiltro);

                
            },

            onPressCell: function(oEvent){

                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext(Constants.model.modeloProductos);
                var oModel = this.getView().getModel(Constants.model.modeloProductos);
                var oProductoSeleccionado = oModel.getProperty(oBindingContext.getPath());
                console.log(oProductoSeleccionado);
                var oModel = new JSONModel(oProductoSeleccionado);
                
                this.getView().setModel(oModel,Constants.model.modeloDialog);


                if (!this._oFragment) {
                this._oFragment = sap.ui.xmlfragment(Constants.ids.FRAGMENTS.idDialog , Constants.routes.FRAGMENTS.dialogClick, this);
                this.getView().addDependent(this._oFragment);
                     }
                this._oFragment.open();
            
            },

            onCloseDialog: function(){
                this._oFragment.close();
            },

            cambiarIdioma: function(){
                if(sap.ui.getCore().getConfiguration().getLanguage() == 'EN'){
                     sap.ui.getCore().getConfiguration().setLanguage("ES")
                }else{
                    //Setear lenguaje al español si esta en ingles.
                    sap.ui.getCore().getConfiguration().setLanguage("EN")
                }
            }

		});
	});
