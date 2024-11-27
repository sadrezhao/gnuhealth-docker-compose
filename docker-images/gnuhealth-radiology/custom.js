/*
#########################################################################
#             GNU HEALTH HOSPITAL MANAGEMENT - Web SAO CLIENT               #
#                      https://www.gnuhealth.org                        #
#########################################################################
#       The GNUHealth HMIS client based on the Tryton SAO Client      #
#########################################################################
#
# SPDX-FileCopyrightText:  2024 - Wei Zhao <wei.zhao@uclouvain.be>
# SPDX-License-Identifier: GPL-3.0-or-later
# 
*/

// The dicombinary widget is based on the existing binary widget of tryton.

// returns the number as Uint8Array with 8 bytes in Little Endian order
function numToUint8Array(num) {
    let arr = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      arr[i] = num % 256;
      num = Math.floor(num / 256);
    }
    return arr;
}

DicomBinaryMixin = Sao.class_(Sao.View.Form.Widget, {
    /**
     * Initialize the function with a given view and attributes.
     *
     * @param {type} view - the view parameter
     * @param {type} attributes - the attributes parameter
     * @return {type} null or the filename attribute
     */
    init: function (view, attributes) {
        DicomBinaryMixin._super.init.call(
            this, view, attributes);
        this.filename = attributes.filename || null;
    },
    /**
     * Generate a toolbar with save, select, and clear buttons.
     *
     * @param {string} class_ - the class for the toolbar
     * @return {jQuery} the jQuery element representing the toolbar
     */
    toolbar: function (class_) {
        var group = jQuery('<div/>', {
            'class': class_,
            'role': 'group'
        });

        this.but_save_as = jQuery('<button/>', {
            'class': 'btn btn-default',
            'type': 'button',
            'aria-label': Sao.i18n.gettext("Save As"),
            'title': Sao.i18n.gettext("Save As..."),
        }).append(Sao.common.ICONFACTORY.get_icon_img('tryton-download')
        ).appendTo(group);
        this.but_save_as.click(this.save_as.bind(this));

        this.input_select = jQuery('<input/>', {
            'type': 'file',
            'accept': '.dcm,.DCM,.zip,.gz',
            'multiple': true
        }).change(this.select.bind(this));
        this.but_select = jQuery('<div/>', {
            'class': 'btn btn-default input-file',
            'type': 'button',
            'aria-label': Sao.i18n.gettext("Select"),
            'title': Sao.i18n.gettext("Select..."),
        }).append(this.input_select
        ).append(Sao.common.ICONFACTORY.get_icon_img('tryton-search')
        ).appendTo(group);
        this.but_select
            .on('dragover', false)
            .on('drop', this.select_drop.bind(this));

        this.but_clear = jQuery('<button/>', {
            'class': 'btn btn-default',
            'type': 'button',
            'aria-label': Sao.i18n.gettext("Clear"),
            'title': Sao.i18n.gettext("Clear"),
        }).append(Sao.common.ICONFACTORY.get_icon_img('tryton-clear')
        ).appendTo(group);
        this.but_clear.click(this.clear.bind(this));

        return group;
    },
    /**
     * Returns the value of the filename field if it exists in the record model.
     *
     * @return {string|null} The value of the filename field, or null if it does not exist.
     */
    get filename_field() {
        if (this.filename) {
            var record = this.record;
            if (record) {
                return record.model.fields[this.filename];
            }
        }
        return null;
    },
    /**
     * Updates the visibility of buttons based on the given value.
     *
     * @param {boolean} value - The value to determine the visibility of buttons.
     * @return {void} This function does not return a value.
     */
    update_buttons: function (value) {
        if (value) {
            // this.but_save_as.show();   // don't show "save as" button
            this.but_select.hide();
            this.but_clear.show();
        } else {
            this.but_save_as.hide();
            this.but_select.show();
            this.but_clear.hide();
        }
    },
        /**
         * Selects multiple files and reads their contents.
         *
         * @return {void} This function does not return anything.
         */
    select: function () {
        var record = this.record,
            field = this.field,
            filename_field = this.filename_field;

        // promises to get the data from all selected files
        let promises = [];
        for (let file of this.input_select[0].files) {
            let filePromise = new Promise(resolve => {
                let reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsArrayBuffer(file);
            });
            promises.push(filePromise);
        }

        Promise.all(promises).then(fileContents => {
            // all promises are finished.

            // calculate the size of all files + 8 bytes for the length
            // of each file
            var allLength = 4
            for (let content of fileContents) {
                allLength += content.byteLength + 8
            }

            // put the data of all files (and the length of the files)
            // into a Uint8Array.
            // the format is:
            //   1. the bytes 'M', 'U', 'L', 'T' (ASCII 77,85,76,84)
            //   2. 8 bytes containing the length of the file (Little Endian)
            //   3. the data of the file
            //   4. repeat steps 2 and 3 for next file
            var all_data = new Uint8Array(allLength);
            all_data.set([77,85,76,84], 0)
            var pos = 4
            for (let content of fileContents) {
                var data = new Uint8Array(content);
                all_data.set(numToUint8Array(data.length), pos)  // size in little endian 8 bytes
                pos += 8;
                all_data.set(data, pos)
                pos += data.length
            }

            // set the content of the field in the wizard
            field.set_client(record, all_data);
            if (filename_field) {
                filename_field.set_client(record, all_data.length);
            }
        });
    },
    /**
     * A function that handles the selection of files dropped into a specific area.
     *
     * @param {Object} evt - the event object containing information about the drop event
     */
    select_drop: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt = evt.originalEvent;
        var files = [];
        if (evt.dataTransfer.items) {
            Sao.Logger.debug("Select drop items:", evt.dataTransfer.items);
            for (let i=0; i < evt.dataTransfer.items.length; i++) {
                let file = evt.dataTransfer.items[i].getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        } else {
            for (let i=0; i < evt.dataTransfer.files.length; i++) {
                let file = evt.dataTransfer.files[i];
                if (file) {
                    files.push(file);
                }
            }
        }
        for (const file of files) {
            Sao.common.get_file_data(file, (data, filename) => {
                this.field.set_client(this.record, data);
                if (this.filename_field) {
                    this.filename_field.set_client(this.record, filename);
                }
            });
        }
    },
        /**
         * Opens the function by calling the `save_as` method.
         *
         * @return {undefined} This function does not return a value.
         */
    open: function() {
        this.save_as();
    },
    /**
     * Save the data from field and record by downloading the file with the given name.
     *
     * @param {type} paramName - description of parameter
     * @return {type} description of return value
     */
    save_as: function() {
        var field = this.field;
        var record = this.record;
        var prm;
        if (field.get_data) {
            prm = field.get_data(record);
        } else {
            prm = jQuery.when(field.get(record));
        }
        prm.done(data => {
            var name;
            var field = this.filename_field;
            if (field) {
                name = field.get(this.record);
            }
            Sao.common.download_file(data, name);
        });
    },
    /**
     * Clears the input select, filename field (if available), and field.
     *
     * @return {void} This function does not return a value.
     */
    clear: function() {
        this.input_select.val(null);
        var filename_field = this.filename_field;
        if (filename_field) {
            filename_field.set_client(this.record, null);
        }
        this.field.set_client(this.record, null);
    }
});


DicomBinary = Sao.class_(DicomBinaryMixin, {
    class_: 'form-dicombinary',
    blob_url: '',
    /**
     * Initialize the view with the given attributes.
     *
     * @param {Object} view - The view to initialize.
     * @param {Object} attributes - The attributes to apply.
     */
    init: function(view, attributes) {
        DicomBinary._super.init.call(this, view, attributes);

        this.el = jQuery('<div/>', {
            'class': this.class_
        });
        var group = jQuery('<div/>', {
            'class': 'input-group input-group-sm'
        }).appendTo(this.el);

        this.size = jQuery('<input/>', {
            type: 'input',
            'class': 'form-control input-sm',
            'readonly': true,
            'name': attributes.name,
        }).appendTo(group);

        if (this.filename && attributes.filename_visible) {
            this.text = jQuery('<input/>', {
                type: 'input',
                'class': 'form-control input-sm'
            }).prependTo(group);
            this.text.change(this.focus_out.bind(this));
            // Use keydown to not receive focus-in TAB
            this.text.on('keydown', this.key_press.bind(this));
            this.text.css('width', '50%');
            this.size.css('width', '50%');

            this.but_open = jQuery('<button/>', {
                'class': 'btn btn-default',
                'type': 'button',
                'aria-label': Sao.i18n.gettext("Open..."),
                'title': Sao.i18n.gettext("Open..."),
            }).append(Sao.common.ICONFACTORY.get_icon_img('tryton-open')
            ).appendTo(jQuery('<span/>', {
                'class': 'input-group-btn',
            }).prependTo(group));
            this.but_open.click(this.open.bind(this));
        }

        this.toolbar('input-group-btn').appendTo(group);
    },
    /**
     * Display function to update the UI based on the record and field information.
     *
     */
    display: function() {
        DicomBinary._super.display.call(this);

        var record = this.record, field = this.field;
        if (!field) {
            if (this.text) {
                this.text.val('');
            }
            this.size.val('');
            this.but_save_as.hide();
            return;
        }
        var size;
        if (field.get_size) {
            size = field.get_size(record);
        } else {
            size = field.get(record).length;
        }
        this.size.val(Sao.common.humanize(size, 'B'));

        if (this.text) {
            this.text.val(this.filename_field.get(record) || '');
            if (size) {
                this.but_open.parent().show();
            } else {
                this.but_open.parent().hide();
            }
        }
        this.update_buttons(Boolean(size));
    },
    /**
     * Handles key press events.
     *
     * @param {Event} evt - The key press event.
     */
    key_press: function(evt) {
        var editable = !this.text.prop('readonly');
        if (evt.which == Sao.common.F3_KEYCODE && editable) {
            evt.preventDefault();
            this.new_();
        } else if (evt.which == Sao.common.F2_KEYCODE) {
            evt.preventDefault();
            this.open();
        }
    },
    /**
     * Sets the value based on the text input and updates the client if the text is not empty.
     *
     */
    set_value: function() {
        if (this.text) {
            this.filename_field.set_client(this.record,
                    this.text.val() || '');
        }
    },
    /**
     * Set the readonly property of the DicomBinary object and update associated elements accordingly.
     *
     * @param {boolean} readonly - The new value for the readonly property
     * @return {void} 
     */
    set_readonly: function(readonly) {
        DicomBinary._super.set_readonly.call(this, readonly);
        this.but_select.prop('disabled', readonly);
        this.but_clear.prop('disabled', readonly);
        if (this.text) {
            this.text.prop('readonly', readonly);
        }
    }
});

Sao.View.FormXMLViewParser.WIDGETS['dicombinary'] = DicomBinary;
