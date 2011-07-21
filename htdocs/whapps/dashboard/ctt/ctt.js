winkstart.module('dashboard', 'ctt',
    {
        css: [
        'css/ctt.css'
        ],

        /* What HTML templates will we be using? */
        templates: {
            ctt: 'tmpl/ctt.html'//,
        //detailRegistration: 'tmpl/detailRegistration.html'
        },

        /* What events do we listen for, in the browser? */
        subscribe: {
            'ctt.activate' : 'activate'
        },

        formData: {
    
        },

        validation : [
        ],

        /* What API URLs are we going to be calling? Variables are in { }s */
        resources: {
            "cdr.list": {
                url: CROSSBAR_REST_API_ENDPOINT + '/accounts/{account_id}/cdr',
                contentType: 'application/json',
                verb: 'GET'
            },
            "cdr.read": {
                url: CROSSBAR_REST_API_ENDPOINT + '/accounts/{account_id}/cdr/{cdr_id}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    /* Bootstrap routine - run when the module is first loaded */
    function(args) {
        /* Tell winkstart about the APIs you are going to be using (see top of this file, under resources */
        winkstart.registerResources(this.config.resources);
        
        winkstart.publish('subnav.add', {
            whapp: 'dashboard',
            module: this.__module,
            label: 'Call Trace Tool',
            icon: 'registration'
        });
    },

    {
        /* This runs when this module is first loaded - you should register to any events at this time and clear the screen
     * if appropriate. You should also attach to any default click items you want to respond to when people click
     * on them. Also register resources.
     */
        activate: function(data) {
            $('#ws-content').empty();
            $('body').after('<div id="details_dialog"></div>');
            var THIS = this;
            
            winkstart.loadFormHelper('forms');

            this.templates.ctt.tmpl({}).appendTo( $('#ws-content') );
            
            var num_rows = 0;
            
            //winkstart.getJSON('registration.list', {crossbar: true, account_id: MASTER_ACCOUNT_ID}, function(reply) {
            winkstart.getJSON('cdr.list', {
                crossbar: true, 
                account_id: '04152ed2b428922e99ac66f3a71b0215'
            }, function(reply) {
                THIS.setup_table();
                $.each(reply.data, function() {
                    var cdr_id = this.id;
                    
                    

                    //winkstart.getJSON('registration.read',{crossbar: true, account_id: MASTER_ACCOUNT_ID, registration_id: registration_id}, function(reply) {
                    winkstart.getJSON('cdr.read',{
                        crossbar: true, 
                        account_id: '04152ed2b428922e99ac66f3a71b0215', 
                        cdr_id: cdr_id
                    }, function(reply) {
                        if(reply.data == undefined) {
                            return false;
                        }
                        
                        function noData(data){
                            if(data == null){
                                return 'No data';
                            }else{
                                return data;
                            }
                        }
                            
                        function writeContentDialog(id, obj){
                            var out = '<div id="'+id+'"><table class="details_table">';                          

                            $.each(obj, function(index, value){
                                if(index == 'local_sdp' || index == 'remote_sdp'){
                                    out += '<tr><td class="bold" colspan="2" style="text-align:center;">'+index+'</td></tr>';
                                    var sdp = value.split('\n');
                                    
                                    sdp.splice(sdp.length-1, 1);
                                    
                                    $.each(sdp, function(i, v){
                                        $.each(v.split('='), function($i, $v){
                                            if($i == 0){
                                                out += '<tr><td class="bold">'+$v+'</td>'; 
                                            }
                                            if($i == 1){
                                                out += '<td>'+$v+'</td></tr>';  
                                            }
                                            
                                        });
                                    });
                                    
                                }else{
                                    out += '<tr><td class="bold">'+index+'</td><td>'+value+'</td></tr>';
                                }
 
                            });
                            out += '</table></div>'
                            return out;
                        }
                        
                        function drawRows(id, obj){
                           
                            winkstart.table.ctt.fnAddData([
                                noData(id),
                                noData(obj.callee_id_number),
                                noData(obj.caller_id_number),
                                noData(obj.duration_seconds),
                                noData(obj.hangup_cause),
                                '<div class="link_table">Debug</div>',
                                '<div id="'+id+'_details" class="link_table">Details</div>',
                                '<div class="link_table">Leg</div>'
                                ]);
                            
                                    
                            $('#'+id+'_details').live('click', function(){
                                var dialog_div = writeContentDialog(id, obj);
                                
                                $('#'+id+'_details').data('dialog', dialog_div);
                                
                                $('#details_dialog').dialog({
                                    open: function(event, ui){
                                        $('#details_dialog').empty();
                                        $('#details_dialog').html($('#'+id+'_details').data('dialog'))
                                    },
                                    autoOpen: false,
                                    title: 'Call id: '+id,
                                    minWidth:550,
                                    width: 550, 
                                    minHeight:575,
                                    height: 575
                                });
                                $('#details_dialog').dialog('open');
                            });
                        }
                        
                        console.log(reply.data);
                        
                        if(reply.data['related_cdrs'] != null && reply.data['related_cdrs'] != undefined){
                            $.each(reply.data['related_cdrs'], function(index, value) {
                                num_rows = num_rows+1;                       
                                drawRows(reply.data.id+'_'+index, value);
                            });
                        }else{
                            drawRows(reply.data.id, reply.data);
                        }
                        
                        num_rows = num_rows+1;
                        
                        //Hack to hide pagination if number of rows < 10
                        if(num_rows < 10){
                            $('body').find('.dataTables_paginate').hide();
                        }else{
                            $('body').find('.dataTables_paginate').show();
                        }
                    });
                });                
            });

            winkstart.publish('layout.updateLoadedModule', {
                label: 'Voicemail Boxes Management',
                module: this.__module
            });
        },
        setup_table: function() {
            var THIS = this;
            var columns = [
            {
                'sTitle': 'Call id',
                'sWidth': '20%'
            },

            {
                'sTitle': 'Called to'
            },

            {
                'sTitle': 'Called from'
            },

            {
                'sTitle': 'Call duration'
            },

            {
                'sTitle': 'Hangup cause'
            },
            
            {
                'sTitle': 'Debug'
            },
            
            {
                'sTitle': 'Details'
            },
            
            {
                'sTitle': 'Other leg'
            }
            ];

            winkstart.table.create('ctt', $('#ctt-grid'), columns);
            $('#ctt-grid_filter input[type=text]').first().focus();
			
            $('.cancel-search').click(function(){
                $('#ctt-grid_filter input[type=text]').val('');
            });
            
            
            
        }
    }
    );