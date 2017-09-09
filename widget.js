chrome.extension.sendMessage({}, function(res){
  var settings = {
    currentSpeed: 1.0,
    speedStep: 0.1
  };
  
  chrome.storage.sync.get(settings, function(storage){
    settings.currentSpeed = Number(storage.currentSpeed);
    settings.speedStep = Number(storage.speedStep);
  });
});
