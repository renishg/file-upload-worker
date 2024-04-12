self.addEventListener('message', function(e) {
  var file = e.data.file;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      var percentComplete = (event.loaded / event.total) * 100;
      self.postMessage({ type: 'progress', percent: percentComplete });
    }
  };

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        self.postMessage({ type: 'complete', response: xhr.responseText });
      } else {
        self.postMessage({ type: 'error', response: xhr.responseText });
      }
    }
  };

  var formData = new FormData();
  formData.append('file', file);
  xhr.send(formData);
}, false);
