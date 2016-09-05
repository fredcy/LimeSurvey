var Bindings = function(){
    var 
    baseModal = '#participantPanel_edit_modal',
    runBaseModal = function(url, data, actionButtonClass, formId, gridViewId){
            $(baseModal).modal('show');
            jQuery.ajax({
                url: url, 
                data: data,
                method: 'POST',
                success: function(page){
                    $(baseModal).find('.modal-content').html(page);
                    $(baseModal).find('.'+actionButtonClass).on('click', function(e){
                        e.preventDefault();
                        var action = $(baseModal).find('#'+formId).attr('action');
                        var data2 = $(baseModal).find('#'+formId).serializeArray();
                        $.ajax({
                            url: action,
                            data: data2,
                            method: 'POST',
                            dataType: "json",
                            success: function(result){
                                $(baseModal).modal('hide');
                                $.fn.yiiGridView.update(gridViewId,{});
                                notifyFader(result.successMessage, 'well-lg bg-primary text-center');
                            },
                            error : function(){
                                console.log(arguments);
                            }
                        });
                    });
                    }
            });
        },
    // Basic settings and bindings that should take place in all three views
    basics = function(){ 
        // Code for AJAX download
        jQuery.download = function(url, data, method){
            //url and data options required
            if( url && data ){
                //data can be string of parameters or array/object
                data = typeof data == 'string' ? data : jQuery.param(data);
                //split params into form inputs
                var inputs = '<input type="hidden" name="YII_CSRF_TOKEN" value="'+LS.data.csrfToken+'">';
                jQuery.each(data.split('&'), function(){
                    var pair = this.split('=');
                    inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'">';
                });
                //send request
                jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
                    .appendTo('body').submit().remove();
            };
        };
        $('#export').click(function(){
            var dialog_buttons={};
            dialog_buttons[exportBtn]=function(){
                $.download(exportToCSVURL,{ attributes: $('#attributes').val().join(' ') },"POST");
                $(this).dialog("close");
            };            
            dialog_buttons[cancelBtn]=function(){
                $(this).dialog("close");};

            $.post(exporttocsvcountall,
                function(data) {
                    count = data;
                    if(count == 0)
                    {
                        $('#exportcsvallnorow').dialog({
                            modal: true,
                            title: error,
                            buttons: dialog_buttons,
                            width : 300,
                            height : 160
                        });
                    }
                    else
                    {
                        $('#exportcsv').dialog({
                            modal: true,
                            title: count,
                            buttons: dialog_buttons,
                            width : 600,
                            height : 300,
                            open: function(event, ui) {
                                $('#attributes').multiselect({ includeSelectAllOption:true, 
                                                            selectAllValue: '0',
                                                            selectAllText: sSelectAllText,
                                                            nonSelectedText: sNonSelectedText,
                                                            nSelectedText: sNSelectedText,
                                                            maxHeight: 140 });
                            }
                        });

                        /* $.download(exporttocsvall,'searchcondition=dummy',$('#exportcsvallprocessing').dialog("close"));*/
                    }
            });
        });
    },
    //JS-bindings especially for the participantPanel
    participantPanel = function(){
        $('.action_participant_editModal').on('click', function(e){
            e.preventDefault();
            var data = {'participant_id' : $(this).closest('tr').data('participant_id')};
            //url, data, idString, actionButtonClass, formId, gridViewId
            runBaseModal(
                openEditParticipant, 
                data,
                'action_save_modal_editParticipant',
                'editPartcipantActiveForm', 
                'list_central_participants' 
            );
        });
        $('#addParticipantToCPP').on('click', function(e){
            e.preventDefault();
            var data = {};
            //url, data, idString, actionButtonClass, formId, gridViewId
            runBaseModal(
                openEditParticipant, 
                data,
                'action_save_modal_editParticipant',
                'editPartcipantActiveForm', 
                'list_central_participants' 
            );
        });
            
        $('#action_toggleAllParticipant').on('click', function(){
            $('.selector_participantCheckbox').prop('checked',$('#action_toggleAllParticipant').prop('checked'));
        });

        $('.action_changeBlacklistStatus').bootstrapSwitch();

        $('.action_changeBlacklistStatus').on('switchChange.bootstrapSwitch', function(event,state){
            var self = this;
            $.ajax({
                url: changeBlacklistStatus, 
                method: "POST",
                data: {'participant_id': $(self).closest('tr').data('participant_id'), 'blacklist': state},
                dataType: 'json', 
                success: function(resolve){
                    $(self).prop("checked", (resolve.newValue == "Y"));
                }
            })
        });

        $('#pageSizeParticipantView').on("change", function(){
            $.fn.yiiGridView.update('list_central_participants',{ data:{ pageSizeParticipantView: $(this).val() }});
        });

    },
    //JS-bindings especially for the attributePanel
    attributePanel = function(){
        $('#addParticipantAttributeName').on('click', function(e){
            e.preventDefault();
            var data = {};
            runBaseModal(
                openEditAttributeNames, 
                data,
                'action_save_modal_editAttributeName',
                'editAttributeNameActiveForm', 
                'list_attributes' 
            ); 
        });
        $('.action_attributeNames_editModal').on('click', function(e){
            e.preventDefault();
            var data = {'attribute_id' : $(this).closest('tr').data('attribute_id')};
            runBaseModal(
                openEditAttributeNames, 
                data,
                'action_save_modal_editAttributeName',
                'editAttributeNameActiveForm', 
                'list_attributes' 
            ); 
        });
        
        $('#action_toggleAllAttributeNames').on('click', function(){
            $('.selector_attributeNamesCheckbox').prop('checked',$('#action_toggleAllAttributeNames').prop('checked'));
        });

        $('.action_changeAttributeVisibility').bootstrapSwitch();
        $('.action_changeAttributeVisibility').on('switchChange.bootstrapSwitch', function(event,state){
            var self = this;
            $.ajax({
                url: changeAttributeVisibility, 
                method: "POST",
                data: {'attribute_id': $(self).closest('tr').data('attribute_id'), 'visible': state},
                dataType: 'json', 
                success: function(resolve){
                    $(self).prop("checked", (resolve.newValue == "Y"));
                }
            })
        });
    },
    //JS-bindings especially for the sharePanel
    sharePanel = function(){

    };
    return {
        basics :  basics,
        participantPanel : participantPanel,
        attributePanel : attributePanel,
        sharePanel : sharePanel
    };

}

var bind = new Bindings();
function bindButtons(){
    bind.basics();
    bind.participantPanel();
    bind.attributePanel();
    bind.sharePanel();
};
function deleteAttributeAjax(attribute_id){
    var runDeleteAttributeAjax = function(){
        $.ajax({
            url: deleteAttributeUrl,
            data: {attribute_id : attribute_id},
            method: "POST",
            dataType: 'json',
            success: function(result){
                notifyFader(result.successMessage, 'well-lg bg-primary text-center');
                $.fn.yiiGridView.update('list_attributes',{});
            }
        })
    }
    return runDeleteAttributeAjax;
}
$(document).ready(bindButtons);
