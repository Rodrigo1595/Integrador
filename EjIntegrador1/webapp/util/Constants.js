sap.ui.define([],function(){

    'use strict';

    return{
        //Modelos
        model:{
            I18n:'i18n',
            modeloProductos:'modeloProductos',
            modeloFiltros:'modeloFiltros',
            modeloDialog:'modeloDialog'
            
        },

        //Propiedades del modelo , getProperty
        properties: {
            
        },

        ids: {

            FRAGMENTS:{
                filtroFecha:'idFiltroFecha',
                filtroProveedor:'idFiltroProveedor',
                filtroPais:'idFiltroPais',
                tablaValores:'idTablaValores',
                items:"items",
                bindingFiltro:'buscarPorFiltro',
                frTabla:'frBuscadorTabla',
                idDialog:'idDialog'
            },
            JSON:{
                proveedor:"Proveedor",
                producto:"Producto"
            }
            
        },

        routes:{
            secondary:"Secondary",
            main:"mainIntegrador",
            FRAGMENTS:{
                tablaBuscador:"EjIntegrador1.EjIntegrador1.fragments.tablaBuscador",
                dialogClick:"EjIntegrador1.EjIntegrador1.fragments.dialogElementoClick"

            },
            JSON:{
                productos:"Productos.json"
            }
        }
    }
},true);