/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"EjIntegrador1/EjIntegrador1/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
