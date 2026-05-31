const React = __vite__cjsImport0_react;const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=4fcbbebd";
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=4fcbbebd";
import App from "/src/App.jsx";
var _jsxFileName = "E:/cn5/SWP391/project/Web-Salon-System/frontend/src/main.jsx";
import __vite__cjsImport3_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=4fcbbebd";
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			info: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, info) {
		console.error("ErrorBoundary caught an error", error, info);
		this.setState({ info });
	}
	render() {
		if (this.state.hasError) {
			return /* @__PURE__ */ _jsxDEV("div", {
				style: {
					padding: 20,
					color: "red",
					background: "#fee"
				},
				children: [
					/* @__PURE__ */ _jsxDEV("h1", { children: "Something went wrong." }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 21,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("pre", { children: this.state.error?.toString() }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 22,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("pre", { children: this.state.info?.componentStack }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 23,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 20,
				columnNumber: 9
			}, this);
		}
		return this.props.children;
	}
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ _jsxDEV(ErrorBoundary, { children: /* @__PURE__ */ _jsxDEV(App, {}, void 0, false, {
	fileName: _jsxFileName,
	lineNumber: 33,
	columnNumber: 5
}, this) }, void 0, false, {
	fileName: _jsxFileName,
	lineNumber: 32,
	columnNumber: 3
}, this));

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8sU0FBUzs7O0FBRWhCLE1BQU0sc0JBQXNCLE1BQU0sVUFBVTtDQUMxQyxZQUFZLE9BQU87RUFDakIsTUFBTSxLQUFLO0VBQ1gsS0FBSyxRQUFRO0dBQUUsVUFBVTtHQUFPLE9BQU87R0FBTSxNQUFNO0VBQUs7Q0FDMUQ7Q0FDQSxPQUFPLHlCQUF5QixPQUFPO0VBQ3JDLE9BQU87R0FBRSxVQUFVO0dBQU07RUFBTTtDQUNqQztDQUNBLGtCQUFrQixPQUFPLE1BQU07RUFDN0IsUUFBUSxNQUFNLGlDQUFpQyxPQUFPLElBQUk7RUFDMUQsS0FBSyxTQUFTLEVBQUUsS0FBSyxDQUFDO0NBQ3hCO0NBQ0EsU0FBUztFQUNQLElBQUksS0FBSyxNQUFNLFVBQVU7R0FDdkIsT0FDRSx3QkFBQyxPQUFEO0lBQUssT0FBTztLQUFFLFNBQVM7S0FBSSxPQUFPO0tBQU8sWUFBWTtJQUFPO2NBQTVEO0tBQ0Usd0JBQUMsTUFBRCxZQUFJLHdCQUF5Qjs7Ozs7S0FDN0Isd0JBQUMsT0FBRCxZQUFNLEtBQUssTUFBTSxPQUFPLFNBQVMsRUFBTzs7Ozs7S0FDeEMsd0JBQUMsT0FBRCxZQUFNLEtBQUssTUFBTSxNQUFNLGVBQW9COzs7OztJQUN4Qzs7Ozs7O0VBRVQ7RUFDQSxPQUFPLEtBQUssTUFBTTtDQUNwQjtBQUNGO0FBRUEsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUUsT0FDMUMsd0JBQUMsZUFBRCxZQUNFLHdCQUFDLEtBQUQsQ0FBTTs7OztTQUNPOzs7O1FBQ2pCIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIm1haW4uanN4Il0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tIFwicmVhY3QtZG9tL2NsaWVudFwiO1xuaW1wb3J0IEFwcCBmcm9tIFwiLi9BcHBcIjtcblxuY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7IGhhc0Vycm9yOiBmYWxzZSwgZXJyb3I6IG51bGwsIGluZm86IG51bGwgfTtcbiAgfVxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgaGFzRXJyb3I6IHRydWUsIGVycm9yIH07XG4gIH1cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3JCb3VuZGFyeSBjYXVnaHQgYW4gZXJyb3JcIiwgZXJyb3IsIGluZm8pO1x