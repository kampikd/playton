document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#config').addEventListener('click', function() {
    window.open(chrome.extension.getURL("options.html"));
  });
});
