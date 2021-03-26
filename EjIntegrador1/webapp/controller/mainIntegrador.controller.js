sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "EjIntegrador1/EjIntegrador1/util/Services",
        "EjIntegrador1/EjIntegrador1/util/Constants",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "EjIntegrador1/EjIntegrador1/util/Formatter",
        'sap/m/library',
        'sap/ui/Device',
        'sap/ui/model/Sorter'
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller,JSONModel,Services,Constants,MessageBox,Filter,FilterOperator,Formatter,mLibrary,DeviceAcceleration,Sorter) {
		"use strict";

		return Controller.extend("EjIntegrador1.EjIntegrador1.controller.mainIntegrador", {
            //Inicializar Formatter
            Formatear:Formatter,

            // Cargar apenas abra la pagina
			onInit: function () {
                    this.loadModelBase();
                    this.Dialogs = {};
                // Inicializar la tabla grupos
                this.mGroupFunctions = {
                    Producto:function(oContext){
                        var sProducto = oContext.getProperty("Producto");
                    return{
                        key:sProducto,
                        text:sProducto
                        }
                    },

                    Proveedor:function(oContext){
                        var sProveedor = oContext.getProperty("Proveedor");
                    return{
                        key:sProveedor,
                        text:sProveedor
                        }
                    }
                }
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

                //Pasar Fragmento - Pasar id

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
            
            //Mostrar Dialog al clickear en celda
            onPressCell: function(oEvent){
                //Buscar el item por su fuente , recuperar el contexto de pegado,seleccionar el modelo y su propiedad. Pegarlo en un nuevo modelo
                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext(Constants.model.modeloProductos);
                var oModel = this.getView().getModel(Constants.model.modeloProductos);
                var oProductoSeleccionado = oModel.getProperty(oBindingContext.getPath());
                var oModel = new JSONModel(oProductoSeleccionado);
                
                this.getView().setModel(oModel,Constants.model.modeloDialog);
                //Abrir fragmento
                if (!this._oFragment) {
                this._oFragment = sap.ui.xmlfragment(Constants.ids.FRAGMENTS.idDialog , Constants.routes.FRAGMENTS.dialogClick, this);
                this.getView().addDependent(this._oFragment);
                     }
                this._oFragment.open();
            
            },

            //Cerrar Dialog-Fragment con informacion del producto en tabla
            onCloseDialog: function(){
                this._oFragment.close();
            },

            //Funcion cambiar idioma
            cambiarIdioma: function(){
                if(sap.ui.getCore().getConfiguration().getLanguage() == 'EN'){
                     sap.ui.getCore().getConfiguration().setLanguage("ES")
                }else{
                    //Setear lenguaje al español si esta en ingles.
                    sap.ui.getCore().getConfiguration().setLanguage("EN")
                }
            },

            /////////////////////////////////////           FILTROS           ///////////////////////////////////////////////////////////////
            
            // FILTRO SEARCHFIELD
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

            // Agregar configuracion de vista dialogo y opciones del dialogo de SORT / GROUPBY / Filtros
            createViewSettingsDialog: function(sDialogFragmentName){
                var oDialog;
                    //Setear Dialogo
                    oDialog = this.Dialogs[sDialogFragmentName];
                    //Si NO existe , crea un nuevo dialogo y le asigna la propiedad del dialogo el cual proviene (SORT O GROUP en este caso)
                    if(!oDialog){
                        oDialog = sap.ui.xmlfragment(sDialogFragmentName,this);
                        this.getView().addDependent(oDialog);
                        this.Dialogs[sDialogFragmentName] = oDialog;
                    }
                    //Setea filtro/s
                    oDialog.setFilterSearchOperator(mLibrary.StringFilterOperator.Contains);
                    if(DeviceAcceleration.system.desktop){
                        oDialog.addStyleClass("sapUISizeCompact");
                    }

                    // Pregunta si el filtro que esta siendo aplicado es X FILTRO
                    if(sDialogFragmentName === "EjIntegrador1.EjIntegrador1.fragments.filterDialog"){
                        var oModelJSON = this.getOwnerComponent().getModel(Constants.model.modeloProductos);
                        var modelOriginal = oModelJSON.getProperty("/Productos");
                        var jsonProducto = JSON.parse(JSON.stringify(modelOriginal,['Producto']));
                        var jsonProveedor = JSON.parse(JSON.stringify(modelOriginal,['Proveedor']));

                        oDialog.setModel(oModelJSON);
                        
                        // Revisar duplicados
                        jsonProducto = jsonProducto.filter(function(currentObject){
                            if(currentObject.Producto in jsonProducto){
                                return false;
                            }else{
                                jsonProducto[currentObject.Producto] = true;
                                 return true;
                            }
                        });

                        jsonProveedor = jsonProveedor.filter(function (currentObject){
                            if(currentObject.Proveedor in jsonProveedor){
                                return false;
                            }else{
                                jsonProveedor[currentObject.Proveedor] = true;
                                return true;
                            }
                        });
                        
                        var ProductoFilter = [];
                        for (var i = 0; i < jsonProducto.length; i++) {
                            ProductoFilter.push(
                                new sap.m.ViewSettingsItem({
                                    text: jsonProducto[i].Producto,
                                    key: "Producto"
                                })
                            );
                        };

                        var ProveedorFilter = [];
                        for (var i = 0; i < jsonProveedor.length; i++) {
                            ProveedorFilter.push(
                                new sap.m.ViewSettingsItem({
                                    text: jsonProveedor[i].Proveedor,
                                    key: "Proveedor"
                                })
                            );
                        };

                        oDialog.destroyFilterItems();

                        oDialog.addFilterItem(new sap.m.ViewSettingsFilterItem({
                            key: "Productos",
                            text: "Productos",
                            items: ProductoFilter
                        }));

                        oDialog.addFilterItem(new sap.m.ViewSettingsFilterItem({
                            key: "Proveedor",
                            text: "Proveedor",
                            items: ProveedorFilter
                        }));
                    }

                    //Retornar dialogo a la vista
                    return oDialog
            },

            //SORT BY/////////////////////////////////////////////////
            // Crear dialog
            onSort: function(){
                this.createViewSettingsDialog('EjIntegrador1.EjIntegrador1.fragments.SortDialog').open()
            },
            //Aplicar filtros del dialogo 
            onSortDialogConfirm: function(oEvent){
                let sFragmentId = this.getView().createId(Constants.ids.FRAGMENTS.frTabla);
                var oTable = sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.tablaValores),
                mParams = oEvent.getParameters(),
                oBinding=oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters=[];

                sPath= mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath,bDescending));
                oBinding.sort(aSorters);
            },

            //GROUP BY/////////////////////////////////////////////////
            //Inicia la funcion para abrir el dialogo de agrupamiento
            onGroup: function(){
                this.createViewSettingsDialog('EjIntegrador1.EjIntegrador1.fragments.groupDialog').open()
            },
           
            // Al confirma el dialogo y las opciones devuelve los argumentos para conformar los grupos
            onGroupDialogConfirm: function(oEvent){
                let sFragmentId = this.getView().createId(Constants.ids.FRAGMENTS.frTabla);
                var oTableGroup = sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.tablaValores),
                mParams = oEvent.getParameters(),
                oBinding = oTableGroup.getBinding("items"),
                sPath,
                bDescending,
                vGroup,
                aGroups=[];

                if(mParams.groupItem){
                    sPath = mParams.groupItem.getKey();
                    bDescending = mParams.groupDescending;
                    vGroup= this.mGroupFunctions[sPath];
                    aGroups.push(new Sorter(sPath,bDescending,vGroup));
                    oBinding.sort(aGroups);
                }else{
                    oBinding.aSorters = null;
                    aGroups = [];
                    oBinding.sort(aGroups);
                }
            },

            // BUSQUEDA POR FILTRO //
            
            onFilter: function(){
                this.createViewSettingsDialog("EjIntegrador1.EjIntegrador1.fragments.filterDialog").open();
            },

            onFilterDialogConfirm: function(oEvent){
                let sFragmentId = this.getView().createId(Constants.ids.FRAGMENTS.frTabla);
                var oTableFilter = sap.ui.core.Fragment.byId(sFragmentId, Constants.ids.FRAGMENTS.tablaValores),
                    mParams= oEvent.getParameters(),
                    oBinding = oTableFilter.getBinding("items"),
                    aFilters=[];
                mParams.filterItems.forEach(function(oItem){
                    var sPath = oItem.getKey(),
                        sOperator = FilterOperator.Contains,
                        sValue1 = oItem.getText();
                    var oFilter = new Filter(sPath,sOperator,sValue1);
                    aFilters.push(oFilter);
                });
                oBinding.filter(aFilters);
            }
		});
	});
