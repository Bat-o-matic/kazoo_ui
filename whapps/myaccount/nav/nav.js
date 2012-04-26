winkstart.module('myaccount', 'nav', {
        css: [
            'css/style.css'
        ],

        templates: {
            myaccount_navbar: 'tmpl/myaccount_navbar.html'
        },

        subscribe: {
            'nav.activate': 'activate',
            'nav.add_sublink': 'add_sublink',
            'myaccount.initialized': 'activate'

        }
    },

    function() {
        var THIS = this;
        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },
    {
        activate: function(user_data) {
            var THIS = this,
                user_name = user_data.first_name + ' ' + user_data.last_name || 'Username',
                container = THIS.templates.myaccount_navbar.tmpl({
                    user_name: user_name,
                    company_name: winkstart.config.company_name 
                });

            winkstart.publish('linknav.add', {
                name: 'nav',
                weight: 10,
                content: container,
                modifier: function(link_html) {
                    $('> a', link_html).css('padding', 0);
                }
            });
            winkstart.publish('nav.add_sublink', 'nav', 'logout', 'logout', '20', 'auth.activate',
                function(sub_link){
                    var width = $('#myaccount_navbar').css('width');
                    $('.dropdown-menu').css('width', width);
                }
            );
        },

        add_sublink: function(link, sublink, label, weight, publish, modifier){
            winkstart.publish('linknav.sub_add', {
                link: link,
                sublink: sublink,
                label: label,
                weight: weight,
                publish: publish,
                modifier: modifier
            });
        }
    }
);
