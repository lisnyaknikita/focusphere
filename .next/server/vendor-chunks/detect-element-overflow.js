"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/detect-element-overflow";
exports.ids = ["vendor-chunks/detect-element-overflow"];
exports.modules = {

/***/ "(ssr)/./node_modules/detect-element-overflow/dist/index.js":
/*!************************************************************!*\
  !*** ./node_modules/detect-element-overflow/dist/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ detectElementOverflow)\n/* harmony export */ });\nfunction getRect(element) {\n    return element.getBoundingClientRect();\n}\nfunction detectElementOverflow(element, container) {\n    return {\n        get collidedTop() {\n            return getRect(element).top < getRect(container).top;\n        },\n        get collidedBottom() {\n            return getRect(element).bottom > getRect(container).bottom;\n        },\n        get collidedLeft() {\n            return getRect(element).left < getRect(container).left;\n        },\n        get collidedRight() {\n            return getRect(element).right > getRect(container).right;\n        },\n        get overflowTop() {\n            return getRect(container).top - getRect(element).top;\n        },\n        get overflowBottom() {\n            return getRect(element).bottom - getRect(container).bottom;\n        },\n        get overflowLeft() {\n            return getRect(container).left - getRect(element).left;\n        },\n        get overflowRight() {\n            return getRect(element).right - getRect(container).right;\n        },\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZGV0ZWN0LWVsZW1lbnQtb3ZlcmZsb3cvZGlzdC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvbmlraXRhL0Rlc2t0b3AvZm9jdXNwaGVyZS9ub2RlX21vZHVsZXMvZGV0ZWN0LWVsZW1lbnQtb3ZlcmZsb3cvZGlzdC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBnZXRSZWN0KGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRldGVjdEVsZW1lbnRPdmVyZmxvdyhlbGVtZW50LCBjb250YWluZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXQgY29sbGlkZWRUb3AoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVjdChlbGVtZW50KS50b3AgPCBnZXRSZWN0KGNvbnRhaW5lcikudG9wO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgY29sbGlkZWRCb3R0b20oKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVjdChlbGVtZW50KS5ib3R0b20gPiBnZXRSZWN0KGNvbnRhaW5lcikuYm90dG9tO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgY29sbGlkZWRMZWZ0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJlY3QoZWxlbWVudCkubGVmdCA8IGdldFJlY3QoY29udGFpbmVyKS5sZWZ0O1xuICAgICAgICB9LFxuICAgICAgICBnZXQgY29sbGlkZWRSaWdodCgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSZWN0KGVsZW1lbnQpLnJpZ2h0ID4gZ2V0UmVjdChjb250YWluZXIpLnJpZ2h0O1xuICAgICAgICB9LFxuICAgICAgICBnZXQgb3ZlcmZsb3dUb3AoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVjdChjb250YWluZXIpLnRvcCAtIGdldFJlY3QoZWxlbWVudCkudG9wO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgb3ZlcmZsb3dCb3R0b20oKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVjdChlbGVtZW50KS5ib3R0b20gLSBnZXRSZWN0KGNvbnRhaW5lcikuYm90dG9tO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgb3ZlcmZsb3dMZWZ0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJlY3QoY29udGFpbmVyKS5sZWZ0IC0gZ2V0UmVjdChlbGVtZW50KS5sZWZ0O1xuICAgICAgICB9LFxuICAgICAgICBnZXQgb3ZlcmZsb3dSaWdodCgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSZWN0KGVsZW1lbnQpLnJpZ2h0IC0gZ2V0UmVjdChjb250YWluZXIpLnJpZ2h0O1xuICAgICAgICB9LFxuICAgIH07XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/detect-element-overflow/dist/index.js\n");

/***/ })

};
;