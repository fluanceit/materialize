Materialize.snackbar = function(message, displayLength, actionMessage, actionCallback, className, actionClassName, completeCallback) {
    className = className || "";

    var container = document.getElementById('snackbar-container');

    // Create snackbar container if it does not exist
    if (container === null) {
        // create notification container
        container = document.createElement('div');
        container.id = 'snackbar-container';
        document.body.appendChild(container);
    }

    // Select and append snackbar
    var newSnackbar = createSnackbar(message, actionMessage, actionCallback, className, actionClassName);

    // only append snackbar if message is not undefined
    if (message) {
        container.appendChild(newSnackbar);
    }

    // TODO: Find out if there is a second line needed
    newSnackbar.style.top = '48dp';
    newSnackbar.style.opacity = 0;

    // Animate snackbar in
    Vel(newSnackbar, {
        "top": "0px",
        opacity: 1
    }, {
        duration: 1500,
        easing: 'easeOutCubic',
        queue: false
    });

    // Allows timer to be pause while being panned
    var timeLeft = displayLength;
    var counterInterval = setInterval(function() {


        if (newSnackbar.parentNode === null)
            window.clearInterval(counterInterval);

        // If toast is not being dragged, decrease its time remaining
        if (!newSnackbar.classList.contains('panning')) {
            timeLeft -= 20;
        }

        if (timeLeft <= 0) {
            // Animate toast out
            Vel(newSnackbar, {
                "opacity": 0,
                marginTop: '-48dp'
            }, {
                duration: 1500,
                easing: 'easeOutExpo',
                queue: false,
                complete: function() {
                    // Call the optional callback
                    if (typeof(completeCallback) === "function")
                        completeCallback();
                    // Remove toast after it times out
                    this[0].parentNode.removeChild(this[0]);
                }
            });
            window.clearInterval(counterInterval);
        }
    }, 20);

    function createSnackbar(html, actionMessage, actionCallback, className, actionClassName) {

        // Create snackbar
        var snackbar = document.createElement('div');
        snackbar.classList.add('snackbar');
        if (className) {
            var classes = className.split(' ');

            for (var i = 0, count = classes.length; i < count; i++) {
                snackbar.classList.add(classes[i]);
            }
        }

        var message = document.createElement('span');
        message.innerHTML = html;

        snackbar.appendChild(message);

        if (actionMessage) {
            var action = document.createElement('a');
            action.innerHTML = actionMessage;
            if (actionClassName) {
                var actionClasses = actionClassName.split(' ');
                for (var i = 0, count = actionClasses.length; i < count; i++) {
                    action.classList.add(actionClasses[i]);
                }
            }
            if (actionCallback) {
                action.onclick = actionCallback;
            }
            snackbar.appendChild(action);
        }




        // Bind hammer
        var hammerHandler = new Hammer(snackbar, {
            prevent_default: false
        });
        hammerHandler.on('pan', function(e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // Change snackbar state
            if (!snackbar.classList.contains('panning')) {
                snackbar.classList.add('panning');
            }

            var opacityPercent = 1 - Math.abs(deltaX / activationDistance);
            if (opacityPercent < 0)
                opacityPercent = 0;

            Vel(snackbar, {
                left: deltaX,
                opacity: opacityPercent
            }, {
                duration: 50,
                queue: false,
                easing: 'easeOutQuad'
            });

        });

        hammerHandler.on('panend', function(e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // If snackbar dragged past activation point
            if (Math.abs(deltaX) > activationDistance) {
                Vel(snackbar, {
                    marginTop: '-48dp'
                }, {
                    duration: 1500,
                    easing: 'easeOutExpo',
                    queue: false,
                    complete: function() {
                        if (typeof(completeCallback) === "function") {
                            completeCallback();
                        }
                        snackbar.parentNode.removeChild(snackbar);
                    }
                });

            } else {
                snackbar.classList.remove('panning');
                // Put snackbar back into original position
                Vel(snackbar, {
                    left: 0,
                    opacity: 1
                }, {
                    duration: 15000,
                    easing: 'easeOutExpo',
                    queue: false
                });

            }
        });

        return snackbar;
    }
};
