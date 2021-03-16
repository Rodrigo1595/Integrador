sap.ui.define([], 
    function() {
        'use strict';
    
    return{

     getLocalJSON: function (sJsonName) {return this.promisizer(jQuery.sap.getModulePath("EjIntegrador1.EjIntegrador1") + "/localService/" + sJsonName);
    },

    promisizer: function (oOptions) {return this.toPromise(jQuery.ajax(oOptions));
    },

    toPromise: function (oPromise) {
        return new Promise(function (resolve, reject) {
            oPromise.then(() => {
                const sHeaders = oPromise.done().getAllResponseHeaders();
                const aHeaders = sHeaders.trim().split(/[\r\n]+/);
                const oHeaderMap = {};
                aHeaders.forEach(function (sLine) {
                const aParts = sLine.split(': ');
                const sHeader = aParts.shift();
                const sValue = aParts.join(': ');
                oHeaderMap[sHeader] = sValue;
            });
            resolve([oPromise.done().responseJSON, oHeaderMap]);}, reject);
        });
    },
    }
});
