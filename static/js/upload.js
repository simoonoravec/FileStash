$("#file").on('change', function () {
    const fileName = this.value.split('\\').pop().split('/').pop();

    if (( this.files[0].size / 1000 ) > config.file_max_size) {
        const max_size = humanReadableSize(config.file_max_size);
        notyf.error(`File is too big! Max. ${max_size}`);

        return;
    }

    $("#file-input-btn").text("Select different file");
    $("#file-name").text(fileName);
    $("#file-size").text(humanReadableSize(this.files[0].size/1000));
});

$("#upload").on('click', function() {
    $("#upload-form").hide();
    $("#upload").prop("disabled", true);

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
                $("#upload-form").show();
                $("#upload").prop("disabled", false);
                $("#upload").text(`Upload`);
            }
        },
        error: function (error) {
            notyf.error("Internal error. Try later.");
            $("#upload-form").show();
            $("#upload").prop("disabled", false);
            $("#upload").text(`Upload`);
        },
        async: true,
        data: new FormData($('#upload-form')[0]),
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
});