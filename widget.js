chrome.extension.sendMessage({}, function(res){
  var playton = {
      settings: {
      currentSpeed: 1.0,
      speedStep: 0.1
    }
  };
  
  chrome.storage.sync.get(playton.settings, function(storage){
    playton.settings.currentSpeed = Number(storage.currentSpeed);
    playton.settings.speedStep = Number(storage.speedStep);
    
    initializeWhenReady(document);
  });
  
  var forEach = Array.prototype.forEach;
  
  function initializePlaybackController() {
    playton.controller = function(target) {
      this.video = target;
      this.parent = target.parentElement;
      this.document = target.ownerDocument;
      this.id = Date.now();
      
      this.initializeControls();
    };
    
    playton.controller.prototype.initializeControls = function() {
      var speed = parseFloat(playton.settings.currentSpeed).toFixed(2);
      var position = [
        Math.max(this.video.offsetTop, 10) + 'px',
        Math.max(this.video.offsetLeft, 10) + 'px'
      ]; // [top, left]
      
      var wrapper = document.createElement('div');
      wrapper.classList.add('playton-controller');
      wrapper.dataset.playtonid = this.id;

      var template = `
        <div id="playton-controller" style="position: relative; z-index: 9999; top:${position[0]}; left:${position[1]}">
          <span data-action="drag" class="draggable">${speed}</span>
          <span id="controls">
            TESTTEST
          </span>
        </div>
      `;
      
      var controller = wrapper.createShadowRoot();
      controller.innerHTML = template;
      
      this.speedIndicator = controller.querySelector('span');
      var fragment = document.createDocumentFragment();
      fragment.appendChild(wrapper);

      this.video.classList.add('playton-initialized');
      this.video.dataset['playtonid'] = this.id;
      
      this.parent.insertBefore(fragment, this.parent.firstChild);
    }
  }
  
  function initializeWhenReady(document) {
    window.onload = () => initializeNow(document);
    if (document) {
      if (document.readyState === "complete") {
        initializeNow(document);
      } else {
        document.onreadystatechange = () => {
          if (document.readyState === "complete") {
            initializeNow(document);
          }
        }
      }
    }
  }

  function initializeNow(document) {
      if (document.body.classList.contains('playton-initialized')) {
        return;
      }
      document.body.classList.add('playton-initialized');

      if (document === window.document) {
        initializePlaybackController();
      } else {
        var link = document.createElement('link');
        link.href = chrome.extension.getURL('inject.css');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      function checkForVideo(node, parent, added) {
        if (node.nodeName === 'VIDEO') {
          if (added) {
            new playton.controller(node, parent);
          } else {
            if (node.classList.contains('playton-initialized')) {
              let id = node.dataset['playtonid'];
              let ctrl = document.querySelector(`div[data-playtonid="${id}"]`)
              if (ctrl) {
                node.classList.remove('playton-initialized');
                delete node.dataset['playtonid'];
                ctrl.remove();
              }
            }
          }
        } else if (node.children != undefined) {
          for (var i = 0; i < node.children.length; i++) {
            checkForVideo(node.children[i],
                          node.children[i].parentNode || parent,
                          added);
          }
        }
      }
      var videoTags = document.getElementsByTagName('video');
      forEach.call(videoTags, function(video) {
        new playton.controller(video);
      });
  }
});
