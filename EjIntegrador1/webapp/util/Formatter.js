sap.ui.define([],function () {
    'use strict';
   
    return{        
            formatPeso: function(sCodigo){

                if(!sCodigo){
                    return;
                }else{

                    let nPeso = parseFloat(sCodigo);

                    if(nPeso < 1){
                       return "Success"
                    }else if(nPeso >= 1 && nPeso <= 2 ){
                       return "Warning"
                    }else{
                       return "Error"
                    }
                }
            },

            formatValor: function(sCodigo){
                 if(!sCodigo){
                    return;
                }else{
                    let nPeso = (parseFloat(sCodigo))/160;
                    return nPeso;
                }
            }
    }

},true);