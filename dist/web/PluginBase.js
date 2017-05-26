"use strict";
var RX = require("reactxp");
var ReactDOM = require("react-dom");
var Animated = require("animated");
var CSSPropertyOperations = require('react-dom/lib/CSSPropertyOperations');

// For ReactXP web we need to flatten the styles prop. This can be a recursive flatten as it may be as array of array.
// Need to look into most performant way.
var Flatten = function (styles) {
    var array = Array.isArray(styles);
    if (array) {
        var flatArray = {};
        styles.forEach(function (style) {
            Object.assign(flatArray,Flatten(style));
        });
        return flatArray;
    }
    else {
        return styles;
    }
};

Animated.inject.FlattenStyle(function (styles) {
    return Flatten(styles);
});

// For ReactXP web we need to apply the animated values, as presented by RX.Styles.createAnimatedViewStyle.
// For now just doing transform.

const suffix = {
    translateX: 'px',
    translateY: 'px',
    translateZ: 'px',
}

// { scale: 2 } => 'scale(2)'
function mapTransform(t) {
  var k = Object.keys(t)[0];
  var x = suffix[k];
  return `${k}(${t[k]}${x})`;
}


// Since this is a hot code path, right now this is mutative...

function mapStyle(style) {
  if (style && style.transform && typeof style.transform !== 'string') {
    // this doesn't attempt to use vendor prefixed styles
    style.transform = style.transform.map(mapTransform).join(' ');
  }
  return style;
}

function SetAnimatedValues(instance, props, comp) {
  if (instance.setNativeProps) {
    instance.setNativeProps(props);
  } else if (instance.nodeType && instance.setAttribute !== undefined) {
    CSSPropertyOperations.setValueForStyles(instance, mapStyle(props.style), comp._reactInternalInstance);
  } else {
    return false;
  }
}

function ApplyAnimatedValues(instance, props, comp) {
       var element = ReactDOM.findDOMNode(comp.refs['node']);
       return SetAnimatedValues(element,props,comp);
}   

Animated
    .inject
    .ApplyAnimatedValues(ApplyAnimatedValues);  
     
// create some view animated by animatedjs
var view = Animated.createAnimatedComponent(RX.View);
var text = Animated.createAnimatedComponent(RX.Text);

Animated.View = view;
Animated.Text = text;
exports.Animated = Animated;

