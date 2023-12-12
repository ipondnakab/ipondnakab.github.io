"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/use-composed-ref";
exports.ids = ["vendor-chunks/use-composed-ref"];
exports.modules = {

/***/ "(ssr)/./node_modules/use-composed-ref/dist/use-composed-ref.esm.js":
/*!********************************************************************!*\
  !*** ./node_modules/use-composed-ref/dist/use-composed-ref.esm.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@14.0.4_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n\nvar updateRef = function updateRef(ref, value) {\n    if (typeof ref === \"function\") {\n        ref(value);\n        return;\n    }\n    ref.current = value;\n};\nvar useComposedRef = function useComposedRef(libRef, userRef) {\n    var prevUserRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();\n    return (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function(instance) {\n        libRef.current = instance;\n        if (prevUserRef.current) {\n            updateRef(prevUserRef.current, null);\n        }\n        prevUserRef.current = userRef;\n        if (!userRef) {\n            return;\n        }\n        updateRef(userRef, instance);\n    }, [\n        userRef\n    ]);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useComposedRef);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdXNlLWNvbXBvc2VkLXJlZi9kaXN0L3VzZS1jb21wb3NlZC1yZWYuZXNtLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE0QztBQUU1QyxJQUFJRSxZQUFZLFNBQVNBLFVBQVVDLEdBQUcsRUFBRUMsS0FBSztJQUMzQyxJQUFJLE9BQU9ELFFBQVEsWUFBWTtRQUM3QkEsSUFBSUM7UUFDSjtJQUNGO0lBQ0FELElBQUlFLE9BQU8sR0FBR0Q7QUFDaEI7QUFFQSxJQUFJRSxpQkFBaUIsU0FBU0EsZUFBZUMsTUFBTSxFQUFFQyxPQUFPO0lBQzFELElBQUlDLGNBQWNULDZDQUFNQTtJQUN4QixPQUFPQyxrREFBV0EsQ0FBQyxTQUFVUyxRQUFRO1FBQ25DSCxPQUFPRixPQUFPLEdBQUdLO1FBRWpCLElBQUlELFlBQVlKLE9BQU8sRUFBRTtZQUN2QkgsVUFBVU8sWUFBWUosT0FBTyxFQUFFO1FBQ2pDO1FBRUFJLFlBQVlKLE9BQU8sR0FBR0c7UUFFdEIsSUFBSSxDQUFDQSxTQUFTO1lBQ1o7UUFDRjtRQUVBTixVQUFVTSxTQUFTRTtJQUNyQixHQUFHO1FBQUNGO0tBQVE7QUFDZDtBQUVBLGlFQUFlRixjQUFjQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaXBvbmRuYWthYi8uL25vZGVfbW9kdWxlcy91c2UtY29tcG9zZWQtcmVmL2Rpc3QvdXNlLWNvbXBvc2VkLXJlZi5lc20uanM/NWUwMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSZWYsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuXG52YXIgdXBkYXRlUmVmID0gZnVuY3Rpb24gdXBkYXRlUmVmKHJlZiwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiByZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZWYodmFsdWUpO1xuICAgIHJldHVybjtcbiAgfVxuICByZWYuY3VycmVudCA9IHZhbHVlO1xufTtcblxudmFyIHVzZUNvbXBvc2VkUmVmID0gZnVuY3Rpb24gdXNlQ29tcG9zZWRSZWYobGliUmVmLCB1c2VyUmVmKSB7XG4gIHZhciBwcmV2VXNlclJlZiA9IHVzZVJlZigpO1xuICByZXR1cm4gdXNlQ2FsbGJhY2soZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgbGliUmVmLmN1cnJlbnQgPSBpbnN0YW5jZTtcblxuICAgIGlmIChwcmV2VXNlclJlZi5jdXJyZW50KSB7XG4gICAgICB1cGRhdGVSZWYocHJldlVzZXJSZWYuY3VycmVudCwgbnVsbCk7XG4gICAgfVxuXG4gICAgcHJldlVzZXJSZWYuY3VycmVudCA9IHVzZXJSZWY7XG5cbiAgICBpZiAoIXVzZXJSZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB1cGRhdGVSZWYodXNlclJlZiwgaW5zdGFuY2UpO1xuICB9LCBbdXNlclJlZl0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlQ29tcG9zZWRSZWY7XG4iXSwibmFtZXMiOlsidXNlUmVmIiwidXNlQ2FsbGJhY2siLCJ1cGRhdGVSZWYiLCJyZWYiLCJ2YWx1ZSIsImN1cnJlbnQiLCJ1c2VDb21wb3NlZFJlZiIsImxpYlJlZiIsInVzZXJSZWYiLCJwcmV2VXNlclJlZiIsImluc3RhbmNlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/use-composed-ref/dist/use-composed-ref.esm.js\n");

/***/ })

};
;