/* angular-meditor directive
 */

/**
 * angular-strap
 * @version v2.3.12 - 2017-01-26
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes <olivier@mg-crea.com> (https://github.com/mgcrea)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */


angular.module('colorpicker.module', [])
  .factory('Helper', function () {
    return {
      closestSlider: function (elem) {
        var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
        if (matchesSelector.bind(elem)('I')) {
          return elem.parentNode;
        }
        return elem;
      },
      getOffset: function (elem) {
        var
          x = 0,
          y = 0;
        while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
          x += elem.offsetLeft;
          y += elem.offsetTop;
          elem = elem.offsetParent;
        }
        return {
          top: y,
          left: x
        };
      },
      // a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
      stringParsers: [
        {
          re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
          parse: function (execResult) {
            return [
              execResult[1],
              execResult[2],
              execResult[3],
              execResult[4]
            ];
          }
        },
        {
          re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
          parse: function (execResult) {
            return [
              2.55 * execResult[1],
              2.55 * execResult[2],
              2.55 * execResult[3],
              execResult[4]
            ];
          }
        },
        {
          re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
          parse: function (execResult) {
            return [
              parseInt(execResult[1], 16),
              parseInt(execResult[2], 16),
              parseInt(execResult[3], 16)
            ];
          }
        },
        {
          re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
          parse: function (execResult) {
            return [
              parseInt(execResult[1] + execResult[1], 16),
              parseInt(execResult[2] + execResult[2], 16),
              parseInt(execResult[3] + execResult[3], 16)
            ];
          }
        }
      ]
    };
  })
  .factory('Color', ['Helper', function (Helper) {
    return {
      value: {
        h: 1,
        s: 1,
        b: 1,
        a: 1
      },
      // translate a format from Color object to a string
      'rgb': function () {
        var rgb = this.toRGB();
        return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
      },
      'rgba': function () {
        var rgb = this.toRGB();
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
      },
      'hex': function () {
        return this.toHex();
      },

      // HSBtoRGB from RaphaelJS
      RGBtoHSB: function (r, g, b, a) {
        r /= 255;
        g /= 255;
        b /= 255;

        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C === 0 ? null :
          V == r ? (g - b) / C :
            V == g ? (b - r) / C + 2 :
              (r - g) / C + 4
        );
        H = ((H + 360) % 6) * 60 / 360;
        S = C === 0 ? 0 : C / V;
        return { h: H || 1, s: S, b: V, a: a || 1 };
      },

      HueToRGB: function (p, q, h) {
        if (h < 0)
          h += 1;
        else if (h > 1)
          h -= 1;

        if ((h * 6) < 1)
          return p + (q - p) * h * 6;
        else if ((h * 2) < 1)
          return q;
        else if ((h * 3) < 2)
          return p + (q - p) * ((2 / 3) - h) * 6;
        else
          return p;
      },

      //parse a string to HSB
      setColor: function (val) {
        val = val.toLowerCase();
        for (var key in Helper.stringParsers) {
          var parser = Helper.stringParsers[key];
          var match = parser.re.exec(val),
            values = match && parser.parse(match),
            space = parser.space || 'rgba';
          if (values) {
            this.value = this.RGBtoHSB.apply(null, values);
            return false;
          }
        }
      },

      setHue: function (h) {
        this.value.h = 1 - h;
      },

      setSaturation: function (s) {
        this.value.s = s;
      },

      setLightness: function (b) {
        this.value.b = 1 - b;
      },

      setAlpha: function (a) {
        this.value.a = parseInt((1 - a) * 100, 10) / 100;
      },

      // HSBtoRGB from RaphaelJS
      // https://github.com/DmitryBaranovskiy/raphael/
      toRGB: function (h, s, b, a) {
        if (!h) {
          h = this.value.h;
          s = this.value.s;
          b = this.value.b;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = b * s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = b - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return {
          r: Math.round(R * 255),
          g: Math.round(G * 255),
          b: Math.round(B * 255),
          a: a || this.value.a
        };
      },

      toHex: function (h, s, b, a) {
        var rgb = this.toRGB(h, s, b, a);
        return '#' + ((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
      }
    };
  }])
  .factory('Slider', ['Helper', function (Helper) {
    var
      slider = {
        maxLeft: 0,
        maxTop: 0,
        callLeft: null,
        callTop: null,
        knob: {
          top: 0,
          left: 0
        }
      },
      pointer = {};

    return {
      getSlider: function () {
        return slider;
      },
      getLeftPosition: function (event) {
        return Math.max(0, Math.min(slider.maxLeft, slider.left + ((event.pageX || pointer.left) - pointer.left)));
      },
      getTopPosition: function (event) {
        return Math.max(0, Math.min(slider.maxTop, slider.top + ((event.pageY || pointer.top) - pointer.top)));
      },
      setSlider: function (event, fixedPosition) {
        var target = Helper.closestSlider(event.target);
        slider.knob = target.children[0].style;
        slider.left = event.pageX - Helper.getOffset(target).left;
        slider.top = event.pageY - Helper.getOffset(target).top;

        if (fixedPosition) {
          slider.left -= window.pageXOffset;
          slider.top -= window.pageYOffset;
        }
        pointer = {
          left: event.pageX,
          top: event.pageY
        };
      },
      setSaturation: function (event, fixedPosition) {
        slider = {
          maxLeft: 100,
          maxTop: 100,
          callLeft: 'setSaturation',
          callTop: 'setLightness'
        };
        this.setSlider(event, fixedPosition)
      },
      setHue: function (event, fixedPosition) {
        slider = {
          maxLeft: 0,
          maxTop: 100,
          callLeft: false,
          callTop: 'setHue'
        };
        this.setSlider(event, fixedPosition)
      },
      setAlpha: function (event, fixedPosition) {
        slider = {
          maxLeft: 0,
          maxTop: 100,
          callLeft: false,
          callTop: 'setAlpha'
        };
        this.setSlider(event, fixedPosition)
      },
      setKnob: function (top, left) {
        slider.knob.top = top + 'px';
        slider.knob.left = left + 'px';
      }
    };
  }])
  .directive('colorpicker', ['$document', '$compile', 'Color', 'Slider', 'Helper', function ($document, $compile, Color, Slider, Helper) {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, elem, attrs, ngModel) {
        var
          template =
            '<div class="colorpicker f-dropdown">' +
            '<colorpicker-saturation><i></i></colorpicker-saturation>' +
            '<colorpicker-hue><i></i></colorpicker-hue>' +
            '<colorpicker-alpha><i></i></colorpicker-alpha>' +
            '<colorpicker-preview></colorpicker-preview>' +
            '<button class="tiny secondary button right">&times;</button>' +
            '</div>',
          colorpickerTemplate = angular.element(template),
          pickerColor = Color,
          sliderAlpha,
          sliderHue = colorpickerTemplate.find('colorpicker-hue'),
          sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
          colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
          pickerColorPointers = colorpickerTemplate.find('i'),
          thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
          fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
          target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body);

        $compile(colorpickerTemplate)($scope);

        var bindMouseEvents = function () {
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        };

        if (thisFormat === 'rgba') {
          colorpickerTemplate.addClass('alpha');
          sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
          sliderAlpha
            .on('click', function (event) {
              Slider.setAlpha(event, fixedPosition);
              mousemove(event);
            })
            .on('mousedown', function (event) {
              Slider.setAlpha(event, fixedPosition);
              bindMouseEvents();
            });
        }

        sliderHue
          .on('click', function (event) {
            Slider.setHue(event, fixedPosition);
            mousemove(event);
          })
          .on('mousedown', function (event) {
            Slider.setHue(event, fixedPosition);
            bindMouseEvents();
          });

        sliderSaturation
          .on('click', function (event) {
            Slider.setSaturation(event, fixedPosition);
            mousemove(event);
          })
          .on('mousedown', function (event) {
            Slider.setSaturation(event, fixedPosition);
            bindMouseEvents();
          });

        if (fixedPosition) {
          colorpickerTemplate.addClass('colorpicker-fixed-position');
        }

        target.append(colorpickerTemplate);

        if (ngModel) {
          ngModel.$render = function () {
            elem.val(ngModel.$viewValue);
          };
          $scope.$watch(attrs.ngModel, function () {
            update();
          });
        }

        elem.on('$destroy', function () {
          colorpickerTemplate.remove();
        });

        var previewColor = function () {
          try {
            colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
          } catch (e) {
            colorpickerPreview.css('backgroundColor', pickerColor.toHex());
          }
          sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
          if (thisFormat === 'rgba') {
            sliderAlpha.css.backgroundColor = pickerColor.toHex();
          }
        };

        var mousemove = function (event) {
          var
            left = Slider.getLeftPosition(event),
            top = Slider.getTopPosition(event),
            slider = Slider.getSlider();

          Slider.setKnob(top, left);

          if (slider.callLeft) {
            pickerColor[slider.callLeft].call(pickerColor, left / 100);
          }
          if (slider.callTop) {
            pickerColor[slider.callTop].call(pickerColor, top / 100);
          }
          previewColor();
          var newColor = pickerColor[thisFormat]();
          elem.val(newColor);
          if (ngModel) {
            $scope.$apply(ngModel.$setViewValue(newColor));
          }
          return false;
        };

        var mouseup = function () {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        };

        var update = function () {
          pickerColor.setColor(elem.val());
          pickerColorPointers.eq(0).css({
            left: pickerColor.value.s * 100 + 'px',
            top: 100 - pickerColor.value.b * 100 + 'px'
          });
          pickerColorPointers.eq(1).css('top', 100 * (1 - pickerColor.value.h) + 'px');
          pickerColorPointers.eq(2).css('top', 100 * (1 - pickerColor.value.a) + 'px');
          previewColor();
        };

        var getColorpickerTemplatePosition = function () {
          var
            positionValue,
            positionOffset = Helper.getOffset(elem[0]);

          positionValue = {
            'top': positionOffset.top + elem[0].offsetHeight,
            'left': positionOffset.left
          };

          return {
            'top': positionValue.top + 'px',
            'left': positionValue.left + 'px'
          };
        };

        elem.on('click', function () {
          update();
          colorpickerTemplate
            .addClass('colorpicker-visible')
            .css(getColorpickerTemplatePosition());
        });

        colorpickerTemplate.on('mousedown', function (event) {
          event.stopPropagation();
          event.preventDefault();
        });

        var hideColorpickerTemplate = function () {
          if (colorpickerTemplate.hasClass('colorpicker-visible')) {
            colorpickerTemplate.removeClass('colorpicker-visible');
          }
        };

        colorpickerTemplate.find('button').on('click', function () {
          hideColorpickerTemplate();
        });

        $document.on('mousedown', function () {
          hideColorpickerTemplate();
        });
      }
    };
  }]);

angular.module('angular-meditor', ['colorpicker.module'])
  .directive('meditor', ['$timeout', function ($timeout) {
    //ng-click="SimpleAction('insertImage', 'http://cfis.github.io/free-image-ruby/cookbook/lena_rotate_ex_45_masked.png')"
    return {
      scope: {
        ngModel: '=',
        toolbarContainer: '@?'
      },
      require: '?ngModel',
      transclude: true,
      template: "\n<div class=\"angular-meditor\">\n  <div class=\"angular-meditor-toolbar\" style=\"top: {{ position.top }}px; left: {{ position.left }}px\" ng-class=\"{ 'angular-meditor-toolbar--show': model.showToolbar, 'angular-meditor-toolbar--bottom': position.below }\">\n    <ul ng-if=\"!imageInsert\">\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('bold')\" class=\"meditor-button-bold\" ng-class=\"{ 'bold': 'meditor-button--active' }[styles.fontWeight]\">\n          B\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('italic')\" class=\"meditor-button-italic\" ng-class=\"{ 'italic': 'meditor-button--active' }[styles.fontStyle]\">\n          I\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('underline')\" class=\"meditor-button-underline\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          U\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('insertUnorderedList')\" class=\"meditor-button-list-ul\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          <i class=\"fa fa-list-ul\"></i>\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('insertOrderedList')\" class=\"meditor-button-list-ol\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          <i class=\"fa fa-list-ol\"></i>\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" ng-click=\"SimpleAction('formatBlock', 'blockquote')\" class=\"meditor-button-quote\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          <i class=\"fa fa-quote-right\"></i>\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" class=\"meditor-button-quote\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\"\n          colorpicker ng-change=\"SimpleAction('foreColor', color)\" ng-model=\"color\">\n          <i class=\"fa fa-font\"></i>\n        </button>\n      </li>\n      <li>\n        <label class=\"meditor-select\">\n          <select ng-model=\"size\" ng-options=\"s.value as s.label for s in sizeOptions\" class=\"meditor-size-selector\"></select>\n        </label>\n      </li>\n      <li>\n        <label class=\"meditor-select\">\n          <select ng-model=\"family\" ng-options=\"s as s.label for s in familyOptions\" class=\"meditor-family-selector\"></select>\n        </label>\n      </li>\n      <li>\n        <button type=\"button\" insert-form insert-link=\"true\" class=\"meditor-button-link\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          <i class=\"fa fa-link\"></i>\n        </button>\n      </li>\n      <li>\n        <button type=\"button\" insert-form class=\"meditor-button-link\" ng-class=\"{ 'underline': 'meditor-button--active' }[styles.textDecoration]\">\n          <i class=\"fa fa-picture-o\"></i>\n        </button>\n      </li>\n    </ul>\n  </div>\n  <div class=\"angular-meditor-content\" contenteditable meditor-contenteditable ng-model=\"model.ngModel\" ng-transclude></div>\n</div>\n",
      link: function (scope, element, attributes, ctrl) {

        scope.model = {
          ngModel: scope.ngModel,
          showToolbar: false
        };

        scope.imageLink = '';
        scope.imageInsert = false;

        scope.showInsertImage = function () {
          scope.$applyAsync(function () {
            alert(123);
            //scope.imageInsert = !scope.imageInsert;
          })
        }

        scope.link = {
          title: '',
          link: ''
        }

        scope.color = '';

        scope.$watch('model.ngModel', function () {
          $timeout(function () {
            scope.ngModel = scope.model.ngModel;
          });
        });

        // toolbar position
        scope.position = {
          top: 10,
          left: 10,
          below: false
        };

        // fontSize options
        scope.sizeOptions = [
          {
            label: '10',
            value: 1
          },
          {
            label: '13',
            value: 2
          },
          {
            label: '16',
            value: 3
          },
          {
            label: '18',
            value: 4
          },
          {
            label: '24',
            value: 5
          },
          {
            label: '32',
            value: 6
          },
          {
            label: '48',
            value: 7
          }
        ];
        scope.size = scope.sizeOptions[0].value;

        scope.familyOptions = [
          {
            label: 'Open Sans',
            value: 'Open Sans, sans-serif'
          },
          {
            label: 'Source Sans Pro',
            value: 'Source Sans Pro, sans-serif'
          },
          {
            label: 'Exo',
            value: 'Exo, sans-serif'
          },
          {
            label: 'Oswald',
            value: 'Oswald, sans-serif'
          },
          {
            label: 'Cardo',
            value: 'Cardo, serif'
          },
          {
            label: 'Vollkorn',
            value: 'Vollkorn, serif'
          },
          {
            label: 'Old Standard TT',
            value: 'Old Standard TT, serif'
          }
        ];
        scope.family = scope.familyOptions[0];

        // current styles of selected elements
        // used to highlight active buttons
        scope.styles = {};

        // tags generated by the editor
        // used to highlight active styles
        var generatedTags = {
          'b': '',
          'strong': '',
          'i': '',
          'em': '',
          'u': '',
          'blockquote': ''
        };

        // Remy Sharp's debounce
        // https://remysharp.com/2010/07/21/throttling-function-calls
        var debounce = function (fn, delay) {
          var timer = null;
          return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(context, args);
            }, delay);
          };
        };

        var $toolbar = angular.element(element[0].querySelector('.angular-meditor-toolbar'));
        var $content = angular.element(element[0].querySelector('.angular-meditor-content'));
        var $selects = angular.element(element[0].querySelector('select'));
        var $body = angular.element(document.querySelector(scope.toolbarContainer) || document.body);

        // position the toolbar above or below the selected text
        var setToolbarPosition = function () {
          var toolbarHeight = $toolbar[0].offsetHeight;
          var toolbarWidth = $toolbar[0].offsetWidth;
          var spacing = 5;
          var selection = window.getSelection();
          var range = selection.getRangeAt(0);
          var boundary = range.getBoundingClientRect();

          var topPosition = boundary.top;
          var leftPosition = boundary.left;

          // if there isn't enough space at the top, place it at the bottom
          // of the selection
          if (boundary.top < (toolbarHeight + spacing)) {
            scope.position.top = topPosition + boundary.height + spacing;
            // tell me if it's above or below the selection
            // used in the template to place the triangle above or below
            scope.position.below = true;
          } else {
            scope.position.top = topPosition - toolbarHeight - spacing;
            scope.position.below = false;
          }

          // center toolbar above selected text
          scope.position.left = leftPosition - (toolbarWidth / 2) + (boundary.width / 2);

          // cross-browser window scroll positions
          var scrollLeft = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

          // add the scroll positions
          // because getBoundingClientRect gives us the position
          // relative to the viewport, not to the page
          scope.position.top += scrollTop;
          scope.position.left += scrollLeft;

          return this;
        };

        // get current selection and act on toolbar depending on it
        var checkSelection = function (e) {

          // if you click something from the toolbar
          // don't do anything
          if (e && e.target && $toolbar.find(e.target).length) {
            return false;
          }

          var newSelection = window.getSelection();

          // get selection node
          var anchorNode = newSelection.anchorNode;

          // if nothing selected, hide the toolbar
          if (newSelection.toString().trim() === '' || !anchorNode) {
            // hide the toolbar
            return $timeout(function () {
              scope.model.showToolbar = false;
            });
          }

          // check if selection is in the current editor/directive container
          var parentNode = anchorNode.parentNode;
          while (parentNode.tagName !== undefined && parentNode !== element[0]) {
            parentNode = parentNode.parentNode;
          }

          // if the selection is in the current editor
          if (parentNode === element[0]) {
            // show the toolbar
            $timeout(function () {
              scope.model.showToolbar = true;
              setToolbarPosition();
            });

            // check selection styles and active buttons based on it
            checkActiveButtons(newSelection);
          } else {
            // hide the toolbar
            $timeout(function () {
              scope.model.showToolbar = false;
            });
          }

          return this;
        };

        // check current selection styles and activate buttons
        var checkActiveButtons = function (selection) {
          var parentNode = selection.anchorNode;

          if (!parentNode.tagName) {
            parentNode = selection.anchorNode.parentNode;
          }

          var childNode = parentNode.childNodes[0];

          if (childNode && childNode.tagName && childNode.tagName.toLowerCase() in generatedTags) {
            parentNode = parentNode.childNodes[0];
          }

          $timeout(function () {
            // get real styles of selected element
            scope.styles = window.getComputedStyle(parentNode, null);

            if (scope.styles.fontSize !== scope.size.label + 'px') {
              // set font size selector
              angular.forEach(scope.sizeOptions, function (size, i) {
                if (scope.styles.fontSize === (size.label + 'px')) {
                  scope.size = scope.sizeOptions[i].value;
                  return false;
                }
              });
            }

          });

        };

        // check selection when selecting with the shift key
        $content.bind('keyup', checkSelection);

        // check the selection on every mouseup
        // it also triggeres when releasing outside the browser

        // use debounce to fix issue with Chrome
        // getting the right selection only after a delay
        // if selecting text, then single-clicking the selected text
        document.addEventListener('mouseup', debounce(checkSelection, 200));

        $content.bind('blur', debounce(checkSelection, 200));

        // if after a selection in the select,
        // the contenteditable doesn't get the focus
        // the toolbar will not hide on blur.
        // so I have to add a blur event to the selects.
        $selects.bind('blur', debounce(checkSelection, 200));

        // simple edit action - bold, italic, underline
        scope.SimpleAction = function (action, tag) {
          if (!tag) tag = null;
          document.execCommand('styleWithCSS', false, false);
          document.execCommand(action, false, tag);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        };

        // watch the font size selector
        scope.$watch('size', function () {
          document.execCommand('styleWithCSS', false, false);
          document.execCommand('fontSize', false, scope.size);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        });

        // watch the font family selector
        scope.$watch('family', function () {
          // dynamically load the family from google fonts
          if (window.WebFont) {
            WebFont.load({
              google: {
                families: [scope.family.label]
              }
            });
          }

          document.execCommand('styleWithCSS', false, true);
          document.execCommand('fontName', false, scope.family.value);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        });

        // load google webfont library
        // to be able to dynamically load fonts
        (function () {
          var wf = document.createElement('script');
          wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
          wf.type = 'text/javascript';
          wf.async = 'true';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(wf, s);
        })();

        // move the toolbar to the body, we can use overflow: hidden on containers
        $body.append($toolbar);

      }
    };
  }])
  .directive('meditorContenteditable', ['$timeout', function ($timeout) {
    'use strict';

    return {
      require: '?ngModel',
      link: function (scope, elm, attrs, ctrl) {

        // don't throw an error without ng-model
        if (typeof scope.ngModel !== 'undefined') {

          var change = function () {
            $timeout(function () {
              ctrl.$setViewValue(elm.html());
            });
          };

          // custom event to change the ngModel after using
          // actions from the editor
          scope.$on('meditor-change', change);

          elm.on('blur keyup', change);

          ctrl.$render = function () {
            elm.html(ctrl.$viewValue);
          };

          ctrl.$setViewValue(scope.ngModel);
          elm.html(ctrl.$viewValue);

          scope.$watch('ngModel', function (ngModel) {
            // change the html only if it's different from the model
            // eg. on outside changes
            // so we don't lose the selection when editing with the
            // editor toolbar
            if (elm.html() !== ngModel) {
              elm.html(ngModel);
            }
          });

        }

      }
    };
  }])
  .directive('insertForm', ['$document', '$compile', function ($document, $compile) {
    return {
      require: '?ngModel',
      restrict: 'A',
      scope: {
        insertLink: "="
      },
      link: function ($scope, elem, attrs, ngModel) {
        function guid() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        }
        $scope.inputId = guid();
        $scope.insertData = 'https://blog.optimizely.com/wp-content/uploads/2013/06/Screen-Shot-2013-06-11-at-6.27.42-PM.png';
        var
          template =
            '<div class="colorpicker f-dropdown">' +
            '<input ng-model="insertData" id="{{ inputId }}" />' +
            '<button class="tiny secondary button right" ng-click="SimpleAction()">Insert</button>' +
            '</div>',
          colorpickerTemplate = angular.element(template),
          fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
          target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body);

        $compile(colorpickerTemplate)($scope);

        function handlePaste(e) {
          var clipboardData, pastedData;

          // Stop data actually being pasted into div
          e.stopPropagation();
          e.preventDefault();

          // Get pasted data via clipboard API
          clipboardData = e.clipboardData || window.clipboardData;
          pastedData = clipboardData.getData('Text');

          // Do whatever with pasteddata
          $scope.$applyAsync(function () {
            $scope.insertData = pastedData;
          });
        }

        window.addEventListener('paste', handlePaste);

        var input = document.getElementById($scope.inputId);

        function appendCharacter(c) {
          $scope.$applyAsync(function () {
            switch (c) {
              case 8: // Backspace
                $scope.insertData = $scope.insertData.slice(0, -1);
                break;
              default:
                $scope.insertData = $scope.insertData + String.fromCharCode(c);
            }
          })

        }

        // Keypress gets the keyCode of the current character not key.
        // e.g. pressing the 'A' key will result in 'a' unless 'Shift' is also held.
        window.addEventListener('keypress', function (e) {
          appendCharacter(e.keyCode);
        });

        // Use Keydown to get special keys like Backspace, Enter, Esc.
        window.addEventListener('keydown', function (e) {
          switch (e.keyCode) {
            case 8: // Backspace
              e.preventDefault(); // Stops the backspace key from acting like the back button.
              appendCharacter(e.keyCode);
              break;
          }
        });

        var bindMouseEvents = function () {
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        };

        $scope.SimpleAction = function () {
          var action = 'insertImage',
            tag = $scope.insertData;
          if (!$scope.insertLink) {
            action = 'insertImage';
          } else {
            action = 'createLink'
          }
          document.execCommand('styleWithCSS', false, false);
          document.execCommand(action, false, tag);

          // custom event for two-way binding
          $scope.$broadcast('meditor-change');
        };

        /*if (fixedPosition) {
          colorpickerTemplate.addClass('colorpicker-fixed-position');
        }*/

        target.append(colorpickerTemplate);

        if (ngModel) {
          ngModel.$render = function () {
            elem.val(ngModel.$viewValue);
          };
          $scope.$watch(attrs.ngModel, function () {
            update();
          });
        }

        elem.on('$destroy', function () {
          colorpickerTemplate.remove();
        });

        var mouseup = function () {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        };

        var getColorpickerTemplatePosition = function () {
          var
            positionValue,
            positionOffset = function (elem) {
              var
                x = 0,
                y = 0;
              while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
                x += elem.offsetLeft;
                y += elem.offsetTop;
                elem = elem.offsetParent;
              }
              return {
                top: y,
                left: x
              };
            }(elem[0]);

          positionValue = {
            'top': positionOffset.top + elem[0].offsetHeight,
            'left': positionOffset.left
          };

          return {
            'top': positionValue.top + 'px',
            'left': positionValue.left + 'px'
          };
        };

        elem.on('click', function () {
          colorpickerTemplate
            .addClass('colorpicker-visible')
            .css(getColorpickerTemplatePosition());
        });

        colorpickerTemplate.on('mousedown', function (event) {
          event.stopPropagation();
          event.preventDefault();
        });

        var hideColorpickerTemplate = function () {
          if (colorpickerTemplate.hasClass('colorpicker-visible')) {
            colorpickerTemplate.removeClass('colorpicker-visible');
          }
        };

        colorpickerTemplate.find('button').on('click', function () {
          hideColorpickerTemplate();
        });

        $document.on('mousedown', function () {
          hideColorpickerTemplate();
        });
      }
    };
  }])