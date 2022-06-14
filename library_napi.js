function emnapi_get_module_object(env, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.ensureHandleId(Module);
            return envObject.getReturnStatus();
        });
    });
}
function emnapi_get_module_property(env, utf8name, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [utf8name, result], function () {
            HEAP32[result >> 2] = envObject.ensureHandleId(Module[UTF8ToString(utf8name)]);
            return envObject.getReturnStatus();
        });
    });
}
function emnapi_create_external_uint8array(env, external_data, byte_length, finalize_cb, finalize_hint, result) {
    return emnapi.preamble(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [result], function () {
            byte_length = byte_length >>> 0;
            if (external_data === 0) {
                byte_length = 0;
            }
            if (byte_length > 2147483647) {
                throw new RangeError('Cannot create a Uint8Array larger than 2147483647 bytes');
            }
            if ((external_data + byte_length) > HEAPU8.buffer.byteLength) {
                throw new RangeError('Memory out of range');
            }
            var u8arr = new Uint8Array(HEAPU8.buffer, external_data, byte_length);
            var handle = envObject.getCurrentScope().add(u8arr);
            if (finalize_cb !== 0) {
                var status_1 = emnapiWrap(1 /* anonymous */, env, handle.id, external_data, finalize_cb, finalize_hint, 0);
                if (status_1 === 10 /* napi_pending_exception */) {
                    throw envObject.tryCatch.extractException();
                }
                else if (status_1 !== 0 /* napi_ok */) {
                    return envObject.setLastError(status_1);
                }
            }
            HEAP32[result >> 2] = handle.id;
            return envObject.getReturnStatus();
        });
    });
}
emnapiImplement('emnapi_get_module_object', emnapi_get_module_object);
emnapiImplement('emnapi_get_module_property', emnapi_get_module_property);
emnapiImplement('emnapi_create_external_uint8array', emnapi_create_external_uint8array, ['$emnapiWrap']);
function napi_set_instance_data(env, data, finalize_cb, finalize_hint) {
    return emnapi.checkEnv(env, function (envObject) {
        if (envObject.instanceData) {
            if (envObject.instanceData.finalize_cb) {
                envObject.call_viii(envObject.instanceData.finalize_cb, env, envObject.instanceData.data, envObject.instanceData.finalize_hint);
            }
        }
        envObject.instanceData = {
            data: data,
            finalize_cb: finalize_cb,
            finalize_hint: finalize_hint
        };
        return envObject.clearLastError();
    });
}
function napi_get_instance_data(env, data) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [data], function () {
            HEAP32[data >> 2] = envObject.instanceData ? envObject.instanceData.data : 0;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_set_instance_data', napi_set_instance_data);
emnapiImplement('napi_get_instance_data', napi_get_instance_data);
function napi_get_last_error_info(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var error_code = envObject.lastError.getErrorCode();
            envObject.lastError.setErrorMessage(HEAP32[(errorMessagesPtr >> 2) + error_code]);
            if (error_code === 0 /* napi_ok */) {
                envObject.clearLastError();
            }
            HEAP32[result >> 2] = envObject.lastError.data;
            return 0 /* napi_ok */;
        });
    });
}
function napi_throw(env, error) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [error], function () {
            envObject.tryCatch.setError(envObject.handleStore.get(error).value);
            return envObject.clearLastError();
        });
    });
}
function napi_throw_error(env, code, msg) {
    return emnapi.preamble(env, function (envObject) {
        if (msg === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var error = new Error(UTF8ToString(msg));
        if (code !== 0) {
            error.code = UTF8ToString(code);
        }
        envObject.tryCatch.setError(error);
        return envObject.clearLastError();
    });
}
function napi_throw_type_error(env, code, msg) {
    return emnapi.preamble(env, function (envObject) {
        if (msg === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var error = new TypeError(UTF8ToString(msg));
        if (code !== 0) {
            error.code = UTF8ToString(code);
        }
        envObject.tryCatch.setError(error);
        return envObject.clearLastError();
    });
}
function napi_throw_range_error(env, code, msg) {
    return emnapi.preamble(env, function (envObject) {
        if (msg === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var error = new RangeError(UTF8ToString(msg));
        if (code !== 0) {
            error.code = UTF8ToString(code);
        }
        envObject.tryCatch.setError(error);
        return envObject.clearLastError();
    });
}
function node_api_throw_syntax_error(env, code, msg) {
    return emnapi.preamble(env, function (envObject) {
        if (msg === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var error = new SyntaxError(UTF8ToString(msg));
        if (code !== 0) {
            error.code = UTF8ToString(code);
        }
        envObject.tryCatch.setError(error);
        return envObject.clearLastError();
    });
}
function napi_is_exception_pending(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var r = envObject.tryCatch.hasCaught();
            HEAPU8[result] = r ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_create_error(env, code, msg, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [msg, result], function () {
            var msgValue = envObject.handleStore.get(msg).value;
            if (typeof msgValue !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            var error = new Error(msgValue);
            var status = emnapiSetErrorCode(envObject, error, code, 0);
            if (status !== 0 /* napi_ok */)
                return status;
            HEAP32[result >> 2] = envObject.getCurrentScope().add(error).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_type_error(env, code, msg, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [msg, result], function () {
            var msgValue = envObject.handleStore.get(msg).value;
            if (typeof msgValue !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            var error = new TypeError(msgValue);
            var status = emnapiSetErrorCode(envObject, error, code, 0);
            if (status !== 0 /* napi_ok */)
                return status;
            HEAP32[result >> 2] = envObject.getCurrentScope().add(error).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_range_error(env, code, msg, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [msg, result], function () {
            var msgValue = envObject.handleStore.get(msg).value;
            if (typeof msgValue !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            var error = new RangeError(msgValue);
            var status = emnapiSetErrorCode(envObject, error, code, 0);
            if (status !== 0 /* napi_ok */)
                return status;
            HEAP32[result >> 2] = envObject.getCurrentScope().add(error).id;
            return envObject.clearLastError();
        });
    });
}
function node_api_create_syntax_error(env, code, msg, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [msg, result], function () {
            var msgValue = envObject.handleStore.get(msg).value;
            if (typeof msgValue !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            var error = new SyntaxError(msgValue);
            var status = emnapiSetErrorCode(envObject, error, code, 0);
            if (status !== 0 /* napi_ok */)
                return status;
            HEAP32[result >> 2] = envObject.getCurrentScope().add(error).id;
            return envObject.clearLastError();
        });
    });
}
function napi_get_and_clear_last_exception(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            if (!envObject.tryCatch.hasCaught()) {
                HEAP32[result >> 2] = emnapi.HandleStore.ID_UNDEFINED;
                return envObject.clearLastError();
            }
            else {
                var err = envObject.tryCatch.exception();
                HEAP32[result >> 2] = envObject.ensureHandleId(err);
                envObject.tryCatch.reset();
            }
            return envObject.clearLastError();
        });
    });
}
function napi_fatal_error(location, location_len, message, message_len) {
    abort('FATAL ERROR: ' + (location_len === -1 ? UTF8ToString(location) : UTF8ToString(location, location_len)) + ' ' + (message_len === -1 ? UTF8ToString(message) : UTF8ToString(message, message_len)));
}
emnapiImplement('napi_get_last_error_info', napi_get_last_error_info, ['$errorMessagesPtr']);
emnapiImplement('napi_get_and_clear_last_exception', napi_get_and_clear_last_exception);
emnapiImplement('napi_throw', napi_throw);
emnapiImplement('napi_throw_error', napi_throw_error);
emnapiImplement('napi_throw_type_error', napi_throw_type_error);
emnapiImplement('napi_throw_range_error', napi_throw_range_error);
emnapiImplement('node_api_throw_syntax_error', node_api_throw_syntax_error);
emnapiImplement('napi_create_error', napi_create_error, ['$emnapiSetErrorCode']);
emnapiImplement('napi_create_type_error', napi_create_type_error, ['$emnapiSetErrorCode']);
emnapiImplement('napi_create_range_error', napi_create_range_error, ['$emnapiSetErrorCode']);
emnapiImplement('node_api_create_syntax_error', node_api_create_syntax_error, ['$emnapiSetErrorCode']);
emnapiImplement('napi_is_exception_pending', napi_is_exception_pending);
emnapiImplement('napi_fatal_error', napi_fatal_error);
function napi_create_function(env, utf8name, length, cb, data, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, cb], function () {
            var fresult = emnapiCreateFunction(envObject, utf8name, length, cb, data);
            if (fresult.status !== 0 /* napi_ok */)
                return envObject.setLastError(fresult.status);
            var f = fresult.f;
            var valueHandle = envObject.getCurrentScope().add(f);
            HEAP32[result >> 2] = valueHandle.id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_cb_info(env, cbinfo, argc, argv, this_arg, data) {
    if (env === 0)
        return 1 /* napi_invalid_arg */;
    var envObject = emnapi.envStore.get(env);
    if (cbinfo === 0)
        return envObject.setLastError(1 /* napi_invalid_arg */);
    var cbinfoValue = envObject.cbInfoStore.get(cbinfo);
    if (argv !== 0) {
        if (argc === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var argcValue = HEAPU32[argc >> 2];
        var arrlen = argcValue < cbinfoValue._length ? argcValue : cbinfoValue._length;
        var i = 0;
        var argvI32Index = argv >> 2;
        for (; i < arrlen; i++) {
            HEAP32[argvI32Index + i] = envObject.ensureHandleId(cbinfoValue._args[i]);
        }
        if (i < argcValue) {
            for (; i < argcValue; i++) {
                HEAP32[argvI32Index + i] = 1; // emnapi.HandleStore.ID_UNDEFINED
            }
        }
    }
    if (argc !== 0) {
        HEAPU32[argc >> 2] = cbinfoValue._length;
    }
    if (this_arg !== 0) {
        HEAP32[this_arg >> 2] = envObject.ensureHandleId(cbinfoValue._this);
    }
    if (data !== 0) {
        HEAP32[data >> 2] = cbinfoValue._data;
    }
    return envObject.clearLastError();
}
function napi_call_function(env, recv, func, argc, argv, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [recv], function () {
            argc = argc >>> 0;
            if (argc > 0) {
                if (argv === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var v8recv = envObject.handleStore.get(recv).value;
            if (func === 0)
                return envObject.setLastError(1 /* napi_invalid_arg */);
            var v8func = envObject.handleStore.get(func).value;
            if (typeof v8func !== 'function')
                return envObject.setLastError(1 /* napi_invalid_arg */);
            var args = [];
            for (var i = 0; i < argc; i++) {
                var argPtr = argv + (i * 4);
                args.push(envObject.handleStore.get(HEAP32[argPtr >> 2]).value);
            }
            var ret = v8func.apply(v8recv, args);
            if (result !== 0) {
                HEAP32[result >> 2] = envObject.ensureHandleId(ret);
            }
            return envObject.clearLastError();
        });
    });
}
function napi_new_instance(env, constructor, argc, argv, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [constructor], function () {
            argc = argc >>> 0;
            if (argc > 0) {
                if (argv === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (result === 0)
                return envObject.setLastError(1 /* napi_invalid_arg */);
            var Ctor = envObject.handleStore.get(constructor).value;
            if (typeof Ctor !== 'function')
                return envObject.setLastError(1 /* napi_invalid_arg */);
            var args = Array(argc + 1);
            args[0] = undefined;
            for (var i = 0; i < argc; i++) {
                var argPtr = argv + (i * 4);
                args[i + 1] = envObject.handleStore.get(HEAP32[argPtr >> 2]).value;
            }
            var BoundCtor = Ctor.bind.apply(Ctor, args);
            var ret = new BoundCtor();
            if (result !== 0) {
                HEAP32[result >> 2] = envObject.ensureHandleId(ret);
            }
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_new_target(env, cbinfo, result) {
    if (env === 0)
        return 1 /* napi_invalid_arg */;
    var envObject = emnapi.envStore.get(env);
    if (cbinfo === 0)
        return envObject.setLastError(1 /* napi_invalid_arg */);
    if (result === 0)
        return envObject.setLastError(1 /* napi_invalid_arg */);
    var cbinfoValue = envObject.cbInfoStore.get(cbinfo);
    if (cbinfoValue._newTarget) {
        HEAP32[result >> 2] = envObject.ensureHandleId(cbinfoValue._newTarget);
    }
    else {
        HEAP32[result >> 2] = 0;
    }
    return envObject.clearLastError();
}
emnapiImplement('napi_create_function', napi_create_function, ['$emnapiCreateFunction']);
emnapiImplement('napi_get_cb_info', napi_get_cb_info);
emnapiImplement('napi_call_function', napi_call_function);
emnapiImplement('napi_new_instance', napi_new_instance);
emnapiImplement('napi_get_new_target', napi_get_new_target);
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
mergeInto(LibraryManager.library, {
    $emnapiGetDynamicCalls: function () {
        return {
            call_vi: function (_ptr, a) {
                return {{{ makeDynCall('vi', '_ptr') }}}(a);
            },
            call_ii: function (_ptr, a) {
                return {{{ makeDynCall('ii', '_ptr') }}}(a);
            },
            call_iii: function (_ptr, a, b) {
                return {{{ makeDynCall('iii', '_ptr') }}}(a, b);
            },
            call_viii: function (_ptr, a, b, c) {
                return {{{ makeDynCall('viii', '_ptr') }}}(a, b, c);
            }
        };
    },
    $emnapi: undefined,
    $emnapi__postset: 'var emnapi = (function (exports) {\n\n    /******************************************************************************\n    Copyright (c) Microsoft Corporation.\n\n    Permission to use, copy, modify, and/or distribute this software for any\n    purpose with or without fee is hereby granted.\n\n    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\n    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\n    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\n    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\n    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\n    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\n    PERFORMANCE OF THIS SOFTWARE.\n    ***************************************************************************** */\n    /* global Reflect, Promise */\n\n    var extendStatics = function(d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n\n    function __extends(d, b) {\n        if (typeof b !== "function" && b !== null)\n            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    }\n\n    var Store = (function () {\n        function Store(capacity) {\n            this._values = [undefined];\n            this._values.length = capacity;\n            this._size = 1;\n            this._freeList = [];\n        }\n        Store.prototype.add = function (value) {\n            var id;\n            if (this._freeList.length) {\n                id = this._freeList.shift();\n            }\n            else {\n                id = this._size;\n                this._size++;\n                var capacity = this._values.length;\n                if (id >= capacity) {\n                    this._values.length = Math.ceil(capacity * 1.5);\n                }\n            }\n            value.id = id;\n            this._values[id] = value;\n        };\n        Store.prototype.get = function (id) {\n            return this._values[id];\n        };\n        Store.prototype.has = function (id) {\n            return this._values[id] !== undefined;\n        };\n        Store.prototype.remove = function (id) {\n            var value = this._values[id];\n            if (value) {\n                value.id = 0;\n                this._values[id] = undefined;\n                this._freeList.push(id);\n            }\n        };\n        Store.prototype.dispose = function () {\n            for (var i = 1; i < this._size; ++i) {\n                var value = this._values[i];\n                value === null || value === void 0 ? void 0 : value.dispose();\n            }\n            this._values = [undefined];\n            this._size = 1;\n            this._freeList = [];\n        };\n        return Store;\n    }());\n\n    var _a$1;\n    var supportNewFunction = (function () {\n        var f;\n        try {\n            f = new Function();\n        }\n        catch (_) {\n            return false;\n        }\n        return typeof f === \'function\';\n    })();\n    var _global = (function () {\n        if (typeof globalThis !== \'undefined\')\n            return globalThis;\n        var g = (function () { return this; })();\n        if (!g && supportNewFunction) {\n            g = new Function(\'return this\')();\n        }\n        if (!g) {\n            if (typeof __webpack_public_path__ === \'undefined\') {\n                if (typeof global !== \'undefined\')\n                    return global;\n            }\n            if (typeof window !== \'undefined\')\n                return window;\n            if (typeof self !== \'undefined\')\n                return self;\n        }\n        return g;\n    })();\n    var TryCatch = (function () {\n        function TryCatch() {\n            this._exception = undefined;\n            this._caught = false;\n        }\n        TryCatch.prototype.hasCaught = function () {\n            return this._caught;\n        };\n        TryCatch.prototype.exception = function () {\n            return this._exception;\n        };\n        TryCatch.prototype.setError = function (err) {\n            this._exception = err;\n            this._caught = true;\n        };\n        TryCatch.prototype.reset = function () {\n            this._exception = undefined;\n            this._caught = false;\n        };\n        TryCatch.prototype.extractException = function () {\n            var e = this._exception;\n            this.reset();\n            return e;\n        };\n        return TryCatch;\n    }());\n    var EnvStore = (function (_super) {\n        __extends(EnvStore, _super);\n        function EnvStore() {\n            return _super.call(this, 4) || this;\n        }\n        return EnvStore;\n    }(Store));\n    var envStore = new EnvStore();\n    function checkEnv(env, fn) {\n        if (env === 0)\n            return 1;\n        var envObject = envStore.get(env);\n        if (envObject === undefined)\n            return 1;\n        return fn(envObject);\n    }\n    function checkArgs(envObject, args, fn) {\n        for (var i = 0; i < args.length; i++) {\n            var arg = args[i];\n            if (arg === 0) {\n                return envObject.setLastError(1);\n            }\n        }\n        return fn();\n    }\n    function preamble(env, fn) {\n        return checkEnv(env, function (envObject) {\n            if (envObject.tryCatch.hasCaught())\n                return envObject.setLastError(10);\n            envObject.clearLastError();\n            try {\n                return fn(envObject);\n            }\n            catch (err) {\n                envObject.tryCatch.setError(err);\n                return envObject.setLastError(10);\n            }\n        });\n    }\n    exports.canSetFunctionName = false;\n    try {\n        exports.canSetFunctionName = !!((_a$1 = Object.getOwnPropertyDescriptor(Function.prototype, \'name\')) === null || _a$1 === void 0 ? void 0 : _a$1.configurable);\n    }\n    catch (_) { }\n    var supportFinalizer = (typeof FinalizationRegistry !== \'undefined\') && (typeof WeakRef !== \'undefined\');\n    var supportBigInt = typeof BigInt !== \'undefined\';\n    function isReferenceType(v) {\n        return (typeof v === \'object\' && v !== null) || typeof v === \'function\';\n    }\n\n    var _a;\n    var HandleStore = (function (_super) {\n        __extends(HandleStore, _super);\n        function HandleStore(envObject) {\n            var _this = _super.call(this, 16) || this;\n            _this._objWeakMap = new WeakMap();\n            _super.prototype.add.call(_this, new Handle(envObject, 1, undefined));\n            _super.prototype.add.call(_this, new Handle(envObject, 2, null));\n            _super.prototype.add.call(_this, new Handle(envObject, 3, false));\n            _super.prototype.add.call(_this, new Handle(envObject, 4, true));\n            _super.prototype.add.call(_this, new Handle(envObject, 5, _global));\n            return _this;\n        }\n        Object.defineProperty(HandleStore, "getMinId", {\n            get: function () {\n                return 6;\n            },\n            enumerable: false,\n            configurable: true\n        });\n        HandleStore.prototype.add = function (h) {\n            _super.prototype.add.call(this, h);\n            var isRefType = isReferenceType(h.value);\n            if (isRefType) {\n                if (this._objWeakMap.has(h.value)) {\n                    var old = this._objWeakMap.get(h.value);\n                    old.moveTo(h);\n                }\n                this._objWeakMap.set(h.value, h);\n            }\n        };\n        HandleStore.prototype.remove = function (id) {\n            if (!this.has(id) || id < HandleStore.getMinId)\n                return;\n            _super.prototype.remove.call(this, id);\n        };\n        HandleStore.prototype.getObjectHandle = function (value) {\n            return this._objWeakMap.get(value);\n        };\n        HandleStore.prototype.dispose = function () {\n            this._objWeakMap = null;\n            _super.prototype.dispose.call(this);\n        };\n        HandleStore.ID_UNDEFINED = 1;\n        HandleStore.ID_NULL = 2;\n        HandleStore.ID_FALSE = 3;\n        HandleStore.ID_TRUE = 4;\n        HandleStore.ID_GLOBAL = 5;\n        HandleStore.globalConstants = (_a = {},\n            _a[HandleStore.ID_UNDEFINED] = undefined,\n            _a[HandleStore.ID_NULL] = null,\n            _a[HandleStore.ID_FALSE] = false,\n            _a[HandleStore.ID_TRUE] = true,\n            _a[HandleStore.ID_GLOBAL] = _global,\n            _a);\n        return HandleStore;\n    }(Store));\n    var Handle = (function () {\n        function Handle(envObject, id, value) {\n            this.wrapped = 0;\n            this._envObject = envObject;\n            this.id = id;\n            this.value = value;\n            this.inScope = null;\n            this.wrapped = 0;\n            this.tag = null;\n            this.refs = [];\n        }\n        Handle.create = function (envObject, value) {\n            var handle = new Handle(envObject, 0, value);\n            envObject.handleStore.add(handle);\n            return handle;\n        };\n        Object.defineProperty(Handle.prototype, "env", {\n            get: function () {\n                var _a, _b;\n                return (_b = (_a = this._envObject) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 0;\n            },\n            enumerable: false,\n            configurable: true\n        });\n        Handle.prototype.moveTo = function (other) {\n            this._envObject = undefined;\n            this.id = 0;\n            this.value = undefined;\n            this.inScope = null;\n            other.wrapped = this.wrapped;\n            this.wrapped = 0;\n            other.tag = this.tag;\n            this.tag = null;\n            other.refs = this.refs;\n            this.refs = [];\n        };\n        Handle.prototype.isEmpty = function () {\n            return this.id === 0;\n        };\n        Handle.prototype.isNumber = function () {\n            return !this.isEmpty() && typeof this.value === \'number\';\n        };\n        Handle.prototype.isBigInt = function () {\n            return !this.isEmpty() && typeof this.value === \'bigint\';\n        };\n        Handle.prototype.isString = function () {\n            return !this.isEmpty() && typeof this.value === \'string\';\n        };\n        Handle.prototype.isFunction = function () {\n            return !this.isEmpty() && typeof this.value === \'function\';\n        };\n        Handle.prototype.isExternal = function () {\n            return !this.isEmpty() && (this instanceof ExternalHandle);\n        };\n        Handle.prototype.isObject = function () {\n            return !this.isEmpty() && typeof this.value === \'object\' && this.value !== null;\n        };\n        Handle.prototype.isArray = function () {\n            return !this.isEmpty() && Array.isArray(this.value);\n        };\n        Handle.prototype.isArrayBuffer = function () {\n            return !this.isEmpty() && (this.value instanceof ArrayBuffer);\n        };\n        Handle.prototype.isTypedArray = function () {\n            return !this.isEmpty() && (ArrayBuffer.isView(this.value)) && !(this.value instanceof DataView);\n        };\n        Handle.prototype.isDataView = function () {\n            return !this.isEmpty() && (this.value instanceof DataView);\n        };\n        Handle.prototype.isDate = function () {\n            return !this.isEmpty() && (this.value instanceof Date);\n        };\n        Handle.prototype.isPromise = function () {\n            return !this.isEmpty() && (this.value instanceof Promise);\n        };\n        Handle.prototype.isBoolean = function () {\n            return !this.isEmpty() && typeof this.value === \'boolean\';\n        };\n        Handle.prototype.isUndefined = function () {\n            return !this.isEmpty() && this.value === undefined;\n        };\n        Handle.prototype.isSymbol = function () {\n            return !this.isEmpty() && typeof this.value === \'symbol\';\n        };\n        Handle.prototype.isNull = function () {\n            return !this.isEmpty() && this.value === null;\n        };\n        Handle.prototype.addRef = function (ref) {\n            if (this.refs.indexOf(ref) !== -1) {\n                return;\n            }\n            this.refs.push(ref);\n        };\n        Handle.prototype.removeRef = function (ref) {\n            var index = this.refs.indexOf(ref);\n            if (index !== -1) {\n                this.refs.splice(index, 1);\n            }\n            this.tryDispose();\n        };\n        Handle.prototype.tryDispose = function () {\n            if (this.id < HandleStore.getMinId ||\n                this.inScope !== null || this.refs.some(function (ref) { return ref.refcount > 0; }))\n                return;\n            this.dispose();\n        };\n        Handle.prototype.dispose = function () {\n            if (this.id === 0)\n                return;\n            if (this.refs.length > 0) {\n                var refs = this.refs;\n                for (var i = 0; i < refs.length; i++) {\n                    refs[i].queueFinalizer(this.value);\n                }\n            }\n            var id = this.id;\n            this._envObject.handleStore.remove(id);\n            this.refs = [];\n            this.id = 0;\n            this.value = undefined;\n        };\n        return Handle;\n    }());\n    function External() {\n        Object.setPrototypeOf(this, null);\n    }\n    External.prototype = null;\n    var ExternalHandle = (function (_super) {\n        __extends(ExternalHandle, _super);\n        function ExternalHandle(envObject, data) {\n            if (data === void 0) { data = 0; }\n            var _this = _super.call(this, envObject, 0, new External()) || this;\n            _this._data = data;\n            return _this;\n        }\n        ExternalHandle.createExternal = function (envObject, data) {\n            if (data === void 0) { data = 0; }\n            var h = new ExternalHandle(envObject, data);\n            envObject.handleStore.add(h);\n            return h;\n        };\n        ExternalHandle.prototype.data = function () {\n            return this._data;\n        };\n        return ExternalHandle;\n    }(Handle));\n\n    var HandleScope = (function () {\n        function HandleScope(envObject, parentScope) {\n            this._disposed = false;\n            this._envObject = envObject;\n            this.id = 0;\n            this.parent = parentScope;\n            this.child = null;\n            this.handles = [];\n        }\n        Object.defineProperty(HandleScope.prototype, "env", {\n            get: function () {\n                return this._envObject.id;\n            },\n            enumerable: false,\n            configurable: true\n        });\n        HandleScope._create = function (envObject, parentScope) {\n            var scope = new this(envObject, parentScope);\n            if (parentScope) {\n                parentScope.child = scope;\n            }\n            envObject.scopeStore.add(scope);\n            return scope;\n        };\n        HandleScope.create = function (envObject, parentScope) {\n            return HandleScope._create(envObject, parentScope);\n        };\n        HandleScope.prototype.add = function (value) {\n            if (value instanceof Handle) {\n                throw new TypeError(\'Can not add a handle to scope\');\n            }\n            if (value === undefined) {\n                return this._envObject.handleStore.get(HandleStore.ID_UNDEFINED);\n            }\n            if (value === null) {\n                return this._envObject.handleStore.get(HandleStore.ID_NULL);\n            }\n            if (typeof value === \'boolean\') {\n                return this._envObject.handleStore.get(value ? HandleStore.ID_TRUE : HandleStore.ID_FALSE);\n            }\n            if (value === _global) {\n                return this._envObject.handleStore.get(HandleStore.ID_GLOBAL);\n            }\n            var h = Handle.create(this._envObject, value);\n            this.handles.push(h);\n            h.inScope = this;\n            return h;\n        };\n        HandleScope.prototype.addHandle = function (handle) {\n            if (this.handles.indexOf(handle) !== -1) {\n                return handle;\n            }\n            this.handles.push(handle);\n            handle.inScope = this;\n            return handle;\n        };\n        HandleScope.prototype.clearHandles = function () {\n            if (this.handles.length > 0) {\n                var handles = this.handles;\n                for (var i = 0; i < handles.length; i++) {\n                    var handle = handles[i];\n                    handle.inScope = null;\n                    handle.tryDispose();\n                }\n                this.handles = [];\n            }\n        };\n        HandleScope.prototype.dispose = function () {\n            if (this._disposed)\n                return;\n            this._disposed = true;\n            this.clearHandles();\n            this.parent = null;\n            this.child = null;\n            this._envObject.scopeStore.remove(this.id);\n            this._envObject = undefined;\n        };\n        return HandleScope;\n    }());\n    var EscapableHandleScope = (function (_super) {\n        __extends(EscapableHandleScope, _super);\n        function EscapableHandleScope(envObject, parentScope) {\n            var _this = _super.call(this, envObject, parentScope) || this;\n            _this._escapeCalled = false;\n            return _this;\n        }\n        EscapableHandleScope.create = function (envObject, parentScope) {\n            return EscapableHandleScope._create(envObject, parentScope);\n        };\n        EscapableHandleScope.prototype.escape = function (handle) {\n            if (this._escapeCalled)\n                return null;\n            this._escapeCalled = true;\n            var exists = false;\n            var index = -1;\n            var handleId;\n            if (typeof handle === \'number\') {\n                handleId = handle;\n                for (var i = 0; i < this.handles.length; i++) {\n                    if (this.handles[i].id === handleId) {\n                        index = i;\n                        exists = true;\n                        break;\n                    }\n                }\n            }\n            else {\n                handleId = handle.id;\n                index = this.handles.indexOf(handle);\n                exists = index !== -1;\n            }\n            if (exists) {\n                var h = this._envObject.handleStore.get(handleId);\n                if (h && this.parent !== null) {\n                    this.handles.splice(index, 1);\n                    this._envObject.handleStore.remove(handleId);\n                    var newHandle = this.parent.add(h.value);\n                    return newHandle;\n                }\n                else {\n                    return null;\n                }\n            }\n            else {\n                return null;\n            }\n        };\n        EscapableHandleScope.prototype.escapeCalled = function () {\n            return this._escapeCalled;\n        };\n        return EscapableHandleScope;\n    }(HandleScope));\n    var ScopeStore = (function (_super) {\n        __extends(ScopeStore, _super);\n        function ScopeStore() {\n            return _super.call(this, 8) || this;\n        }\n        return ScopeStore;\n    }(Store));\n\n    var CallbackInfo = (function () {\n        function CallbackInfo(envObject, _this, _data, _length, _args, _newTarget) {\n            this.envObject = envObject;\n            this._this = _this;\n            this._data = _data;\n            this._length = _length;\n            this._args = _args;\n            this._newTarget = _newTarget;\n            this.id = 0;\n            this._isConstructCall = Boolean(_newTarget);\n        }\n        CallbackInfo.create = function (envObject, _this, _data, _length, _args, _newTarget) {\n            var cbInfo = new CallbackInfo(envObject, _this, _data, _length, _args, _newTarget);\n            envObject.cbInfoStore.add(cbInfo);\n            return cbInfo;\n        };\n        CallbackInfo.prototype.dispose = function () {\n            this.envObject.cbInfoStore.remove(this.id);\n            this.id = 0;\n            this._this = undefined;\n            this._data = 0;\n            this._length = 0;\n            this._args = undefined;\n            this._newTarget = undefined;\n            this._isConstructCall = false;\n        };\n        return CallbackInfo;\n    }());\n    var CallbackInfoStore = (function (_super) {\n        __extends(CallbackInfoStore, _super);\n        function CallbackInfoStore() {\n            return _super.call(this, 16) || this;\n        }\n        return CallbackInfoStore;\n    }(Store));\n\n    var Deferred = (function () {\n        function Deferred(envObject, value) {\n            this.id = 0;\n            this.envObject = envObject;\n            this.value = value;\n        }\n        Deferred.create = function (envObject, value) {\n            var deferred = new Deferred(envObject, value);\n            envObject.deferredStore.add(deferred);\n            return deferred;\n        };\n        Deferred.prototype.resolve = function (value) {\n            this.value.resolve(value);\n            this.dispose();\n        };\n        Deferred.prototype.reject = function (reason) {\n            this.value.reject(reason);\n            this.dispose();\n        };\n        Deferred.prototype.dispose = function () {\n            this.envObject.deferredStore.remove(this.id);\n            this.id = 0;\n            this.value = null;\n        };\n        return Deferred;\n    }());\n    var DeferredStore = (function (_super) {\n        __extends(DeferredStore, _super);\n        function DeferredStore() {\n            return _super.call(this, 8) || this;\n        }\n        return DeferredStore;\n    }(Store));\n\n    var Reference = (function () {\n        function Reference(envObject, handle_id, initialRefcount, deleteSelf, finalize_callback, finalize_data, finalize_hint) {\n            if (finalize_callback === void 0) { finalize_callback = 0; }\n            if (finalize_data === void 0) { finalize_data = 0; }\n            if (finalize_hint === void 0) { finalize_hint = 0; }\n            this.envObject = envObject;\n            this.handle_id = handle_id;\n            this.deleteSelf = deleteSelf;\n            this.finalize_callback = finalize_callback;\n            this.finalize_data = finalize_data;\n            this.finalize_hint = finalize_hint;\n            this.finalizeRan = false;\n            this.finalizerRegistered = false;\n            this.id = 0;\n            this.refcount = initialRefcount >>> 0;\n        }\n        Reference.create = function (envObject, handle_id, initialRefcount, deleteSelf, finalize_callback, finalize_data, finalize_hint) {\n            if (finalize_callback === void 0) { finalize_callback = 0; }\n            if (finalize_data === void 0) { finalize_data = 0; }\n            if (finalize_hint === void 0) { finalize_hint = 0; }\n            var ref = new Reference(envObject, handle_id, initialRefcount, deleteSelf, finalize_callback, finalize_data, finalize_hint);\n            envObject.refStore.add(ref);\n            var handle = envObject.handleStore.get(handle_id);\n            handle.addRef(ref);\n            if (supportFinalizer && isReferenceType(handle.value)) {\n                ref.objWeakRef = new WeakRef(handle.value);\n            }\n            else {\n                ref.objWeakRef = null;\n            }\n            return ref;\n        };\n        Reference.prototype.ref = function () {\n            return ++this.refcount;\n        };\n        Reference.prototype.unref = function () {\n            if (this.refcount === 0) {\n                return 0;\n            }\n            this.refcount--;\n            if (this.refcount === 0) {\n                var handle = this.envObject.handleStore.get(this.handle_id);\n                if (handle) {\n                    handle.tryDispose();\n                }\n            }\n            return this.refcount;\n        };\n        Reference.prototype.data = function () {\n            return this.finalize_data;\n        };\n        Reference.prototype.get = function () {\n            if (this.envObject.handleStore.has(this.handle_id)) {\n                return this.handle_id;\n            }\n            else {\n                if (this.objWeakRef) {\n                    var obj = this.objWeakRef.deref();\n                    if (obj) {\n                        this.handle_id = this.envObject.ensureHandleId(obj);\n                        return this.handle_id;\n                    }\n                }\n                return 0;\n            }\n        };\n        Reference.doDelete = function (ref) {\n            var _a, _b;\n            if ((ref.refcount !== 0) || (ref.deleteSelf) || (ref.finalizeRan)) {\n                ref.envObject.refStore.remove(ref.id);\n                (_a = ref.envObject.handleStore.get(ref.handle_id)) === null || _a === void 0 ? void 0 : _a.removeRef(ref);\n                (_b = Reference.finalizationGroup) === null || _b === void 0 ? void 0 : _b.unregister(this);\n            }\n            else {\n                ref.deleteSelf = true;\n            }\n        };\n        Reference.prototype.queueFinalizer = function (value) {\n            if (!Reference.finalizationGroup)\n                return;\n            if (this.finalizerRegistered)\n                return;\n            if (!value) {\n                value = this.envObject.handleStore.get(this.handle_id).value;\n            }\n            Reference.finalizationGroup.register(value, this, this);\n            this.finalizerRegistered = true;\n        };\n        Reference.prototype.dispose = function () {\n            this.deleteSelf = true;\n            Reference.doDelete(this);\n        };\n        Reference.finalizationGroup = typeof FinalizationRegistry !== \'undefined\'\n            ? new FinalizationRegistry(function (ref) {\n                var error;\n                var caught = false;\n                if (ref.finalize_callback !== 0) {\n                    var scope = ref.envObject.openScope();\n                    try {\n                        ref.envObject.callIntoModule(function (envObject) {\n                            envObject.call_viii(ref.finalize_callback, envObject.id, ref.finalize_data, ref.finalize_hint);\n                            ref.finalize_callback = 0;\n                        });\n                    }\n                    catch (err) {\n                        caught = true;\n                        error = err;\n                    }\n                    ref.envObject.closeScope(scope);\n                }\n                if (ref.deleteSelf) {\n                    Reference.doDelete(ref);\n                }\n                else {\n                    ref.finalizeRan = true;\n                }\n                if (caught) {\n                    throw error;\n                }\n            })\n            : null;\n        return Reference;\n    }());\n    var RefStore = (function (_super) {\n        __extends(RefStore, _super);\n        function RefStore() {\n            return _super.call(this, 8) || this;\n        }\n        return RefStore;\n    }(Store));\n\n    var Env = (function () {\n        function Env(malloc, free, call_iii, call_viii, Module) {\n            var _this = this;\n            this.malloc = malloc;\n            this.free = free;\n            this.call_iii = call_iii;\n            this.call_viii = call_viii;\n            this.Module = Module;\n            this.typedArrayMemoryMap = new WeakMap();\n            this.arrayBufferMemoryMap = new WeakMap();\n            this.memoryPointerDeleter = supportFinalizer\n                ? new FinalizationRegistry(function (heldValue) {\n                    _this.free(heldValue);\n                })\n                : null;\n            this.openHandleScopes = 0;\n            this.instanceData = null;\n            this.currentScope = null;\n            this.tryCatch = new TryCatch();\n            this.id = 0;\n            var napiExtendedErrorInfoPtr = malloc(16);\n            this.lastError = {\n                data: napiExtendedErrorInfoPtr,\n                getErrorCode: function () { return Module.HEAP32[(napiExtendedErrorInfoPtr >> 2) + 3]; },\n                setErrorCode: function (code) {\n                    Module.HEAP32[(napiExtendedErrorInfoPtr >> 2) + 3] = code;\n                },\n                setErrorMessage: function (ptr) {\n                    Module.HEAP32[napiExtendedErrorInfoPtr >> 2] = ptr;\n                }\n            };\n        }\n        Env.create = function (malloc, free, call_iii, call_viii, Module) {\n            var env = new Env(malloc, free, call_iii, call_viii, Module);\n            envStore.add(env);\n            env.refStore = new RefStore();\n            env.handleStore = new HandleStore(env);\n            env.deferredStore = new DeferredStore();\n            env.scopeStore = new ScopeStore();\n            env.cbInfoStore = new CallbackInfoStore();\n            env._rootScope = HandleScope.create(env, null);\n            return env;\n        };\n        Env.prototype.openScope = function (ScopeConstructor) {\n            if (ScopeConstructor === void 0) { ScopeConstructor = HandleScope; }\n            if (this.currentScope) {\n                var scope = ScopeConstructor.create(this, this.currentScope);\n                this.currentScope.child = scope;\n                this.currentScope = scope;\n            }\n            else {\n                this.currentScope = this._rootScope;\n            }\n            this.openHandleScopes++;\n            return this.currentScope;\n        };\n        Env.prototype.closeScope = function (scope) {\n            if (scope === this.currentScope) {\n                this.currentScope = scope.parent;\n            }\n            if (scope.parent) {\n                scope.parent.child = scope.child;\n            }\n            if (scope.child) {\n                scope.child.parent = scope.parent;\n            }\n            if (scope === this._rootScope) {\n                scope.clearHandles();\n                scope.child = null;\n            }\n            else {\n                scope.dispose();\n            }\n            this.openHandleScopes--;\n        };\n        Env.prototype.getCurrentScope = function () {\n            return this.currentScope;\n        };\n        Env.prototype.ensureHandleId = function (value) {\n            if (isReferenceType(value)) {\n                var handle = this.handleStore.getObjectHandle(value);\n                if (!handle) {\n                    return this.currentScope.add(value).id;\n                }\n                if (handle.value === value) {\n                    return handle.id;\n                }\n                handle.value = value;\n                Store.prototype.add.call(this.handleStore, handle);\n                this.currentScope.addHandle(handle);\n                return handle.id;\n            }\n            return this.currentScope.add(value).id;\n        };\n        Env.prototype.clearLastError = function () {\n            this.lastError.setErrorCode(0);\n            this.lastError.setErrorMessage(0);\n            return 0;\n        };\n        Env.prototype.setLastError = function (error_code, _engine_error_code, _engine_reserved) {\n            this.lastError.setErrorCode(error_code);\n            return error_code;\n        };\n        Env.prototype.getReturnStatus = function () {\n            return !this.tryCatch.hasCaught() ? 0 : this.setLastError(10);\n        };\n        Env.prototype.callIntoModule = function (fn) {\n            this.clearLastError();\n            var r = fn(this);\n            if (this.tryCatch.hasCaught()) {\n                var err = this.tryCatch.extractException();\n                throw err;\n            }\n            return r;\n        };\n        Env.prototype.getViewPointer = function (view) {\n            if (!supportFinalizer) {\n                return 0;\n            }\n            if (view.buffer === this.Module.HEAPU8.buffer) {\n                return view.byteOffset;\n            }\n            var pointer;\n            if (this.typedArrayMemoryMap.has(view)) {\n                pointer = this.typedArrayMemoryMap.get(view);\n                this.Module.HEAPU8.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength), pointer);\n                return pointer;\n            }\n            pointer = this.malloc(view.byteLength);\n            this.Module.HEAPU8.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength), pointer);\n            this.typedArrayMemoryMap.set(view, pointer);\n            this.memoryPointerDeleter.register(view, pointer);\n            return pointer;\n        };\n        Env.prototype.getArrayBufferPointer = function (arrayBuffer) {\n            if ((!supportFinalizer) || (arrayBuffer === this.Module.HEAPU8.buffer)) {\n                return 0;\n            }\n            var pointer;\n            if (this.arrayBufferMemoryMap.has(arrayBuffer)) {\n                pointer = this.arrayBufferMemoryMap.get(arrayBuffer);\n                this.Module.HEAPU8.set(new Uint8Array(arrayBuffer), pointer);\n                return pointer;\n            }\n            pointer = this.malloc(arrayBuffer.byteLength);\n            this.Module.HEAPU8.set(new Uint8Array(arrayBuffer), pointer);\n            this.arrayBufferMemoryMap.set(arrayBuffer, pointer);\n            this.memoryPointerDeleter.register(arrayBuffer, pointer);\n            return pointer;\n        };\n        Env.prototype.dispose = function () {\n            this.currentScope = null;\n            this.deferredStore.dispose();\n            this.refStore.dispose();\n            this.scopeStore.dispose();\n            this.handleStore.dispose();\n            this.tryCatch.extractException();\n            try {\n                this.free(this.lastError.data);\n                this.lastError.data = 0;\n            }\n            catch (_) { }\n            this.lastError = null;\n            envStore.remove(this.id);\n        };\n        return Env;\n    }());\n\n    Object.defineProperty(exports, \'version\', {\n        configurable: true,\n        enumerable: true,\n        writable: false,\n        value: "0.14.0"\n    });\n\n    exports.CallbackInfo = CallbackInfo;\n    exports.CallbackInfoStore = CallbackInfoStore;\n    exports.Deferred = Deferred;\n    exports.DeferredStore = DeferredStore;\n    exports.Env = Env;\n    exports.EnvStore = EnvStore;\n    exports.EscapableHandleScope = EscapableHandleScope;\n    exports.ExternalHandle = ExternalHandle;\n    exports.Handle = Handle;\n    exports.HandleScope = HandleScope;\n    exports.HandleStore = HandleStore;\n    exports.RefStore = RefStore;\n    exports.Reference = Reference;\n    exports.ScopeStore = ScopeStore;\n    exports.Store = Store;\n    exports.TryCatch = TryCatch;\n    exports.checkArgs = checkArgs;\n    exports.checkEnv = checkEnv;\n    exports.envStore = envStore;\n    exports.preamble = preamble;\n    exports.supportBigInt = supportBigInt;\n    exports.supportFinalizer = supportFinalizer;\n    exports.supportNewFunction = supportNewFunction;\n\n    Object.defineProperty(exports, \'__esModule\', { value: true });\n\n    return exports;\n\n})({});\n',
    $errorMessagesPtr: undefined,
    $emnapiInit__postset: 'emnapiInit();',
    $emnapiInit__deps: ['$emnapiGetDynamicCalls', '$emnapi', '$errorMessagesPtr', 'napi_register_wasm_v1', 'emnapi_runtime_init'],
    $emnapiInit: function () {
        var registered = false;
        var emnapiExports;
        var exportsKey;
        var env;
        var dynCalls = emnapiGetDynamicCalls();
        var malloc;
        var free;
        function callInStack(f) {
            var stack = stackSave();
            var r;
            try {
                r = f();
            }
            catch (err) {
                stackRestore(stack);
                throw err;
            }
            stackRestore(stack);
            return r;
        }
        function moduleRegister() {
            if (registered)
                return emnapiExports;
            registered = true;
            env = emnapi.Env.create(malloc, free, dynCalls.call_iii, dynCalls.call_viii, Module);
            var scope = env.openScope(emnapi.HandleScope);
            try {
                emnapiExports = env.callIntoModule(function (envObject) {
                    var exports = {};
                    var exportsHandle = scope.add(exports);
                    var napiValue = _napi_register_wasm_v1(envObject.id, exportsHandle.id);
                    return (!napiValue) ? undefined : envObject.handleStore.get(napiValue).value;
                });
            }
            catch (err) {
                env.closeScope(scope);
                registered = false;
                throw err;
            }
            env.closeScope(scope);
            return emnapiExports;
        }
        addOnInit(function (Module) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            
            delete Module._napi_register_wasm_v1;
            delete Module._emnapi_runtime_init;
            callInStack(function () {
                var malloc_pp = stackAlloc(4);
                var free_pp = stackAlloc(4);
                var key_pp = stackAlloc(4);
                var errormessages_pp = stackAlloc(4);
                _emnapi_runtime_init(malloc_pp, free_pp, key_pp, errormessages_pp);
                var malloc_p = HEAP32[malloc_pp >> 2];
                var free_p = HEAP32[free_pp >> 2];
                var key_p = HEAP32[key_pp >> 2];
                malloc = function (size) {
                    return dynCalls.call_ii(malloc_p, size);
                };
                free = function (ptr) {
                    return dynCalls.call_vi(free_p, ptr);
                };
                exportsKey = (key_p ? UTF8ToString(key_p) : 'emnapiExports') || 'emnapiExports';
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errorMessagesPtr = HEAP32[errormessages_pp >> 2] || 0;
            });
            // Module.emnapiModuleRegister = moduleRegister
            var exports;
            try {
                exports = moduleRegister();
            }
            catch (err) {
                if (typeof Module.onEmnapiInitialized === 'function') {
                    Module.onEmnapiInitialized(err || new Error(String(err)));
                    return;
                }
                else {
                    throw err;
                }
            }
            Module[exportsKey] = exports;
            if (typeof Module.onEmnapiInitialized === 'function') {
                Module.onEmnapiInitialized(null, exports);
            }
        });
    }
});
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
function $emnapiCreateFunction(envObject, utf8name, length, cb, data) {
    var functionName = (utf8name === 0 || length === 0) ? '' : (length === -1 ? UTF8ToString(utf8name) : UTF8ToString(utf8name, length));
    var f;
    var makeFunction = function () { return function () {
        'use strict';
        var newTarget = this && this instanceof f ? this.constructor : undefined;
        var cbinfo = emnapi.CallbackInfo.create(envObject, this, data, arguments.length, Array.prototype.slice.call(arguments), newTarget);
        var scope = envObject.openScope(emnapi.HandleScope);
        var r;
        try {
            r = envObject.callIntoModule(function (envObject) {
                var napiValue = envObject.call_iii(cb, envObject.id, cbinfo.id);
                return (!napiValue) ? undefined : envObject.handleStore.get(napiValue).value;
            });
        }
        catch (err) {
            cbinfo.dispose();
            envObject.closeScope(scope);
            throw err;
        }
        cbinfo.dispose();
        envObject.closeScope(scope);
        return r;
    }; };
    if (functionName === '') {
        f = makeFunction();
    }
    else {
        if (!(/^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(functionName))) {
            return { status: 1 /* napi_invalid_arg */, f: undefined };
        }
        if (emnapi.supportNewFunction) {
            f = (new Function('_', 'return function ' + functionName + '(){' +
                '"use strict";' +
                'return _.apply(this,arguments);' +
                '};'))(makeFunction());
        }
        else {
            f = makeFunction();
            if (emnapi.canSetFunctionName) {
                Object.defineProperty(f, 'name', {
                    value: functionName
                });
            }
        }
    }
    return { status: 0 /* napi_ok */, f: f };
}
function $emnapiDefineProperty(envObject, obj, propertyName, method, getter, setter, value, attributes, data) {
    if (getter !== 0 || setter !== 0) {
        var localGetter = void 0;
        var localSetter = void 0;
        if (getter !== 0) {
            localGetter = emnapiCreateFunction(envObject, 0, 0, getter, data).f;
        }
        if (setter !== 0) {
            localSetter = emnapiCreateFunction(envObject, 0, 0, setter, data).f;
        }
        var desc = {
            configurable: (attributes & 4 /* napi_configurable */) !== 0,
            enumerable: (attributes & 2 /* napi_enumerable */) !== 0,
            get: localGetter,
            set: localSetter
        };
        Object.defineProperty(obj, propertyName, desc);
    }
    else if (method !== 0) {
        var localMethod = emnapiCreateFunction(envObject, 0, 0, method, data).f;
        var desc = {
            configurable: (attributes & 4 /* napi_configurable */) !== 0,
            enumerable: (attributes & 2 /* napi_enumerable */) !== 0,
            writable: (attributes & 1 /* napi_writable */) !== 0,
            value: localMethod
        };
        Object.defineProperty(obj, propertyName, desc);
    }
    else {
        var desc = {
            configurable: (attributes & 4 /* napi_configurable */) !== 0,
            enumerable: (attributes & 2 /* napi_enumerable */) !== 0,
            writable: (attributes & 1 /* napi_writable */) !== 0,
            value: envObject.handleStore.get(value).value
        };
        Object.defineProperty(obj, propertyName, desc);
    }
}
function $emnapiCreateTypedArray(envObject, Type, size_of_element, buffer, byte_offset, length, callback) {
    var _a;
    byte_offset = byte_offset >>> 0;
    length = length >>> 0;
    if (size_of_element > 1) {
        if ((byte_offset) % (size_of_element) !== 0) {
            var err = new RangeError("start offset of ".concat((_a = Type.name) !== null && _a !== void 0 ? _a : '', " should be a multiple of ").concat(size_of_element));
            err.code = 'ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT';
            envObject.tryCatch.setError(err);
            return envObject.setLastError(9 /* napi_generic_failure */);
        }
    }
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (((length * size_of_element) + byte_offset) > buffer.byteLength) {
        var err = new RangeError('Invalid typed array length');
        err.code = 'ERR_NAPI_INVALID_TYPEDARRAY_LENGTH';
        envObject.tryCatch.setError(err);
        return envObject.setLastError(9 /* napi_generic_failure */);
    }
    var out = new Type(buffer, byte_offset, length);
    return callback(out);
}
function $emnapiWrap(type, env, js_object, native_object, finalize_cb, finalize_hint, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [js_object], function () {
            var value = envObject.handleStore.get(js_object);
            if (!(value.isObject() || value.isFunction())) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (type === 0 /* retrievable */) {
                if (value.wrapped !== 0) {
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                }
            }
            else if (type === 1 /* anonymous */) {
                if (finalize_cb === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var reference;
            if (result !== 0) {
                if (finalize_cb === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                reference = emnapi.Reference.create(envObject, value.id, 0, false, finalize_cb, native_object, finalize_hint);
                HEAP32[result >> 2] = reference.id;
            }
            else {
                reference = emnapi.Reference.create(envObject, value.id, 0, true, finalize_cb, native_object, finalize_cb === 0 ? 0 : finalize_hint);
            }
            if (type === 0 /* retrievable */) {
                value.wrapped = reference.id;
            }
            return envObject.getReturnStatus();
        });
    });
}
function $emnapiUnwrap(env, js_object, result, action) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [js_object], function () {
            if (action === 0 /* KeepWrap */) {
                if (result === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var value = envObject.handleStore.get(js_object);
            if (!(value.isObject() || value.isFunction())) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var referenceId = value.wrapped;
            var ref = envObject.refStore.get(referenceId);
            if (!ref)
                return envObject.setLastError(1 /* napi_invalid_arg */);
            if (result !== 0) {
                HEAP32[result >> 2] = ref.data();
            }
            if (action === 1 /* RemoveWrap */) {
                value.wrapped = 0;
                emnapi.Reference.doDelete(ref);
            }
            return envObject.getReturnStatus();
        });
    });
}
function $emnapiAddName(ret, name, key_filter, conversion_mode) {
    if (ret.indexOf(name) !== -1)
        return;
    if (conversion_mode === 0 /* napi_key_keep_numbers */) {
        ret.push(name);
    }
    else if (conversion_mode === 1 /* napi_key_numbers_to_strings */) {
        var realName = typeof name === 'number' ? String(name) : name;
        if (typeof realName === 'string') {
            if (!(key_filter & 8 /* napi_key_skip_strings */)) {
                ret.push(realName);
            }
        }
        else {
            ret.push(realName);
        }
    }
}
function $emnapiGetPropertyNames(obj, collection_mode, key_filter, conversion_mode) {
    var props = [];
    var names;
    var symbols;
    var i;
    var own = true;
    var integerIndiceRegex = /^(0|[1-9][0-9]*)$/;
    do {
        names = Object.getOwnPropertyNames(obj);
        symbols = Object.getOwnPropertySymbols(obj);
        for (i = 0; i < names.length; i++) {
            props.push({
                name: integerIndiceRegex.test(names[i]) ? Number(names[i]) : names[i],
                desc: Object.getOwnPropertyDescriptor(obj, names[i]),
                own: own
            });
        }
        for (i = 0; i < symbols.length; i++) {
            props.push({
                name: symbols[i],
                desc: Object.getOwnPropertyDescriptor(obj, symbols[i]),
                own: own
            });
        }
        if (collection_mode === 1 /* napi_key_own_only */) {
            break;
        }
        obj = Object.getPrototypeOf(obj);
        own = false;
    } while (obj);
    var ret = [];
    for (i = 0; i < props.length; i++) {
        var name_1 = props[i].name;
        if (key_filter === 0 /* napi_key_all_properties */) {
            emnapiAddName(ret, name_1, key_filter, conversion_mode);
        }
        else {
            if (key_filter & 8 /* napi_key_skip_strings */) {
                if (typeof name_1 === 'string')
                    continue;
            }
            if (key_filter & 16 /* napi_key_skip_symbols */) {
                if (typeof name_1 === 'symbol')
                    continue;
            }
            if (key_filter & 1 /* napi_key_writable */) {
                if (props[i].desc.writable)
                    emnapiAddName(ret, name_1, key_filter, conversion_mode);
                continue;
            }
            if (key_filter & 2 /* napi_key_enumerable */) {
                if (props[i].desc.enumerable)
                    emnapiAddName(ret, name_1, key_filter, conversion_mode);
                continue;
            }
            if (key_filter & 4 /* napi_key_configurable */) {
                if (props[i].desc.configurable)
                    emnapiAddName(ret, name_1, key_filter, conversion_mode);
                continue;
            }
            emnapiAddName(ret, name_1, key_filter, conversion_mode);
        }
    }
    return ret;
}
function $emnapiSetErrorCode(envObject, error, code, code_string) {
    if (code !== 0 || code_string !== 0) {
        var codeValue = void 0;
        if (code !== 0) {
            codeValue = envObject.handleStore.get(code).value;
            if (typeof codeValue !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
        }
        else {
            codeValue = UTF8ToString(code_string);
        }
        error.code = codeValue;
    }
    return 0 /* napi_ok */;
}
emnapiImplement('$emnapiCreateFunction', $emnapiCreateFunction);
emnapiImplement('$emnapiDefineProperty', $emnapiDefineProperty, ['$emnapiCreateFunction']);
emnapiImplement('$emnapiCreateTypedArray', $emnapiCreateTypedArray);
emnapiImplement('$emnapiWrap', $emnapiWrap);
emnapiImplement('$emnapiUnwrap', $emnapiUnwrap);
emnapiImplement('$emnapiAddName', $emnapiAddName);
emnapiImplement('$emnapiGetPropertyNames', $emnapiGetPropertyNames, ['$emnapiAddName']);
emnapiImplement('$emnapiSetErrorCode', $emnapiSetErrorCode);
function napi_open_handle_scope(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var scope = envObject.openScope(emnapi.HandleScope);
            HEAP32[result >> 2] = scope.id;
            return envObject.clearLastError();
        });
    });
}
function napi_close_handle_scope(env, scope) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [scope], function () {
            var scopeObject = envObject.scopeStore.get(scope);
            if ((envObject.openHandleScopes === 0) || (scopeObject !== envObject.getCurrentScope())) {
                return 13 /* napi_handle_scope_mismatch */;
            }
            envObject.closeScope(envObject.scopeStore.get(scope));
            return envObject.clearLastError();
        });
    });
}
function napi_open_escapable_handle_scope(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var scope = envObject.openScope(emnapi.EscapableHandleScope);
            HEAP32[result >> 2] = scope.id;
            return envObject.clearLastError();
        });
    });
}
function napi_close_escapable_handle_scope(env, scope) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [scope], function () {
            var scopeObject = envObject.scopeStore.get(scope);
            if ((envObject.openHandleScopes === 0) || (scopeObject !== envObject.getCurrentScope())) {
                return 13 /* napi_handle_scope_mismatch */;
            }
            envObject.closeScope(envObject.scopeStore.get(scope));
            return envObject.clearLastError();
        });
    });
}
function napi_escape_handle(env, scope, escapee, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [scope, escapee, result], function () {
            var scopeObject = envObject.scopeStore.get(scope);
            if (!scopeObject.escapeCalled()) {
                var newHandle = scopeObject.escape(escapee);
                HEAP32[result >> 2] = newHandle ? newHandle.id : 0;
                return envObject.clearLastError();
            }
            return envObject.setLastError(12 /* napi_escape_called_twice */);
        });
    });
}
function napi_create_reference(env, value, initial_refcount, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (!(handle.isObject() || handle.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            var ref = emnapi.Reference.create(envObject, handle.id, initial_refcount >>> 0, false);
            HEAP32[result >> 2] = ref.id;
            return envObject.clearLastError();
        });
    });
}
function napi_delete_reference(env, ref) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [ref], function () {
            emnapi.Reference.doDelete(envObject.refStore.get(ref));
            return envObject.clearLastError();
        });
    });
}
function napi_reference_ref(env, ref, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [ref], function () {
            var count = envObject.refStore.get(ref).ref();
            if (result !== 0) {
                HEAPU32[result >> 2] = count;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_reference_unref(env, ref, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [ref], function () {
            var reference = envObject.refStore.get(ref);
            if (reference.refcount === 0) {
                return envObject.setLastError(9 /* napi_generic_failure */);
            }
            var count = reference.unref();
            if (result !== 0) {
                HEAPU32[result >> 2] = count;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_reference_value(env, ref, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [ref, result], function () {
            var _a;
            var reference = envObject.refStore.get(ref);
            var handleId = reference.get();
            if (handleId !== 0) {
                var handle = envObject.handleStore.get(handleId);
                handle.addRef(reference);
                (_a = envObject.getCurrentScope()) === null || _a === void 0 ? void 0 : _a.addHandle(handle);
            }
            HEAP32[result >> 2] = handleId;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_open_handle_scope', napi_open_handle_scope);
emnapiImplement('napi_close_handle_scope', napi_close_handle_scope);
emnapiImplement('napi_open_escapable_handle_scope', napi_open_escapable_handle_scope);
emnapiImplement('napi_close_escapable_handle_scope', napi_close_escapable_handle_scope);
emnapiImplement('napi_escape_handle', napi_escape_handle);
emnapiImplement('napi_create_reference', napi_create_reference);
emnapiImplement('napi_delete_reference', napi_delete_reference);
emnapiImplement('napi_reference_ref', napi_reference_ref);
emnapiImplement('napi_reference_unref', napi_reference_unref);
emnapiImplement('napi_get_reference_value', napi_get_reference_value);
function napi_adjust_external_memory(env, _low, _high, _result) {
    return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
}
emnapiImplement('napi_adjust_external_memory', napi_adjust_external_memory, ['napi_set_last_error']);
function napi_create_promise(env, deferred, promise) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [deferred, promise], function () {
            var p = new Promise(function (resolve, reject) {
                var deferredObject = emnapi.Deferred.create(envObject, { resolve: resolve, reject: reject });
                HEAP32[deferred >> 2] = deferredObject.id;
            });
            HEAP32[promise >> 2] = envObject.getCurrentScope().add(p).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_resolve_deferred(env, deferred, resolution) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [deferred, resolution], function () {
            var deferredObject = envObject.deferredStore.get(deferred);
            deferredObject.resolve(envObject.handleStore.get(resolution).value);
            return envObject.getReturnStatus();
        });
    });
}
function napi_reject_deferred(env, deferred, resolution) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [deferred, resolution], function () {
            var deferredObject = envObject.deferredStore.get(deferred);
            deferredObject.reject(envObject.handleStore.get(resolution).value);
            return envObject.getReturnStatus();
        });
    });
}
function napi_is_promise(env, value, is_promise) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, is_promise], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[is_promise] = h.isPromise() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_create_promise', napi_create_promise);
emnapiImplement('napi_resolve_deferred', napi_resolve_deferred);
emnapiImplement('napi_reject_deferred', napi_reject_deferred);
emnapiImplement('napi_is_promise', napi_is_promise);
function napi_get_all_property_names(env, object, key_mode, key_filter, key_conversion, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            if (key_mode !== 0 /* napi_key_include_prototypes */ && key_mode !== 1 /* napi_key_own_only */) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (key_conversion !== 0 /* napi_key_keep_numbers */ && key_conversion !== 1 /* napi_key_numbers_to_strings */) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var names = emnapiGetPropertyNames(h.value, key_mode, key_filter, key_conversion);
            HEAP32[result >> 2] = envObject.getCurrentScope().add(names).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_property_names(env, object, result) {
    return _napi_get_all_property_names(env, object, 0 /* napi_key_include_prototypes */, 2 /* napi_key_enumerable */ | 16 /* napi_key_skip_symbols */, 1 /* napi_key_numbers_to_strings */, result);
}
function napi_set_property(env, object, key, value) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [key, value, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            h.value[envObject.handleStore.get(key).value] = envObject.handleStore.get(value).value;
            return envObject.getReturnStatus();
        });
    });
}
function napi_has_property(env, object, key, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [key, result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAPU8[result] = (envObject.handleStore.get(key).value in h.value) ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_property(env, object, key, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [key, result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAP32[result >> 2] = envObject.ensureHandleId(h.value[envObject.handleStore.get(key).value]);
            return envObject.getReturnStatus();
        });
    });
}
function napi_delete_property(env, object, key, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [key, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            var r = delete h.value[envObject.handleStore.get(key).value];
            if (result !== 0) {
                HEAPU8[result] = r ? 1 : 0;
            }
            return envObject.getReturnStatus();
        });
    });
}
function napi_has_own_property(env, object, key, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [key, result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            var prop = envObject.handleStore.get(key).value;
            if (typeof prop !== 'string' && typeof prop !== 'symbol') {
                return envObject.setLastError(4 /* napi_name_expected */);
            }
            var r = Object.prototype.hasOwnProperty.call(h.value, envObject.handleStore.get(key).value);
            HEAPU8[result] = r ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_set_named_property(env, object, name, value) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            if (name === 0) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            envObject.handleStore.get(object).value[UTF8ToString(name)] = envObject.handleStore.get(value).value;
            return 0 /* napi_ok */;
        });
    });
}
function napi_has_named_property(env, object, utf8name, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, object], function () {
            if (utf8name === 0) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            var r = UTF8ToString(utf8name) in h.value;
            HEAPU8[result] = r ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_named_property(env, object, utf8name, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, object], function () {
            if (utf8name === 0) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAP32[result >> 2] = envObject.ensureHandleId(h.value[UTF8ToString(utf8name)]);
            return envObject.getReturnStatus();
        });
    });
}
function napi_set_element(env, object, index, value) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            h.value[index >>> 0] = envObject.handleStore.get(value).value;
            return envObject.getReturnStatus();
        });
    });
}
function napi_has_element(env, object, index, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAPU8[result] = ((index >>> 0) in h.value) ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_element(env, object, index, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAP32[result >> 2] = envObject.ensureHandleId(h.value[index >>> 0]);
            return envObject.getReturnStatus();
        });
    });
}
function napi_delete_element(env, object, index, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [object], function () {
            var h = envObject.handleStore.get(object);
            if (!(h.isObject() || h.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            var r = delete h.value[index >>> 0];
            if (result !== 0) {
                HEAPU8[result] = r ? 1 : 0;
            }
            return envObject.getReturnStatus();
        });
    });
}
function napi_define_properties(env, object, property_count, properties) {
    return emnapi.preamble(env, function (envObject) {
        if (property_count > 0) {
            if (properties === 0)
                return envObject.setLastError(1 /* napi_invalid_arg */);
        }
        if (object === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var h = envObject.handleStore.get(object);
        var maybeObject = h.value;
        if (!(h.isObject() || h.isFunction())) {
            return envObject.setLastError(2 /* napi_object_expected */);
        }
        for (var i = 0; i < property_count; i++) {
            var propPtr = properties + (i * 32);
            var utf8Name = HEAP32[propPtr >> 2];
            var name_2 = HEAP32[propPtr + 4 >> 2];
            var method = HEAP32[propPtr + 8 >> 2];
            var getter = HEAP32[propPtr + 12 >> 2];
            var setter = HEAP32[propPtr + 16 >> 2];
            var value = HEAP32[propPtr + 20 >> 2];
            var attributes = HEAP32[propPtr + 24 >> 2];
            var data = HEAP32[propPtr + 28 >> 2];
            var propertyName = void 0;
            if (utf8Name !== 0) {
                propertyName = UTF8ToString(utf8Name);
            }
            else {
                if (name_2 === 0) {
                    return envObject.setLastError(4 /* napi_name_expected */);
                }
                propertyName = envObject.handleStore.get(name_2).value;
                if (typeof propertyName !== 'string' && typeof propertyName !== 'symbol') {
                    return envObject.setLastError(4 /* napi_name_expected */);
                }
            }
            emnapiDefineProperty(envObject, maybeObject, propertyName, method, getter, setter, value, attributes, data);
        }
        return 0 /* napi_ok */;
    });
}
function napi_object_freeze(env, object) {
    return emnapi.preamble(env, function (envObject) {
        if (object === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var h = envObject.handleStore.get(object);
        var maybeObject = h.value;
        if (!(h.isObject() || h.isFunction())) {
            return envObject.setLastError(2 /* napi_object_expected */);
        }
        Object.freeze(maybeObject);
        return envObject.getReturnStatus();
    });
}
function napi_object_seal(env, object) {
    return emnapi.preamble(env, function (envObject) {
        if (object === 0)
            return envObject.setLastError(1 /* napi_invalid_arg */);
        var h = envObject.handleStore.get(object);
        var maybeObject = h.value;
        if (!(h.isObject() || h.isFunction())) {
            return envObject.setLastError(2 /* napi_object_expected */);
        }
        Object.seal(maybeObject);
        return envObject.getReturnStatus();
    });
}
emnapiImplement('napi_get_all_property_names', napi_get_all_property_names, ['$emnapiGetPropertyNames']);
emnapiImplement('napi_get_property_names', napi_get_property_names, ['napi_get_all_property_names']);
emnapiImplement('napi_set_property', napi_set_property);
emnapiImplement('napi_has_property', napi_has_property);
emnapiImplement('napi_get_property', napi_get_property);
emnapiImplement('napi_delete_property', napi_delete_property);
emnapiImplement('napi_has_own_property', napi_has_own_property);
emnapiImplement('napi_set_named_property', napi_set_named_property);
emnapiImplement('napi_has_named_property', napi_has_named_property);
emnapiImplement('napi_get_named_property', napi_get_named_property);
emnapiImplement('napi_set_element', napi_set_element);
emnapiImplement('napi_has_element', napi_has_element);
emnapiImplement('napi_get_element', napi_get_element);
emnapiImplement('napi_delete_element', napi_delete_element);
emnapiImplement('napi_define_properties', napi_define_properties, ['$emnapiDefineProperty']);
emnapiImplement('napi_object_freeze', napi_object_freeze);
emnapiImplement('napi_object_seal', napi_object_seal);
/* function napi_module_register (nodeModule: Pointer<node_module>): void {
  if (nodeModule === NULL) return

  const addr = nodeModule >> 2
  // const nm_version = HEAP32[addr]
  // const nm_flags = HEAP32[addr + 1]
  // const nm_filename = HEAP32[addr + 2]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nm_register_func = HEAP32[addr + 3]

  const nm_modname = HEAP32[addr + 4]
  const modName = UTF8ToString(nm_modname) || 'emnapiExports'
  // const nm_priv = HEAP32[addr + 5]
  // const reserved = HEAP32[addr + 6]

  const env = emnapi.Env.create()
  emnapi.initErrorMemory()

  env.callInNewHandleScope((scope) => {
    const exports = {}
    const exportsHandle = scope.add(exports)

    const napiValue = emnapi.call_iii(nm_register_func, env.id, exportsHandle.id)
    Module[modName] = env.handleStore.get(napiValue)!.value
  })
  if (env.tryCatch.hasCaught()) {
    const err = env.tryCatch.extractException()!
    throw err
  }
  // console.log(env.handleStore.allId())
}

emnapiImplement('napi_module_register', napi_module_register) */
function napi_run_script(env, script, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [script, result], function () {
            var v8Script = envObject.handleStore.get(script);
            if (!v8Script.isString()) {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            var g = envObject.handleStore.get(emnapi.HandleStore.ID_GLOBAL).value;
            var ret = g.eval(v8Script.value);
            HEAP32[result >> 2] = envObject.ensureHandleId(ret);
            return envObject.getReturnStatus();
        });
    });
}
emnapiImplement('napi_run_script', napi_run_script);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emnapiImplement(name, compilerTimeFunction, deps) {
    var _a;
    mergeInto(LibraryManager.library, (_a = {},
        _a[name] = compilerTimeFunction,
        _a[name + '__deps'] = (['$emnapi', '$emnapiInit']).concat(deps !== null && deps !== void 0 ? deps : []),
        _a));
}
mergeInto(LibraryManager.library, {
    napi_set_last_error: function (env, error_code, engine_error_code, engine_reserved) {
        var envObject = emnapi.envStore.get(env);
        return envObject.setLastError(error_code, engine_error_code, engine_reserved);
    },
    napi_set_last_error__deps: ['$emnapi'],
    napi_clear_last_error: function (env) {
        var envObject = emnapi.envStore.get(env);
        return envObject.clearLastError();
    },
    napi_clear_last_error__deps: ['$emnapi']
});
function napi_typeof(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var v = envObject.handleStore.get(value);
            if (v.isNumber()) {
                HEAP32[result >> 2] = 3 /* napi_number */;
            }
            else if (v.isBigInt()) {
                HEAP32[result >> 2] = 9 /* napi_bigint */;
            }
            else if (v.isString()) {
                HEAP32[result >> 2] = 4 /* napi_string */;
            }
            else if (v.isFunction()) {
                // This test has to come before IsObject because IsFunction
                // implies IsObject
                HEAP32[result >> 2] = 7 /* napi_function */;
            }
            else if (v.isExternal()) {
                // This test has to come before IsObject because IsExternal
                // implies IsObject
                HEAP32[result >> 2] = 8 /* napi_external */;
            }
            else if (v.isObject()) {
                HEAP32[result >> 2] = 6 /* napi_object */;
            }
            else if (v.isBoolean()) {
                HEAP32[result >> 2] = 2 /* napi_boolean */;
            }
            else if (v.isUndefined()) {
                HEAP32[result >> 2] = 0 /* napi_undefined */;
            }
            else if (v.isSymbol()) {
                HEAP32[result >> 2] = 5 /* napi_symbol */;
            }
            else if (v.isNull()) {
                HEAP32[result >> 2] = 1 /* napi_null */;
            }
            else {
                // Should not get here unless V8 has added some new kind of value.
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            return envObject.clearLastError();
        });
    });
}
function napi_coerce_to_bool(env, value, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            HEAP32[result >> 2] = handle.value ? emnapi.HandleStore.ID_TRUE : emnapi.HandleStore.ID_FALSE;
            return envObject.getReturnStatus();
        });
    });
}
function napi_coerce_to_number(env, value, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (handle.isBigInt()) {
                envObject.tryCatch.setError(new TypeError('Cannot convert a BigInt value to a number'));
                return envObject.setLastError(10 /* napi_pending_exception */);
            }
            HEAP32[result >> 2] = envObject.getCurrentScope().add(Number(handle.value)).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_coerce_to_object(env, value, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            HEAP32[result >> 2] = envObject.ensureHandleId(Object(handle.value));
            return envObject.getReturnStatus();
        });
    });
}
function napi_coerce_to_string(env, value, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (handle.isSymbol()) {
                envObject.tryCatch.setError(new TypeError('Cannot convert a Symbol value to a string'));
                return envObject.setLastError(10 /* napi_pending_exception */);
            }
            HEAP32[result >> 2] = envObject.getCurrentScope().add(String(handle.value)).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_instanceof(env, object, constructor, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [object, result, constructor], function () {
            HEAPU8[result] = 0;
            var ctor = envObject.handleStore.get(constructor);
            if (!ctor.isFunction()) {
                return envObject.setLastError(5 /* napi_function_expected */);
            }
            var val = envObject.handleStore.get(object).value;
            var ret = val instanceof ctor.value;
            HEAPU8[result] = ret ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_is_array(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[result] = h.isArray() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_is_arraybuffer(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[result] = h.isArrayBuffer() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_is_date(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[result] = h.isDate() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_is_error(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var val = envObject.handleStore.get(value).value;
            HEAPU8[result] = val instanceof Error ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_is_typedarray(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[result] = h.isTypedArray() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_is_dataview(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var h = envObject.handleStore.get(value);
            HEAPU8[result] = h.isDataView() ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_strict_equals(env, lhs, rhs, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [lhs, rhs, result], function () {
            var lv = envObject.handleStore.get(lhs).value;
            var rv = envObject.handleStore.get(rhs).value;
            HEAPU8[result] = (lv === rv) ? 1 : 0;
            return envObject.getReturnStatus();
        });
    });
}
function napi_detach_arraybuffer(env, _arraybuffer) {
    return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
}
function napi_is_detached_arraybuffer(env, arraybuffer, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [arraybuffer, result], function () {
            var h = envObject.handleStore.get(arraybuffer);
            if (h.isArrayBuffer() && h.value.byteLength === 0) {
                try {
                    // eslint-disable-next-line no-new
                    new Uint8Array(h.value);
                }
                catch (_) {
                    HEAPU8[result] = 1;
                    return envObject.getReturnStatus();
                }
            }
            HEAPU8[result] = 0;
            return envObject.getReturnStatus();
        });
    });
}
emnapiImplement('napi_typeof', napi_typeof);
emnapiImplement('napi_coerce_to_bool', napi_coerce_to_bool);
emnapiImplement('napi_coerce_to_number', napi_coerce_to_number);
emnapiImplement('napi_coerce_to_object', napi_coerce_to_object);
emnapiImplement('napi_coerce_to_string', napi_coerce_to_string);
emnapiImplement('napi_instanceof', napi_instanceof);
emnapiImplement('napi_is_array', napi_is_array);
emnapiImplement('napi_is_arraybuffer', napi_is_arraybuffer);
emnapiImplement('napi_is_date', napi_is_date);
emnapiImplement('napi_is_error', napi_is_error);
emnapiImplement('napi_is_typedarray', napi_is_typedarray);
emnapiImplement('napi_is_dataview', napi_is_dataview);
emnapiImplement('napi_strict_equals', napi_strict_equals);
emnapiImplement('napi_detach_arraybuffer', napi_detach_arraybuffer, ['napi_set_last_error']);
emnapiImplement('napi_is_detached_arraybuffer', napi_is_detached_arraybuffer, ['napi_set_last_error']);
function napi_get_version(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAPU32[result >> 2] = 8;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_get_version', napi_get_version);
function napi_define_class(env, utf8name, length, constructor, callback_data, property_count, properties, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result, constructor], function () {
            property_count = property_count >>> 0;
            length = length >>> 0;
            if (property_count > 0) {
                if (properties === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (!((length === 0xffffffff) || (length <= 2147483647)) || (utf8name === 0)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var fresult = emnapiCreateFunction(envObject, utf8name, length, constructor, callback_data);
            if (fresult.status !== 0 /* napi_ok */)
                return envObject.setLastError(fresult.status);
            var F = fresult.f;
            for (var i = 0; i < property_count; i++) {
                var propPtr = properties + (i * 32);
                var utf8Name = HEAP32[propPtr >> 2];
                var name_3 = HEAP32[propPtr + 4 >> 2];
                var method = HEAP32[propPtr + 8 >> 2];
                var getter = HEAP32[propPtr + 12 >> 2];
                var setter = HEAP32[propPtr + 16 >> 2];
                var value = HEAP32[propPtr + 20 >> 2];
                var attributes = HEAP32[propPtr + 24 >> 2];
                var data = HEAP32[propPtr + 28 >> 2];
                var propertyName = void 0;
                if (utf8Name !== 0) {
                    propertyName = UTF8ToString(utf8Name);
                }
                else {
                    if (name_3 === 0) {
                        return envObject.setLastError(4 /* napi_name_expected */);
                    }
                    propertyName = envObject.handleStore.get(name_3).value;
                    if (typeof propertyName !== 'string' && typeof propertyName !== 'symbol') {
                        return envObject.setLastError(4 /* napi_name_expected */);
                    }
                }
                if ((attributes & 1024 /* napi_static */) !== 0) {
                    emnapiDefineProperty(envObject, F, propertyName, method, getter, setter, value, attributes, data);
                    continue;
                }
                emnapiDefineProperty(envObject, F.prototype, propertyName, method, getter, setter, value, attributes, data);
            }
            var valueHandle = envObject.getCurrentScope().add(F);
            HEAP32[result >> 2] = valueHandle.id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_wrap(env, js_object, native_object, finalize_cb, finalize_hint, result) {
    if (!emnapi.supportFinalizer)
        return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
    return emnapiWrap(0 /* retrievable */, env, js_object, native_object, finalize_cb, finalize_hint, result);
}
function napi_unwrap(env, js_object, result) {
    if (!emnapi.supportFinalizer)
        return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
    return emnapiUnwrap(env, js_object, result, 0 /* KeepWrap */);
}
function napi_remove_wrap(env, js_object, result) {
    if (!emnapi.supportFinalizer)
        return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
    return emnapiUnwrap(env, js_object, result, 1 /* RemoveWrap */);
}
function napi_type_tag_object(env, object, type_tag) {
    return emnapi.preamble(env, function (envObject) {
        if (object === 0) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        var value = envObject.handleStore.get(object);
        if (!(value.isObject() || value.isFunction())) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 2 /* napi_object_expected */);
        }
        if (type_tag === 0) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        if (value.tag !== null) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        value.tag = [
            HEAPU32[type_tag >> 2],
            HEAPU32[(type_tag + 4) >> 2],
            HEAPU32[(type_tag + 8) >> 2],
            HEAPU32[(type_tag + 12) >> 2]
        ];
        return envObject.getReturnStatus();
    });
}
function napi_check_object_type_tag(env, object, type_tag, result) {
    return emnapi.preamble(env, function (envObject) {
        if (object === 0) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        var value = envObject.handleStore.get(object);
        if (!(value.isObject() || value.isFunction())) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 2 /* napi_object_expected */);
        }
        if (type_tag === 0) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        if (result === 0) {
            return envObject.setLastError(envObject.tryCatch.hasCaught() ? 10 /* napi_pending_exception */ : 1 /* napi_invalid_arg */);
        }
        var ret = true;
        if (value.tag !== null) {
            for (var i = 0; i < 4; i++) {
                if (HEAPU32[(type_tag + (i * 4)) >> 2] !== value.tag[i]) {
                    ret = false;
                    break;
                }
            }
        }
        else {
            ret = false;
        }
        HEAPU8[result] = ret ? 1 : 0;
        return envObject.getReturnStatus();
    });
}
function napi_add_finalizer(env, js_object, native_object, finalize_cb, finalize_hint, result) {
    if (!emnapi.supportFinalizer)
        return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
    return emnapiWrap(1 /* anonymous */, env, js_object, native_object, finalize_cb, finalize_hint, result);
}
emnapiImplement('napi_define_class', napi_define_class, ['$emnapiCreateFunction', '$emnapiDefineProperty']);
emnapiImplement('napi_wrap', napi_wrap, ['$emnapiWrap', 'napi_set_last_error']);
emnapiImplement('napi_unwrap', napi_unwrap, ['$emnapiUnwrap', 'napi_set_last_error']);
emnapiImplement('napi_remove_wrap', napi_remove_wrap, ['$emnapiUnwrap', 'napi_set_last_error']);
emnapiImplement('napi_type_tag_object', napi_type_tag_object);
emnapiImplement('napi_check_object_type_tag', napi_check_object_type_tag);
emnapiImplement('napi_add_finalizer', napi_add_finalizer, ['$emnapiWrap', 'napi_set_last_error']);
function napi_get_array_length(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (!handle.isArray()) {
                return envObject.setLastError(8 /* napi_array_expected */);
            }
            HEAPU32[result >> 2] = handle.value.length >>> 0;
            return envObject.clearLastError();
        });
    });
}
function napi_get_arraybuffer_info(env, arraybuffer, data, byte_length) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [arraybuffer], function () {
            var handle = envObject.handleStore.get(arraybuffer);
            if (!handle.isArrayBuffer()) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (data !== 0) {
                HEAP32[data >> 2] = envObject.getArrayBufferPointer(handle.value);
            }
            if (byte_length !== 0) {
                HEAPU32[byte_length >> 2] = handle.value.byteLength;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_prototype(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (!(handle.isObject() || handle.isFunction())) {
                return envObject.setLastError(2 /* napi_object_expected */);
            }
            HEAP32[result >> 2] = envObject.ensureHandleId(Object.getPrototypeOf(handle.value));
            return envObject.clearLastError();
        });
    });
}
function napi_get_typedarray_info(env, typedarray, type, length, data, arraybuffer, byte_offset) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [typedarray], function () {
            var handle = envObject.handleStore.get(typedarray);
            if (!handle.isTypedArray()) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var v = handle.value;
            if (type !== 0) {
                if (v instanceof Int8Array) {
                    HEAP32[type >> 2] = 0 /* napi_int8_array */;
                }
                else if (v instanceof Uint8Array) {
                    HEAP32[type >> 2] = 1 /* napi_uint8_array */;
                }
                else if (v instanceof Uint8ClampedArray) {
                    HEAP32[type >> 2] = 2 /* napi_uint8_clamped_array */;
                }
                else if (v instanceof Int16Array) {
                    HEAP32[type >> 2] = 3 /* napi_int16_array */;
                }
                else if (v instanceof Uint16Array) {
                    HEAP32[type >> 2] = 4 /* napi_uint16_array */;
                }
                else if (v instanceof Int32Array) {
                    HEAP32[type >> 2] = 5 /* napi_int32_array */;
                }
                else if (v instanceof Uint32Array) {
                    HEAP32[type >> 2] = 6 /* napi_uint32_array */;
                }
                else if (v instanceof Float32Array) {
                    HEAP32[type >> 2] = 7 /* napi_float32_array */;
                }
                else if (v instanceof Float64Array) {
                    HEAP32[type >> 2] = 8 /* napi_float64_array */;
                }
                else if (v instanceof BigInt64Array) {
                    HEAP32[type >> 2] = 9 /* napi_bigint64_array */;
                }
                else if (v instanceof BigUint64Array) {
                    HEAP32[type >> 2] = 10 /* napi_biguint64_array */;
                }
            }
            if (length !== 0) {
                HEAPU32[length >> 2] = v.length;
            }
            var buffer;
            if (data !== 0 || arraybuffer !== 0) {
                buffer = v.buffer;
                if (data !== 0) {
                    HEAP32[data >> 2] = envObject.getViewPointer(v);
                }
                if (arraybuffer !== 0) {
                    HEAP32[arraybuffer >> 2] = envObject.ensureHandleId(buffer);
                }
            }
            if (byte_offset !== 0) {
                HEAPU32[byte_offset >> 2] = v.byteOffset;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_dataview_info(env, dataview, byte_length, data, arraybuffer, byte_offset) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [dataview], function () {
            var handle = envObject.handleStore.get(dataview);
            if (!handle.isDataView()) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var v = handle.value;
            if (byte_length !== 0) {
                HEAPU32[byte_length >> 2] = v.byteLength;
            }
            var buffer;
            if (data !== 0 || arraybuffer !== 0) {
                buffer = v.buffer;
                if (data !== 0) {
                    HEAP32[data >> 2] = envObject.getViewPointer(v);
                }
                if (arraybuffer !== 0) {
                    HEAP32[arraybuffer >> 2] = envObject.ensureHandleId(buffer);
                }
            }
            if (byte_offset !== 0) {
                HEAPU32[byte_offset >> 2] = v.byteOffset;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_date_value(env, value, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (!handle.isDate()) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            HEAPF64[result >> 3] = handle.value.valueOf();
            return envObject.getReturnStatus();
        });
    });
}
function napi_get_value_bool(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'boolean') {
                return envObject.setLastError(7 /* napi_boolean_expected */);
            }
            HEAPU8[result] = handle.value ? 1 : 0;
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_double(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'number') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            HEAPF64[result >> 3] = handle.value;
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_bigint_int64(env, value, result, lossless) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [value, result, lossless], function () {
            var handle = envObject.handleStore.get(value);
            var numberValue = handle.value;
            if (typeof numberValue !== 'bigint') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            if ((numberValue >= (BigInt(-1) * (BigInt(1) << BigInt(63)))) && (numberValue < (BigInt(1) << BigInt(63)))) {
                HEAPU8[lossless] = 1;
            }
            else {
                HEAPU8[lossless] = 0;
                numberValue = numberValue & ((BigInt(1) << BigInt(64)) - BigInt(1));
                if (numberValue >= (BigInt(1) << BigInt(63))) {
                    numberValue = numberValue - (BigInt(1) << BigInt(64));
                }
            }
            var low = Number(numberValue & BigInt(0xffffffff));
            var high = Number(numberValue >> BigInt(32));
            HEAP32[result >> 2] = low;
            HEAP32[result + 4 >> 2] = high;
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_bigint_uint64(env, value, result, lossless) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [value, result, lossless], function () {
            var handle = envObject.handleStore.get(value);
            var numberValue = handle.value;
            if (typeof numberValue !== 'bigint') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            if ((numberValue >= BigInt(0)) && (numberValue < (BigInt(1) << BigInt(64)))) {
                HEAPU8[lossless] = 1;
            }
            else {
                HEAPU8[lossless] = 0;
                numberValue = numberValue & ((BigInt(1) << BigInt(64)) - BigInt(1));
            }
            var low = Number(numberValue & BigInt(0xffffffff));
            var high = Number(numberValue >> BigInt(32));
            HEAPU32[result >> 2] = low;
            HEAPU32[result + 4 >> 2] = high;
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_bigint_words(env, value, sign_bit, word_count, words) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [value, word_count], function () {
            var handle = envObject.handleStore.get(value);
            if (!handle.isBigInt()) {
                return envObject.setLastError(17 /* napi_bigint_expected */);
            }
            var isMinus = handle.value < BigInt(0);
            var word_count_int = HEAP32[word_count >> 2];
            var wordCount = 0;
            var bigintValue = isMinus ? (handle.value * BigInt(-1)) : handle.value;
            while (bigintValue !== BigInt(0)) {
                wordCount++;
                bigintValue = bigintValue >> BigInt(64);
            }
            bigintValue = isMinus ? (handle.value * BigInt(-1)) : handle.value;
            word_count_int = wordCount;
            if (sign_bit === 0 && words === 0) {
                HEAPU32[word_count >> 2] = word_count_int;
            }
            else {
                if (sign_bit === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                if (words === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                var wordsArr = [];
                while (bigintValue !== BigInt(0)) {
                    var uint64 = bigintValue & ((BigInt(1) << BigInt(64)) - BigInt(1));
                    wordsArr.push(uint64);
                    bigintValue = bigintValue >> BigInt(64);
                }
                var len = Math.min(word_count_int, wordsArr.length);
                for (var i = 0; i < len; i++) {
                    var low = Number(wordsArr[i] & BigInt(0xffffffff));
                    var high = Number(wordsArr[i] >> BigInt(32));
                    HEAPU32[(words + (i * 8)) >> 2] = low;
                    HEAPU32[(words + 4 + (i * 8)) >> 2] = high;
                }
                HEAP32[sign_bit >> 2] = isMinus ? 1 : 0;
                HEAPU32[word_count >> 2] = len;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_external(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (!handle.isExternal()) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            HEAP32[result >> 2] = handle.data();
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_int32(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'number') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            HEAP32[result >> 2] = handle.value;
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_int64(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'number') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            var numberValue = handle.value;
            if (numberValue === Number.POSITIVE_INFINITY || numberValue === Number.NEGATIVE_INFINITY || isNaN(numberValue)) {
                HEAP32[result >> 2] = 0;
                HEAP32[result + 4 >> 2] = 0;
            }
            else if (numberValue < -9223372036854776000) {
                HEAP32[result >> 2] = 0;
                HEAP32[result + 4 >> 2] = 0x80000000;
            }
            else if (numberValue >= 9223372036854776000) {
                HEAPU32[result >> 2] = 0xffffffff;
                HEAPU32[result + 4 >> 2] = 0x7fffffff;
            }
            else {
                var tempDouble = void 0;
                var tempI64 = [numberValue >>> 0, (tempDouble = numberValue, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                HEAP32[result >> 2] = tempI64[0];
                HEAP32[result + 4 >> 2] = tempI64[1];
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_string_latin1(env, value, buf, buf_size, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value], function () {
            buf_size = buf_size >>> 0;
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            if (buf === 0) {
                if (result === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                HEAPU32[result >> 2] = handle.value.length;
            }
            else if (buf_size !== 0) {
                var copied = 0;
                for (var i = 0; i < buf_size - 1; ++i) {
                    HEAPU8[buf + i] = handle.value.charCodeAt(i) & 0xff;
                    copied++;
                }
                HEAPU8[buf + copied] = 0;
                if (result !== 0) {
                    HEAPU32[result >> 2] = copied;
                }
            }
            else if (result !== 0) {
                HEAPU32[result >> 2] = 0;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_string_utf8(env, value, buf, buf_size, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value], function () {
            buf_size = buf_size >>> 0;
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            if (buf === 0) {
                if (result === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                HEAPU32[result >> 2] = lengthBytesUTF8(handle.value);
            }
            else if (buf_size !== 0) {
                var copied = stringToUTF8(handle.value, buf, buf_size);
                if (result !== 0) {
                    HEAPU32[result >> 2] = copied;
                }
            }
            else if (result !== 0) {
                HEAPU32[result >> 2] = 0;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_string_utf16(env, value, buf, buf_size, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value], function () {
            buf_size = buf_size >>> 0;
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'string') {
                return envObject.setLastError(3 /* napi_string_expected */);
            }
            if (buf === 0) {
                if (result === 0)
                    return envObject.setLastError(1 /* napi_invalid_arg */);
                HEAPU32[result >> 2] = handle.value.length;
            }
            else if (buf_size !== 0) {
                var copied = stringToUTF16(handle.value, buf, buf_size * 2);
                if (result !== 0) {
                    HEAPU32[result >> 2] = copied / 2;
                }
            }
            else if (result !== 0) {
                HEAPU32[result >> 2] = 0;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_value_uint32(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [value, result], function () {
            var handle = envObject.handleStore.get(value);
            if (typeof handle.value !== 'number') {
                return envObject.setLastError(6 /* napi_number_expected */);
            }
            HEAPU32[result >> 2] = handle.value;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_get_array_length', napi_get_array_length);
emnapiImplement('napi_get_arraybuffer_info', napi_get_arraybuffer_info);
emnapiImplement('napi_get_prototype', napi_get_prototype);
emnapiImplement('napi_get_typedarray_info', napi_get_typedarray_info);
emnapiImplement('napi_get_dataview_info', napi_get_dataview_info);
emnapiImplement('napi_get_date_value', napi_get_date_value);
emnapiImplement('napi_get_value_bool', napi_get_value_bool);
emnapiImplement('napi_get_value_double', napi_get_value_double);
emnapiImplement('napi_get_value_bigint_int64', napi_get_value_bigint_int64);
emnapiImplement('napi_get_value_bigint_uint64', napi_get_value_bigint_uint64);
emnapiImplement('napi_get_value_bigint_words', napi_get_value_bigint_words);
emnapiImplement('napi_get_value_external', napi_get_value_external);
emnapiImplement('napi_get_value_int32', napi_get_value_int32);
emnapiImplement('napi_get_value_int64', napi_get_value_int64);
emnapiImplement('napi_get_value_string_latin1', napi_get_value_string_latin1);
emnapiImplement('napi_get_value_string_utf8', napi_get_value_string_utf8);
emnapiImplement('napi_get_value_string_utf16', napi_get_value_string_utf16);
emnapiImplement('napi_get_value_uint32', napi_get_value_uint32);
/* eslint-disable @typescript-eslint/indent */
function napi_create_int32(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_uint32(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value >>> 0).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_int64(env, low, high, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var value;
#if WASM_BIGINT
            value = Number(low);
            HEAP32[high >> 2] = envObject.getCurrentScope().add(value).id;
#else
            value = (low >>> 0) + (high * Math.pow(2, 32));
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
#endif
            return envObject.clearLastError();
        });
    });
}
function napi_create_double(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_string_latin1(env, str, length, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            length = length >>> 0;
            if (!((length === 0xffffffff) || (length <= 2147483647)) || (str === 0)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var latin1String = '';
            var len = 0;
            if (length === -1) {
                while (true) {
                    var ch = HEAPU8[str];
                    if (!ch)
                        break;
                    latin1String += String.fromCharCode(ch);
                    str++;
                }
            }
            else {
                while (len < length) {
                    var ch = HEAPU8[str];
                    if (!ch)
                        break;
                    latin1String += String.fromCharCode(ch);
                    len++;
                    str++;
                }
            }
            HEAP32[result >> 2] = envObject.getCurrentScope().add(latin1String).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_string_utf16(env, str, length, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            length = length >>> 0;
            if (!((length === 0xffffffff) || (length <= 2147483647)) || (str === 0)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var utf16String = length === -1 ? UTF16ToString(str) : UTF16ToString(str, length * 2);
            HEAP32[result >> 2] = envObject.getCurrentScope().add(utf16String).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_string_utf8(env, str, length, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            length = length >>> 0;
            if (!((length === 0xffffffff) || (length <= 2147483647)) || (str === 0)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var utf8String = length === -1 ? UTF8ToString(str) : UTF8ToString(str, length);
            HEAP32[result >> 2] = envObject.getCurrentScope().add(utf8String).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_bigint_int64(env, low, high, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [result], function () {
            var value;
#if WASM_BIGINT
            value = low;
            HEAP32[high >> 2] = envObject.getCurrentScope().add(value).id;
#else
            value = BigInt(low >>> 0) | (BigInt(high) << BigInt(32));
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
#endif
            return envObject.clearLastError();
        });
    });
}
function napi_create_bigint_uint64(env, low, high, result) {
    return emnapi.checkEnv(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [result], function () {
            var value;
#if WASM_BIGINT
            value = low;
            HEAP32[high >> 2] = envObject.getCurrentScope().add(value).id;
#else
            value = BigInt(low >>> 0) | (BigInt(high >>> 0) << BigInt(32));
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
#endif
            return envObject.clearLastError();
        });
    });
}
function napi_create_bigint_words(env, sign_bit, word_count, words, result) {
    return emnapi.preamble(env, function (envObject) {
        if (!emnapi.supportBigInt)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [result], function () {
            word_count = word_count >>> 0;
            if (word_count > 2147483647) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if (word_count > (1024 * 1024 / (4 * 8) / 2)) {
                throw new RangeError('Maximum BigInt size exceeded');
            }
            var value = BigInt(0);
            for (var i = 0; i < word_count; i++) {
                var low = HEAPU32[(words + (i * 8)) >> 2];
                var high = HEAPU32[(words + (i * 8) + 4) >> 2];
                var wordi = BigInt(low) | (BigInt(high) << BigInt(32));
                value += wordi << BigInt(64 * i);
            }
            value *= ((BigInt(sign_bit) % BigInt(2) === BigInt(0)) ? BigInt(1) : BigInt(-1));
            HEAP32[result >> 2] = envObject.getCurrentScope().add(value).id;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_create_int32', napi_create_int32);
emnapiImplement('napi_create_uint32', napi_create_uint32);
emnapiImplement('napi_create_int64', napi_create_int64);
emnapiImplement('napi_create_double', napi_create_double);
emnapiImplement('napi_create_bigint_int64', napi_create_bigint_int64);
emnapiImplement('napi_create_bigint_uint64', napi_create_bigint_uint64);
emnapiImplement('napi_create_bigint_words', napi_create_bigint_words);
emnapiImplement('napi_create_string_latin1', napi_create_string_latin1);
emnapiImplement('napi_create_string_utf16', napi_create_string_utf16);
emnapiImplement('napi_create_string_utf8', napi_create_string_utf8);
function napi_create_array(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add([]).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_array_with_length(env, length, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add(new Array(length >>> 0)).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_arraybuffer(env, byte_length, _data, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            byte_length = byte_length >>> 0;
            HEAP32[result >> 2] = envObject.getCurrentScope().add(new ArrayBuffer(byte_length)).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_create_date(env, time, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add(new Date(time)).id;
            return envObject.getReturnStatus();
        });
    });
}
function napi_create_external(env, data, finalize_cb, finalize_hint, result) {
    return emnapi.preamble(env, function (envObject) {
        if (!emnapi.supportFinalizer)
            return envObject.setLastError(9 /* napi_generic_failure */);
        return emnapi.checkArgs(envObject, [result], function () {
            var externalHandle = emnapi.ExternalHandle.createExternal(envObject, data);
            envObject.getCurrentScope().addHandle(externalHandle);
            emnapi.Reference.create(envObject, externalHandle.id, 0, true, finalize_cb, data, finalize_hint);
            HEAP32[result >> 2] = externalHandle.id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_external_arraybuffer(env, _external_data, _byte_length, _finalize_cb, _finalize_hint, _result) {
    return _napi_set_last_error(env, 9 /* napi_generic_failure */, 0, 0);
}
function napi_create_object(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = envObject.getCurrentScope().add({}).id;
            return envObject.clearLastError();
        });
    });
}
function napi_create_symbol(env, description, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            if (description === 0) {
                // eslint-disable-next-line symbol-description
                HEAP32[result >> 2] = envObject.getCurrentScope().add(Symbol()).id;
            }
            else {
                var handle = envObject.handleStore.get(description);
                var desc = handle.value;
                if (typeof desc !== 'string') {
                    return envObject.setLastError(3 /* napi_string_expected */);
                }
                HEAP32[result >> 2] = envObject.getCurrentScope().add(Symbol(desc)).id;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_create_typedarray(env, type, length, arraybuffer, byte_offset, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [arraybuffer, result], function () {
            length = length >>> 0;
            byte_offset = byte_offset >>> 0;
            var handle = envObject.handleStore.get(arraybuffer);
            var buffer = handle.value;
            if (!(buffer instanceof ArrayBuffer)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            var retCallback = function (out) {
                HEAP32[result >> 2] = envObject.getCurrentScope().add(out).id;
                return envObject.getReturnStatus();
            };
            switch (type) {
                case 0 /* napi_int8_array */:
                    return emnapiCreateTypedArray(envObject, Int8Array, 1, buffer, byte_offset, length, retCallback);
                case 1 /* napi_uint8_array */:
                    return emnapiCreateTypedArray(envObject, Uint8Array, 1, buffer, byte_offset, length, retCallback);
                case 2 /* napi_uint8_clamped_array */:
                    return emnapiCreateTypedArray(envObject, Uint8ClampedArray, 1, buffer, byte_offset, length, retCallback);
                case 3 /* napi_int16_array */:
                    return emnapiCreateTypedArray(envObject, Int16Array, 2, buffer, byte_offset, length, retCallback);
                case 4 /* napi_uint16_array */:
                    return emnapiCreateTypedArray(envObject, Uint16Array, 2, buffer, byte_offset, length, retCallback);
                case 5 /* napi_int32_array */:
                    return emnapiCreateTypedArray(envObject, Int32Array, 4, buffer, byte_offset, length, retCallback);
                case 6 /* napi_uint32_array */:
                    return emnapiCreateTypedArray(envObject, Uint32Array, 4, buffer, byte_offset, length, retCallback);
                case 7 /* napi_float32_array */:
                    return emnapiCreateTypedArray(envObject, Float32Array, 4, buffer, byte_offset, length, retCallback);
                case 8 /* napi_float64_array */:
                    return emnapiCreateTypedArray(envObject, Float64Array, 8, buffer, byte_offset, length, retCallback);
                case 9 /* napi_bigint64_array */:
                    return emnapiCreateTypedArray(envObject, BigInt64Array, 8, buffer, byte_offset, length, retCallback);
                case 10 /* napi_biguint64_array */:
                    return emnapiCreateTypedArray(envObject, BigUint64Array, 8, buffer, byte_offset, length, retCallback);
                default:
                    return envObject.setLastError(1 /* napi_invalid_arg */);
            }
        });
    });
}
function napi_create_dataview(env, byte_length, arraybuffer, byte_offset, result) {
    return emnapi.preamble(env, function (envObject) {
        return emnapi.checkArgs(envObject, [arraybuffer, result], function () {
            byte_length = byte_length >>> 0;
            byte_offset = byte_offset >>> 0;
            var handle = envObject.handleStore.get(arraybuffer);
            var buffer = handle.value;
            if (!(buffer instanceof ArrayBuffer)) {
                return envObject.setLastError(1 /* napi_invalid_arg */);
            }
            if ((byte_length + byte_offset) > buffer.byteLength) {
                var err = new RangeError('byte_offset + byte_length should be less than or equal to the size in bytes of the array passed in');
                err.code = 'ERR_NAPI_INVALID_DATAVIEW_ARGS';
                envObject.tryCatch.setError(err);
                return envObject.setLastError(10 /* napi_pending_exception */);
            }
            var dataview = new DataView(buffer, byte_offset, byte_length);
            HEAP32[result >> 2] = envObject.getCurrentScope().add(dataview).id;
            return envObject.getReturnStatus();
        });
    });
}
function node_api_symbol_for(env, utf8description, length, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            var descriptionString = length === -1 ? UTF8ToString(utf8description) : UTF8ToString(utf8description, length);
            HEAP32[result >> 2] = envObject.getCurrentScope().add(Symbol.for(descriptionString)).id;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_create_array', napi_create_array);
emnapiImplement('napi_create_array_with_length', napi_create_array_with_length);
emnapiImplement('napi_create_arraybuffer', napi_create_arraybuffer);
emnapiImplement('napi_create_date', napi_create_date);
emnapiImplement('napi_create_external', napi_create_external);
emnapiImplement('napi_create_external_arraybuffer', napi_create_external_arraybuffer, ['napi_set_last_error']);
emnapiImplement('napi_create_object', napi_create_object);
emnapiImplement('napi_create_symbol', napi_create_symbol);
emnapiImplement('napi_create_typedarray', napi_create_typedarray, ['$emnapiCreateTypedArray']);
emnapiImplement('napi_create_dataview', napi_create_dataview);
emnapiImplement('node_api_symbol_for', node_api_symbol_for);
function napi_get_boolean(env, value, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            if (value === 0) {
                HEAP32[result >> 2] = emnapi.HandleStore.ID_FALSE;
            }
            else {
                HEAP32[result >> 2] = emnapi.HandleStore.ID_TRUE;
            }
            return envObject.clearLastError();
        });
    });
}
function napi_get_global(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = emnapi.HandleStore.ID_GLOBAL;
            return envObject.clearLastError();
        });
    });
}
function napi_get_null(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = emnapi.HandleStore.ID_NULL;
            return envObject.clearLastError();
        });
    });
}
function napi_get_undefined(env, result) {
    return emnapi.checkEnv(env, function (envObject) {
        return emnapi.checkArgs(envObject, [result], function () {
            HEAP32[result >> 2] = emnapi.HandleStore.ID_UNDEFINED;
            return envObject.clearLastError();
        });
    });
}
emnapiImplement('napi_get_boolean', napi_get_boolean);
emnapiImplement('napi_get_global', napi_get_global);
emnapiImplement('napi_get_null', napi_get_null);
emnapiImplement('napi_get_undefined', napi_get_undefined);
