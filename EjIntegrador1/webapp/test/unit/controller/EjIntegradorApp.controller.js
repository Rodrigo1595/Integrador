/*global QUnit*/

sap.ui.define([
	"EjIntegrador1/EjIntegrador1/controller/EjIntegradorApp.controller"
], function (Controller) {
	"use strict";

	QUnit.module("EjIntegradorApp Controller");

	QUnit.test("I should test the EjIntegradorApp controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
