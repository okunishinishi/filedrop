/**
 * public script for room page
 *
 *  -- namespaces --
 *  $ : jQuery
 *  l : message resource
 *  hbs : handlebars
 *
 */
(function ($, l, hbs) {

    $.fn.extend({
        roomListSection: function (_id, callback) {
            var tmpl = {
                li: hbs.templates['room-list-item']
            };

            var section = $(this),
                ul = $('#room-list', section);

            ul.data('selected_id', _id);
            ul.selectableList({
                deselect: false
            }, function (li) {
                var _id = li && li.attr('id').split('-').pop() || null;
                ul.data('selected_id', _id);

                callback && callback(_id);
            });

            section.find('.caption').click(function () {
                $('.selected-list-item', ul).removeClass('selected-list-item');
                callback && callback(null);
            });

            ul.reload = function (mode) {
                ul.find('li').each(function () {
                    var li = $(this);
                    if (li.data('room-list-item')) return;
                    li.data('room-list-item', true);
                    li
                        .destroyableListItem({
                            destroyBtn: li.find('.destroy-btn'),
                            destroyForm: li.findByName('destroy-form'),
                            confirmRemove: true
                        })
                        .editableListItem({
                            editBtn: li.find('.edit-btn'),
                            editForm: li.findByName('edit-form'),
                            mode: mode,
                            edit: function (data) {
                                var li = $(this);
                                var room = data.room;
                                if (room) {
                                    li.findByName('edit-form').setFormValue(room);
                                    li.attr('id', 'room-list-item-' + room._id);
                                }
                            }
                        });
                });
            };

            $('#new-room-btn', section).click(function () {
                ul.appendHandlebars(tmpl.li, {});
                ul.reload();
                ul.find('.editable-text').not('.tk-hidden').last().focus();
            });

            $('#room-search-form', section).searchForm(function (data) {
                ul.htmlHandlebars(tmpl.li, data);
                var _id = ul.data('selected_id');
                if (_id) {
                    ul.find('#room-list-item-' + _id).click();
                }
                ul.reload("view");
            }).submit();

            return section;
        },
        roomDetailForm: function (callback) {
            var form = $(this);
            form.detailForm({
                schema: v.room.update,
                editBtn: ".setting-btn"
            }, function (data) {
                form.setDetailFormValue(data.room);
                callback && callback();
            });
            form.setDetailFormValue = function (data) {
                form.find(':reset').click();
                setTimeout(function () {
                    form
                        .setFormValue({
                            name: data.name,
                            _id: data._id,
                            privacy: data.privacy,
                            retention: data.retention,
                            private_password:'xxxxxx',
                            private_password_again:'xxxxxx',
                            private_password_changed: 'false'
                        } || {});
                    $('#room-name-label').text(data.name);
                    form.viewMode();
                    display();
                }, 10);
                return form;
            };

            form.viewMode = function () {
                form.editableForm('view');
            };

            $('#room-detail-close-btn').click(function () {
                form.viewMode();
            });

            form
                .on('click', 'setting-btn', function () {
                    form.data('room-detail-form-busy', true);
                    setTimeout(function () {
                        form.data('room-detail-form-busy', false);
                    }, 250);
                })
                .on('click', '#room-detail-form-inner', function (e) {
                    e.stopPropagation();
                })
                .on('click', function () {
                    if (form.data('room-detail-form-busy')) return;
                    form.viewMode();
                })
                .on('change', '#private_password-input,#private_password_again-input', function () {
                    $('#private_password_changed-input').val('true');
                });

            function display() {
                var privateKeyTr = $('.private-key-tr', form);
                var privacy = privacyInput.filter(':checked').val();
                switch (privacy) {
                    case 'private':
                        privateKeyTr.show();
                        break;
                    default:
                        privateKeyTr.hide();
                }
            }

            var privacyInput = form.findByName('privacy').change(function () {
                display();
            });
            return form;
        },
        roomDetailSection: function (options) {
            var section = $(this).show(),
                destroyForm = $('#room-destroy-form', section),
                detailForm = $('#room-detail-form', section).roomDetailForm(function () {

                });

            destroyForm.destroyForm({
                schema: v.room.destroy,
                destroyBtn: section.find('#room-destroy-btn'),
                confirmRemove: true
            }, function () {
                var _id = section.data('selected_id');
                options.destroy && options.destroy.call(section, _id);
                section.unload();
            });
            section.load = function (_id) {
                if (!_id) {
                    return section.unload();
                }
                var ref = section.data('ref').replace(/:_id/, _id);

                section
                    .data('selected_id', _id);
                detailForm.addClass('tk-loading');
                $.getJSON(ref, function (data) {
                    detailForm
                        .setDetailFormValue(data)
                        .removeClass('tk-loading')
                        .hide()
                        .fadeIn()
                        .trigger('detail-form-load-done', [data]);
                });
                section
                    .removeClass('empty-section');
                options.load && options.load.call(section, _id);
                return section;
            };
            section.unload = function () {
                section
                    .data('selected_id', null);
                detailForm
                    .setDetailFormValue({})
                    .fadeOut(2, function () {
                        section.addClass('empty-section');
                        options.unload && options.unload.call(section);
                    });
                return section;
            };
            section.addClass('empty-section');
            return section;
        },
        roomUploadFormDiv: function () {
            var div = $(this);
            div.setRoomId = function (room_id) {
                var action = [div.data('post'), room_id].join('/');
                var msg = '<div class="upload-msg">Drag & Drop <br/>and </br>Share Your file!</br><span class="upload-btn"/></div>';
                div.empty().dropUploadInput(action, 'room_file', msg);
            };
            return div;
        },
        roomFileListItem: function () {
            return this.each(function () {
                var li = $(this);
                if (li.data('room-file-list-item')) return;
                li.data('room-file-list-item', true);
                li.findByName('destroy-form')
                    .ajaxForm(function () {
                        li.closeDown(300, function () {
                            li.remove();
                        });
                    });
            });
        }
    });

    $(function () {
        var body = $(document.body),
            aside = body.find('aside'),
            q = $.getQuery() || {};

        var roomUploadFormDiv = $('#file-upload-div').roomUploadFormDiv(),
            roomFileList = $("#room-file-list");

        var listSection = $('#room-list-section', body),
            detailSection = $('#room-detail-section', body).roomDetailSection({
                load: function (_id) {
                    aside.removeClass('wide-aside');
                    roomUploadFormDiv
                        .setRoomId(_id);
                },
                unload: function () {
                    aside.addClass('wide-aside');
                },
                destroy: function (_id) {
                    $.pushQueryToState({_id: ''});
                    listSection.find('#room-list-item-' + _id).remove();
                }
            })
                .on('detail-form-load-done', function (e, data) {
                    var tmpl = hbs.templates['room-file-list-item'];
                    roomFileList
                        .htmlHandlebars(tmpl, data.files)
                        .find('li')
                        .roomFileListItem();
                    roomUploadFormDiv.show();
                    setTimeout(function () {

//                        $('.setting-btn').click(); //FIXME remvoe
                    }, 300)
                });

        var _id = q._id;
        aside
            .toggleClass('wide-aside', !_id);
        listSection.roomListSection(_id, function (_id) {
            $.pushQueryToState({_id: _id});
            roomUploadFormDiv.hide();
            detailSection.load(_id);
            aside
                .addClass('animatable')
                .toggleClass('wide-aside', !_id);
            aside.resize();
        });
        $('header', body).header('#room-link-btn');
        roomUploadFormDiv.hide();

        aside.resize = function () {
            setTimeout(function () {
                var wide = aside.hasClass('wide-aside');
                aside.find('.y-scrollable').css({
                    maxHeight: wide ? 'none' : detailSection.height() || $(window).height()
                });
            }, 3);
        };
        $(window).resize(function () {
            aside.resize();
        });
        aside.resize();


    });
})(jQuery, window['l'], Handlebars);
