/**
 * Event
 * Fires when a file is selected
 */
$("#file").on('change', function () {
    const fileName = this.value.split('\\').pop().split('/').pop();

    if (( this.files[0].size / 1000 ) > config.file_max_size) {
        const max_size = humanReadableSize(config.file_max_size);
        notyf.error(`File is too big! Max. ${max_size}`);

        return;
    }

    $("#file-name").text(fileName);
    $("#file-size").text(humanReadableSize(this.files[0].size/1000));
    $("#input-label").hide();
    $("#input-label-selected").show();
});

/**
 * Event
 * Fires when a file is dragged over the "drop area"
 */
$("#droparea").on('dragover', function (e) {
    e.preventDefault();  
    e.stopPropagation();
    
    $("#input-label").text("Release your mouse to drop the file");
});

/**
 * Event
 * Fires when a dragged file leaves the "drop area"
 */
$("#droparea").on('dragleave', function (e) {
    e.preventDefault();  
    e.stopPropagation();

    $("#input-label").text("Click to select a file or drag and drop the file here");
});

/**
 * Event
 * Fires when a file is dropped into the "drop area"
 */
$("#droparea").on('drop', function (e) {
    e.preventDefault();  
    e.stopPropagation();

    $("#input-label").text("Click to select a file or drag and drop the file here");

    const files = e.originalEvent.dataTransfer.files;

    //This is needed because not only files, but text can also be dragged and dropped
    if (files.length == 0) {
        notyf.error("Only files are supported!");
        return;
    }

    if (files.length > 1) {
        notyf.error("Maximum 1 file at a time!");
        return;
    }

    document.getElementById('file').files = files;

    // The "change" event doesn't get triggered when I change the
    // value of "file" using JS, so I have to tirgger it manualy.
    $('#file').trigger('change');
});

/**
 * Enable (0) or Disable (1) the file selection
 * @param {number} val Value
 */
function setState(val) {
    switch (val) {
        case 0:
            $("#droparea").css("pointer-events", "unset");
            $("#upload").prop("disabled", false);
            $("#upload").text(`Upload`);
            break;

        case 1: 
            $("#droparea").css("pointer-events", "none");
            $("#upload").prop("disabled", true);
            break;
    }
}

/**
 * Event
 * Fires when the "Upload" button is clicked
 */
$("#upload").on('click', function() {
    setState(1);

    $.ajax({
        type: "POST",
        url: "/api/upload",
        xhr: function () {
            var aXHR = $.ajaxSettings.xhr();
            if (aXHR.upload) {
                aXHR.upload.addEventListener('progress', function(progress) {
                    const percent = Math.floor((100 / progress.total) * progress.loaded);
                    $("#upload").text(`${percent}% uploaded`);
                }, false);
            }
            return aXHR;
        },
        success: function (data) {
            if (data.success) {
                window.location.href = data.id;
            } else {
                notyf.error(data.error);
                setState(0);
            }
        },
        error: function (error) {
            notyf.error("Internal error. Try later.");
            setState(0);
        },
        async: true,
        data: new FormData($('#upload-form')[0]),
        cache: false,
        contentType: false,
        processData: false
    });
});