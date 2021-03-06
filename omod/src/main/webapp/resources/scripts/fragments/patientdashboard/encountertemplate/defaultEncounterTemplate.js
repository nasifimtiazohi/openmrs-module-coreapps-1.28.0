$(function() {
	$(document).on('click','.view-details.collapsed', function(event){
        var jqTarget = $(event.currentTarget);
        var encounterId = jqTarget.data("encounter-id");
        var displayWithHtmlForm = jqTarget.data("encounter-form") && jqTarget.data("display-with-html-form");
        var dataTarget = jqTarget.data("target");
        var customTemplateId = jqTarget.data("display-template");
        getEncounterDetails(encounterId, displayWithHtmlForm, dataTarget, customTemplateId ? customTemplateId : "defaultEncounterDetailsTemplate");
    });
	    
	$(document).on('click', '.deleteEncounterId', function(event) {
		var encounterId = $(event.target).attr("data-encounter-id");
		createDeleteEncounterDialog(encounterId, $(this));
		showDeleteEncounterDialog();
	});

    $(document).on('click', '.editEncounter, .viewEncounter', function(event) {
        var encounterId = $(event.target).attr("data-encounter-id");
        var patientId = $(event.target).attr("data-patient-id");
        var actionUrl = $(event.target).attr("data-edit-url") || $(event.target).attr("data-view-url");
        var dataMode = $(event.target).attr("data-mode");
        if (actionUrl) {
            actionUrl = actionUrl.replace(/{{\s?patientId\s?}}/, patientId)
                .replace(/{{\s?patient.uuid\s?}}/, patientId)
                .replace(/{{\s?encounterId}\s?}/, encounterId)
                .replace(/{{\s?encounter.id\s?}}/, encounterId);
            emr.navigateTo({ applicationUrl: actionUrl });
        } else {
            if ("view" == dataMode) {
            	emr.navigateTo({
	                provider: "htmlformentryui",
	                page: "htmlform/viewEncounterWithHtmlForm",
	                query: { patient: patientId, encounter: encounterId}
	            });
            } else {
            	emr.navigateTo({
	                provider: "htmlformentryui",
	                page: "htmlform/editHtmlFormWithStandardUi",
	                query: { patientId: patientId, encounterId: encounterId }
	            });
            }
        }
    });
	
	//We cannot assign it here due to Jasmine failure: 
	//net.sourceforge.htmlunit.corejs.javascript.EcmaError: TypeError: Cannot call method "replace" of undefined
    var detailsTemplates = {};

	function getEncounterDetails(id, displayWithHtmlForm, dataTarget, displayTemplateId) {

	    var encounterDetailsSection = $(dataTarget + ' .encounter-summary-container');

        if (displayWithHtmlForm) {
	    		if(encounterDetailsSection.html() == "") { encounterDetailsSection.html("<i class=\"icon-spinner icon-spin icon-2x pull-left\"></i>");}
	    jq.getJSON(
	        		emr.fragmentActionLink("htmlformentryui", "htmlform/viewEncounterWithHtmlForm", "getAsHtml", { encounterId: id })
	        ).done(function(data){
	            encounterDetailsSection.html(data.html);
	        }).fail(function(err){
	            emr.errorAlert(err);
	        });
	    } else {

            if (!detailsTemplates[displayTemplateId]) {
                detailsTemplates[displayTemplateId] = _.template($('#' + displayTemplateId).html());
            }

            var displayTemplate = detailsTemplates[displayTemplateId];

	    		if(encounterDetailsSection.html() == "") { encounterDetailsSection.html("<i class=\"icon-spinner icon-spin icon-2x pull-left\"></i>");}
	        jq.getJSON(
	            emr.fragmentActionLink("coreapps", "visit/visitDetails", "getEncounterDetails", { encounterId: id })
	        ).done(function(data){
	            encounterDetailsSection.html(displayTemplate(data));
	        }).fail(function(err){
	            emr.errorAlert(err);
	        });
	    }
	}
});
