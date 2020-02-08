;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(arguments).join(', ') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function isObject(input) {
        return Object.prototype.toString.call(input) === '[object Object]';
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale');
                config = mergeConfigs(locales[name]._config, config);
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    config = mergeConfigs(locales[config.parentLocale]._config, config);
                } else {
                    // treat as if there is no base config
                    deprecateSimple('parentLocaleUndefined',
                            'specified parentLocale is not defined yet');
                }
            }
            locales[name] = new Locale(config);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale;
            if (locales[name] != null) {
                config = mergeConfigs(locales[name]._config, config);
            }
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return Object.keys(locales);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        return isArray(this._months) ? this._months[m.month()] :
            this._months[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')$', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')$', 'i');
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             if (this.isValid() && other.isValid()) {
                 return other < this ? this : other;
             } else {
                 return valid__createInvalid();
             }
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(matchOffset, this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)W)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format]() : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return +this > +localInput;
        } else {
            return +localInput < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return +this < +localInput;
        } else {
            return +this.clone().endOf(units) < +localInput;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return +this === +localInput;
        } else {
            inputMs = +localInput;
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function moment_format__format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = local__createLocal([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = moment_format__format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = getSet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = getSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment_moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment_moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto._months           = defaultLocaleMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto._monthsShort      = defaultLocaleMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto._monthsRegex      = defaultMonthsRegex;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto._monthsShortRegex = defaultMonthsShortRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var duration_get__months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = duration_get__months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports

    ;

    //! moment.js
    //! version : 2.12.0
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    utils_hooks__hooks.version = '2.12.0';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment_moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment_moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.updateLocale          = updateLocale;
    utils_hooks__hooks.locales               = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.prototype             = momentPrototype;

    var moment__default = utils_hooks__hooks;

    //! moment.js locale configuration
    //! locale : afrikaans (af)
    //! author : Werner Mollentze : https://github.com/wernerm

    var af = moment__default.defineLocale('af', {
        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
        meridiemParse: /vm|nm/i,
        isPM : function (input) {
            return /^nm$/i.test(input);
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower ? 'vm' : 'VM';
            } else {
                return isLower ? 'nm' : 'NM';
            }
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Vandag om] LT',
            nextDay : '[MĂ´re om] LT',
            nextWeek : 'dddd [om] LT',
            lastDay : '[Gister om] LT',
            lastWeek : '[Laas] dddd [om] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'oor %s',
            past : '%s gelede',
            s : '\'n paar sekondes',
            m : '\'n minuut',
            mm : '%d minute',
            h : '\'n uur',
            hh : '%d ure',
            d : '\'n dag',
            dd : '%d dae',
            M : '\'n maand',
            MM : '%d maande',
            y : '\'n jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris RĂśling : https://github.com/jjupiter
        },
        week : {
            dow : 1, // Maandag is die eerste dag van die week.
            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
        }
    });

    //! moment.js locale configuration
    //! locale : Moroccan Arabic (ar-ma)
    //! author : ElFadili Yassine : https://github.com/ElFadiliY
    //! author : Abdel Said : https://github.com/abdelsaid

    var ar_ma = moment__default.defineLocale('ar-ma', {
        months : 'ŮŮŘ§ŮŘą_ŮŘ¨ŘąŘ§ŮŘą_ŮŘ§ŘąŘł_ŘŁŘ¨ŘąŮŮ_ŮŘ§Ů_ŮŮŮŮŮ_ŮŮŮŮŮŘ˛_ŘşŘ´ŘŞ_Ř´ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŘ¨Řą_ŘŻŘŹŮŘ¨Řą'.split('_'),
        monthsShort : 'ŮŮŘ§ŮŘą_ŮŘ¨ŘąŘ§ŮŘą_ŮŘ§ŘąŘł_ŘŁŘ¨ŘąŮŮ_ŮŘ§Ů_ŮŮŮŮŮ_ŮŮŮŮŮŘ˛_ŘşŘ´ŘŞ_Ř´ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŘ¨Řą_ŘŻŘŹŮŘ¨Řą'.split('_'),
        weekdays : 'Ř§ŮŘŁŘ­ŘŻ_Ř§ŮŘĽŘŞŮŮŮ_Ř§ŮŘŤŮŘ§ŘŤŘ§ŘĄ_Ř§ŮŘŁŘąŘ¨ŘšŘ§ŘĄ_Ř§ŮŘŽŮŮŘł_Ř§ŮŘŹŮŘšŘŠ_Ř§ŮŘłŘ¨ŘŞ'.split('_'),
        weekdaysShort : 'Ř§Ř­ŘŻ_Ř§ŘŞŮŮŮ_ŘŤŮŘ§ŘŤŘ§ŘĄ_Ř§ŘąŘ¨ŘšŘ§ŘĄ_ŘŽŮŮŘł_ŘŹŮŘšŘŠ_ŘłŘ¨ŘŞ'.split('_'),
        weekdaysMin : 'Ř­_Ů_ŘŤ_Řą_ŘŽ_ŘŹ_Řł'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Ř§ŮŮŮŮ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextDay: '[ŘşŘŻŘ§ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastDay: '[ŘŁŮŘł ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ŮŮ %s',
            past : 'ŮŮŘ° %s',
            s : 'ŘŤŮŘ§Ů',
            m : 'ŘŻŮŮŮŘŠ',
            mm : '%d ŘŻŮŘ§ŘŚŮ',
            h : 'ŘłŘ§ŘšŘŠ',
            hh : '%d ŘłŘ§ŘšŘ§ŘŞ',
            d : 'ŮŮŮ',
            dd : '%d ŘŁŮŘ§Ů',
            M : 'Ř´ŮŘą',
            MM : '%d ŘŁŘ´ŮŘą',
            y : 'ŘłŮŘŠ',
            yy : '%d ŘłŮŮŘ§ŘŞ'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Arabic Saudi Arabia (ar-sa)
    //! author : Suhail Alkowaileet : https://github.com/xsoh

    var ar_sa__symbolMap = {
        '1': 'ŮĄ',
        '2': 'Ů˘',
        '3': 'ŮŁ',
        '4': 'Ů¤',
        '5': 'ŮĽ',
        '6': 'ŮŚ',
        '7': 'Ů§',
        '8': 'Ů¨',
        '9': 'ŮŠ',
        '0': 'Ů '
    }, ar_sa__numberMap = {
        'ŮĄ': '1',
        'Ů˘': '2',
        'ŮŁ': '3',
        'Ů¤': '4',
        'ŮĽ': '5',
        'ŮŚ': '6',
        'Ů§': '7',
        'Ů¨': '8',
        'ŮŠ': '9',
        'Ů ': '0'
    };

    var ar_sa = moment__default.defineLocale('ar-sa', {
        months : 'ŮŮŘ§ŮŘą_ŮŘ¨ŘąŘ§ŮŘą_ŮŘ§ŘąŘł_ŘŁŘ¨ŘąŮŮ_ŮŘ§ŮŮ_ŮŮŮŮŮ_ŮŮŮŮŮ_ŘŁŘşŘłŘˇŘł_ŘłŘ¨ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŮŘ¨Řą_ŘŻŮŘłŮŘ¨Řą'.split('_'),
        monthsShort : 'ŮŮŘ§ŮŘą_ŮŘ¨ŘąŘ§ŮŘą_ŮŘ§ŘąŘł_ŘŁŘ¨ŘąŮŮ_ŮŘ§ŮŮ_ŮŮŮŮŮ_ŮŮŮŮŮ_ŘŁŘşŘłŘˇŘł_ŘłŘ¨ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŮŘ¨Řą_ŘŻŮŘłŮŘ¨Řą'.split('_'),
        weekdays : 'Ř§ŮŘŁŘ­ŘŻ_Ř§ŮŘĽŘŤŮŮŮ_Ř§ŮŘŤŮŘ§ŘŤŘ§ŘĄ_Ř§ŮŘŁŘąŘ¨ŘšŘ§ŘĄ_Ř§ŮŘŽŮŮŘł_Ř§ŮŘŹŮŘšŘŠ_Ř§ŮŘłŘ¨ŘŞ'.split('_'),
        weekdaysShort : 'ŘŁŘ­ŘŻ_ŘĽŘŤŮŮŮ_ŘŤŮŘ§ŘŤŘ§ŘĄ_ŘŁŘąŘ¨ŘšŘ§ŘĄ_ŘŽŮŮŘł_ŘŹŮŘšŘŠ_ŘłŘ¨ŘŞ'.split('_'),
        weekdaysMin : 'Ř­_Ů_ŘŤ_Řą_ŘŽ_ŘŹ_Řł'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /Řľ|Ů/,
        isPM : function (input) {
            return 'Ů' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'Řľ';
            } else {
                return 'Ů';
            }
        },
        calendar : {
            sameDay: '[Ř§ŮŮŮŮ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextDay: '[ŘşŘŻŘ§ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastDay: '[ŘŁŮŘł ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ŮŮ %s',
            past : 'ŮŮŘ° %s',
            s : 'ŘŤŮŘ§Ů',
            m : 'ŘŻŮŮŮŘŠ',
            mm : '%d ŘŻŮŘ§ŘŚŮ',
            h : 'ŘłŘ§ŘšŘŠ',
            hh : '%d ŘłŘ§ŘšŘ§ŘŞ',
            d : 'ŮŮŮ',
            dd : '%d ŘŁŮŘ§Ů',
            M : 'Ř´ŮŘą',
            MM : '%d ŘŁŘ´ŮŘą',
            y : 'ŘłŮŘŠ',
            yy : '%d ŘłŮŮŘ§ŘŞ'
        },
        preparse: function (string) {
            return string.replace(/[ŮĄŮ˘ŮŁŮ¤ŮĽŮŚŮ§Ů¨ŮŠŮ ]/g, function (match) {
                return ar_sa__numberMap[match];
            }).replace(/Ř/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ar_sa__symbolMap[match];
            }).replace(/,/g, 'Ř');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale  : Tunisian Arabic (ar-tn)

    var ar_tn = moment__default.defineLocale('ar-tn', {
        months: 'ŘŹŘ§ŮŮŮ_ŮŮŮŘąŮ_ŮŘ§ŘąŘł_ŘŁŮŘąŮŮ_ŮŘ§Ů_ŘŹŮŘ§Ů_ŘŹŮŮŮŮŘŠ_ŘŁŮŘŞ_ŘłŘ¨ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŮŘ¨Řą_ŘŻŮŘłŮŘ¨Řą'.split('_'),
        monthsShort: 'ŘŹŘ§ŮŮŮ_ŮŮŮŘąŮ_ŮŘ§ŘąŘł_ŘŁŮŘąŮŮ_ŮŘ§Ů_ŘŹŮŘ§Ů_ŘŹŮŮŮŮŘŠ_ŘŁŮŘŞ_ŘłŘ¨ŘŞŮŘ¨Řą_ŘŁŮŘŞŮŘ¨Řą_ŮŮŮŮŘ¨Řą_ŘŻŮŘłŮŘ¨Řą'.split('_'),
        weekdays: 'Ř§ŮŘŁŘ­ŘŻ_Ř§ŮŘĽŘŤŮŮŮ_Ř§ŮŘŤŮŘ§ŘŤŘ§ŘĄ_Ř§ŮŘŁŘąŘ¨ŘšŘ§ŘĄ_Ř§ŮŘŽŮŮŘł_Ř§ŮŘŹŮŘšŘŠ_Ř§ŮŘłŘ¨ŘŞ'.split('_'),
        weekdaysShort: 'ŘŁŘ­ŘŻ_ŘĽŘŤŮŮŮ_ŘŤŮŘ§ŘŤŘ§ŘĄ_ŘŁŘąŘ¨ŘšŘ§ŘĄ_ŘŽŮŮŘł_ŘŹŮŘšŘŠ_ŘłŘ¨ŘŞ'.split('_'),
        weekdaysMin: 'Ř­_Ů_ŘŤ_Řą_ŘŽ_ŘŹ_Řł'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[Ř§ŮŮŮŮ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextDay: '[ŘşŘŻŘ§ ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastDay: '[ŘŁŮŘł ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastWeek: 'dddd [ŘšŮŮ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'ŮŮ %s',
            past: 'ŮŮŘ° %s',
            s: 'ŘŤŮŘ§Ů',
            m: 'ŘŻŮŮŮŘŠ',
            mm: '%d ŘŻŮŘ§ŘŚŮ',
            h: 'ŘłŘ§ŘšŘŠ',
            hh: '%d ŘłŘ§ŘšŘ§ŘŞ',
            d: 'ŮŮŮ',
            dd: '%d ŘŁŮŘ§Ů',
            M: 'Ř´ŮŘą',
            MM: '%d ŘŁŘ´ŮŘą',
            y: 'ŘłŮŘŠ',
            yy: '%d ŘłŮŮŘ§ŘŞ'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! Locale: Arabic (ar)
    //! Author: Abdel Said: https://github.com/abdelsaid
    //! Changes in months, weekdays: Ahmed Elkhatib
    //! Native plural forms: forabi https://github.com/forabi

    var ar__symbolMap = {
        '1': 'ŮĄ',
        '2': 'Ů˘',
        '3': 'ŮŁ',
        '4': 'Ů¤',
        '5': 'ŮĽ',
        '6': 'ŮŚ',
        '7': 'Ů§',
        '8': 'Ů¨',
        '9': 'ŮŠ',
        '0': 'Ů '
    }, ar__numberMap = {
        'ŮĄ': '1',
        'Ů˘': '2',
        'ŮŁ': '3',
        'Ů¤': '4',
        'ŮĽ': '5',
        'ŮŚ': '6',
        'Ů§': '7',
        'Ů¨': '8',
        'ŮŠ': '9',
        'Ů ': '0'
    }, pluralForm = function (n) {
        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
    }, plurals = {
        s : ['ŘŁŮŮ ŮŮ ŘŤŘ§ŮŮŘŠ', 'ŘŤŘ§ŮŮŘŠ ŮŘ§Ř­ŘŻŘŠ', ['ŘŤŘ§ŮŮŘŞŘ§Ů', 'ŘŤŘ§ŮŮŘŞŮŮ'], '%d ŘŤŮŘ§Ů', '%d ŘŤŘ§ŮŮŘŠ', '%d ŘŤŘ§ŮŮŘŠ'],
        m : ['ŘŁŮŮ ŮŮ ŘŻŮŮŮŘŠ', 'ŘŻŮŮŮŘŠ ŮŘ§Ř­ŘŻŘŠ', ['ŘŻŮŮŮŘŞŘ§Ů', 'ŘŻŮŮŮŘŞŮŮ'], '%d ŘŻŮŘ§ŘŚŮ', '%d ŘŻŮŮŮŘŠ', '%d ŘŻŮŮŮŘŠ'],
        h : ['ŘŁŮŮ ŮŮ ŘłŘ§ŘšŘŠ', 'ŘłŘ§ŘšŘŠ ŮŘ§Ř­ŘŻŘŠ', ['ŘłŘ§ŘšŘŞŘ§Ů', 'ŘłŘ§ŘšŘŞŮŮ'], '%d ŘłŘ§ŘšŘ§ŘŞ', '%d ŘłŘ§ŘšŘŠ', '%d ŘłŘ§ŘšŘŠ'],
        d : ['ŘŁŮŮ ŮŮ ŮŮŮ', 'ŮŮŮ ŮŘ§Ř­ŘŻ', ['ŮŮŮŘ§Ů', 'ŮŮŮŮŮ'], '%d ŘŁŮŘ§Ů', '%d ŮŮŮŮŘ§', '%d ŮŮŮ'],
        M : ['ŘŁŮŮ ŮŮ Ř´ŮŘą', 'Ř´ŮŘą ŮŘ§Ř­ŘŻ', ['Ř´ŮŘąŘ§Ů', 'Ř´ŮŘąŮŮ'], '%d ŘŁŘ´ŮŘą', '%d Ř´ŮŘąŘ§', '%d Ř´ŮŘą'],
        y : ['ŘŁŮŮ ŮŮ ŘšŘ§Ů', 'ŘšŘ§Ů ŮŘ§Ř­ŘŻ', ['ŘšŘ§ŮŘ§Ů', 'ŘšŘ§ŮŮŮ'], '%d ŘŁŘšŮŘ§Ů', '%d ŘšŘ§ŮŮŘ§', '%d ŘšŘ§Ů']
    }, pluralize = function (u) {
        return function (number, withoutSuffix, string, isFuture) {
            var f = pluralForm(number),
                str = plurals[u][pluralForm(number)];
            if (f === 2) {
                str = str[withoutSuffix ? 0 : 1];
            }
            return str.replace(/%d/i, number);
        };
    }, ar__months = [
        'ŮŘ§ŮŮŮ Ř§ŮŘŤŘ§ŮŮ ŮŮŘ§ŮŘą',
        'Ř´Ř¨Ř§Řˇ ŮŘ¨ŘąŘ§ŮŘą',
        'Ř˘Ř°Ř§Řą ŮŘ§ŘąŘł',
        'ŮŮŘłŘ§Ů ŘŁŘ¨ŘąŮŮ',
        'ŘŁŮŘ§Řą ŮŘ§ŮŮ',
        'Ř­Ř˛ŮŘąŘ§Ů ŮŮŮŮŮ',
        'ŘŞŮŮŘ˛ ŮŮŮŮŮ',
        'Ř˘Ř¨ ŘŁŘşŘłŘˇŘł',
        'ŘŁŮŮŮŮ ŘłŘ¨ŘŞŮŘ¨Řą',
        'ŘŞŘ´ŘąŮŮ Ř§ŮŘŁŮŮ ŘŁŮŘŞŮŘ¨Řą',
        'ŘŞŘ´ŘąŮŮ Ř§ŮŘŤŘ§ŮŮ ŮŮŮŮŘ¨Řą',
        'ŮŘ§ŮŮŮ Ř§ŮŘŁŮŮ ŘŻŮŘłŮŘ¨Řą'
    ];

    var ar = moment__default.defineLocale('ar', {
        months : ar__months,
        monthsShort : ar__months,
        weekdays : 'Ř§ŮŘŁŘ­ŘŻ_Ř§ŮŘĽŘŤŮŮŮ_Ř§ŮŘŤŮŘ§ŘŤŘ§ŘĄ_Ř§ŮŘŁŘąŘ¨ŘšŘ§ŘĄ_Ř§ŮŘŽŮŮŘł_Ř§ŮŘŹŮŘšŘŠ_Ř§ŮŘłŘ¨ŘŞ'.split('_'),
        weekdaysShort : 'ŘŁŘ­ŘŻ_ŘĽŘŤŮŮŮ_ŘŤŮŘ§ŘŤŘ§ŘĄ_ŘŁŘąŘ¨ŘšŘ§ŘĄ_ŘŽŮŮŘł_ŘŹŮŘšŘŠ_ŘłŘ¨ŘŞ'.split('_'),
        weekdaysMin : 'Ř­_Ů_ŘŤ_Řą_ŘŽ_ŘŹ_Řł'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'D/\u200FM/\u200FYYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /Řľ|Ů/,
        isPM : function (input) {
            return 'Ů' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'Řľ';
            } else {
                return 'Ů';
            }
        },
        calendar : {
            sameDay: '[Ř§ŮŮŮŮ ŘšŮŘŻ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextDay: '[ŘşŘŻŮŘ§ ŘšŮŘŻ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            nextWeek: 'dddd [ŘšŮŘŻ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastDay: '[ŘŁŮŘł ŘšŮŘŻ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            lastWeek: 'dddd [ŘšŮŘŻ Ř§ŮŘłŘ§ŘšŘŠ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'Ř¨ŘšŘŻ %s',
            past : 'ŮŮŘ° %s',
            s : pluralize('s'),
            m : pluralize('m'),
            mm : pluralize('m'),
            h : pluralize('h'),
            hh : pluralize('h'),
            d : pluralize('d'),
            dd : pluralize('d'),
            M : pluralize('M'),
            MM : pluralize('M'),
            y : pluralize('y'),
            yy : pluralize('y')
        },
        preparse: function (string) {
            return string.replace(/\u200f/g, '').replace(/[ŮĄŮ˘ŮŁŮ¤ŮĽŮŚŮ§Ů¨ŮŠŮ ]/g, function (match) {
                return ar__numberMap[match];
            }).replace(/Ř/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ar__symbolMap[match];
            }).replace(/,/g, 'Ř');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : azerbaijani (az)
    //! author : topchiyev : https://github.com/topchiyev

    var az__suffixes = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',
        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',
        3: '-ĂźncĂź',
        4: '-ĂźncĂź',
        100: '-ĂźncĂź',
        6: '-ncÄą',
        9: '-uncu',
        10: '-uncu',
        30: '-uncu',
        60: '-ÄąncÄą',
        90: '-ÄąncÄą'
    };

    var az = moment__default.defineLocale('az', {
        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays : 'Bazar_Bazar ertÉsi_ĂÉrĹÉnbÉ axĹamÄą_ĂÉrĹÉnbÉ_CĂźmÉ axĹamÄą_CĂźmÉ_ĹÉnbÉ'.split('_'),
        weekdaysShort : 'Baz_BzE_ĂAx_ĂÉr_CAx_CĂźm_ĹÉn'.split('_'),
        weekdaysMin : 'Bz_BE_ĂA_ĂÉ_CA_CĂź_ĹÉ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[bugĂźn saat] LT',
            nextDay : '[sabah saat] LT',
            nextWeek : '[gÉlÉn hÉftÉ] dddd [saat] LT',
            lastDay : '[dĂźnÉn] LT',
            lastWeek : '[keĂ§Én hÉftÉ] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s ÉvvÉl',
            s : 'birneĂ§É saniyyÉ',
            m : 'bir dÉqiqÉ',
            mm : '%d dÉqiqÉ',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gĂźn',
            dd : '%d gĂźn',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir il',
            yy : '%d il'
        },
        meridiemParse: /gecÉ|sÉhÉr|gĂźndĂźz|axĹam/,
        isPM : function (input) {
            return /^(gĂźndĂźz|axĹam)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gecÉ';
            } else if (hour < 12) {
                return 'sÉhÉr';
            } else if (hour < 17) {
                return 'gĂźndĂźz';
            } else {
                return 'axĹam';
            }
        },
        ordinalParse: /\d{1,2}-(ÄąncÄą|inci|nci|ĂźncĂź|ncÄą|uncu)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '-ÄąncÄą';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;
            return number + (az__suffixes[a] || az__suffixes[b] || az__suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : belarusian (be)
    //! author : Dmitry Demidov : https://github.com/demidov91
    //! author: Praleska: http://praleska.pro/
    //! Author : Menelion ElensĂşle : https://github.com/Oire

    function be__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function be__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'ŃĐ˛ŃĐťŃĐ˝Đ°_ŃĐ˛ŃĐťŃĐ˝Ń_ŃĐ˛ŃĐťŃĐ˝' : 'ŃĐ˛ŃĐťŃĐ˝Ń_ŃĐ˛ŃĐťŃĐ˝Ń_ŃĐ˛ŃĐťŃĐ˝',
            'hh': withoutSuffix ? 'ĐłĐ°Đ´ĐˇŃĐ˝Đ°_ĐłĐ°Đ´ĐˇŃĐ˝Ń_ĐłĐ°Đ´ĐˇŃĐ˝' : 'ĐłĐ°Đ´ĐˇŃĐ˝Ń_ĐłĐ°Đ´ĐˇŃĐ˝Ń_ĐłĐ°Đ´ĐˇŃĐ˝',
            'dd': 'Đ´ĐˇĐľĐ˝Ń_Đ´Đ˝Ń_Đ´ĐˇŃĐ˝',
            'MM': 'ĐźĐľŃŃŃ_ĐźĐľŃŃŃŃ_ĐźĐľŃŃŃĐ°Ń',
            'yy': 'ĐłĐžĐ´_ĐłĐ°Đ´Ń_ĐłĐ°Đ´ĐžŃ'
        };
        if (key === 'm') {
            return withoutSuffix ? 'ŃĐ˛ŃĐťŃĐ˝Đ°' : 'ŃĐ˛ŃĐťŃĐ˝Ń';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'ĐłĐ°Đ´ĐˇŃĐ˝Đ°' : 'ĐłĐ°Đ´ĐˇŃĐ˝Ń';
        }
        else {
            return number + ' ' + be__plural(format[key], +number);
        }
    }

    var be = moment__default.defineLocale('be', {
        months : {
            format: 'ŃŃŃĐ´ĐˇĐľĐ˝Ń_ĐťŃŃĐ°ĐłĐ°_ŃĐ°ĐşĐ°Đ˛ŃĐşĐ°_ĐşŃĐ°ŃĐ°Đ˛ŃĐşĐ°_ŃŃĐ°ŃĐ˝Ń_ŃŃŃĐ˛ĐľĐ˝Ń_ĐťŃĐżĐľĐ˝Ń_ĐśĐ˝ŃŃĐ˝Ń_Đ˛ĐľŃĐ°ŃĐ˝Ń_ĐşĐ°ŃŃŃŃŃĐ˝ŃĐşĐ°_ĐťŃŃŃĐ°ĐżĐ°Đ´Đ°_ŃĐ˝ĐľĐśĐ˝Ń'.split('_'),
            standalone: 'ŃŃŃĐ´ĐˇĐľĐ˝Ń_ĐťŃŃŃ_ŃĐ°ĐşĐ°Đ˛ŃĐş_ĐşŃĐ°ŃĐ°Đ˛ŃĐş_ŃŃĐ°Đ˛ĐľĐ˝Ń_ŃŃŃĐ˛ĐľĐ˝Ń_ĐťŃĐżĐľĐ˝Ń_ĐśĐ˝ŃĐ˛ĐľĐ˝Ń_Đ˛ĐľŃĐ°ŃĐľĐ˝Ń_ĐşĐ°ŃŃŃŃŃĐ˝ŃĐş_ĐťŃŃŃĐ°ĐżĐ°Đ´_ŃĐ˝ĐľĐśĐ°Đ˝Ń'.split('_')
        },
        monthsShort : 'ŃŃŃĐ´_ĐťŃŃ_ŃĐ°Đş_ĐşŃĐ°Ń_ŃŃĐ°Đ˛_ŃŃŃĐ˛_ĐťŃĐż_ĐśĐ˝ŃĐ˛_Đ˛ĐľŃ_ĐşĐ°ŃŃ_ĐťŃŃŃ_ŃĐ˝ĐľĐś'.split('_'),
        weekdays : {
            format: 'Đ˝ŃĐ´ĐˇĐľĐťŃ_ĐżĐ°Đ˝ŃĐ´ĐˇĐľĐťĐ°Đş_Đ°ŃŃĐžŃĐ°Đş_ŃĐľŃĐ°Đ´Ń_ŃĐ°ŃĐ˛ĐľŃ_ĐżŃŃĐ˝ŃŃŃ_ŃŃĐąĐžŃŃ'.split('_'),
            standalone: 'Đ˝ŃĐ´ĐˇĐľĐťŃ_ĐżĐ°Đ˝ŃĐ´ĐˇĐľĐťĐ°Đş_Đ°ŃŃĐžŃĐ°Đş_ŃĐľŃĐ°Đ´Đ°_ŃĐ°ŃĐ˛ĐľŃ_ĐżŃŃĐ˝ŃŃĐ°_ŃŃĐąĐžŃĐ°'.split('_'),
            isFormat: /\[ ?[ĐĐ˛] ?(?:ĐźŃĐ˝ŃĐťŃŃ|Đ˝Đ°ŃŃŃĐżĐ˝ŃŃ)? ?\] ?dddd/
        },
        weekdaysShort : 'Đ˝Đ´_ĐżĐ˝_Đ°Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        weekdaysMin : 'Đ˝Đ´_ĐżĐ˝_Đ°Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Đł.',
            LLL : 'D MMMM YYYY Đł., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Đł., HH:mm'
        },
        calendar : {
            sameDay: '[ĐĄŃĐ˝Đ˝Ń Ń] LT',
            nextDay: '[ĐĐ°ŃŃŃĐ° Ń] LT',
            lastDay: '[ĐŁŃĐžŃĐ° Ń] LT',
            nextWeek: function () {
                return '[ĐŁ] dddd [Ń] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return '[ĐŁ ĐźŃĐ˝ŃĐťŃŃ] dddd [Ń] LT';
                case 1:
                case 2:
                case 4:
                    return '[ĐŁ ĐźŃĐ˝ŃĐťŃ] dddd [Ń] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ĐżŃĐ°Đˇ %s',
            past : '%s ŃĐ°ĐźŃ',
            s : 'Đ˝ĐľĐşĐ°ĐťŃĐşŃ ŃĐľĐşŃĐ˝Đ´',
            m : be__relativeTimeWithPlural,
            mm : be__relativeTimeWithPlural,
            h : be__relativeTimeWithPlural,
            hh : be__relativeTimeWithPlural,
            d : 'Đ´ĐˇĐľĐ˝Ń',
            dd : be__relativeTimeWithPlural,
            M : 'ĐźĐľŃŃŃ',
            MM : be__relativeTimeWithPlural,
            y : 'ĐłĐžĐ´',
            yy : be__relativeTimeWithPlural
        },
        meridiemParse: /Đ˝ĐžŃŃ|ŃĐ°Đ˝ŃŃŃ|Đ´Đ˝Ń|Đ˛ĐľŃĐ°ŃĐ°/,
        isPM : function (input) {
            return /^(Đ´Đ˝Ń|Đ˛ĐľŃĐ°ŃĐ°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Đ˝ĐžŃŃ';
            } else if (hour < 12) {
                return 'ŃĐ°Đ˝ŃŃŃ';
            } else if (hour < 17) {
                return 'Đ´Đ˝Ń';
            } else {
                return 'Đ˛ĐľŃĐ°ŃĐ°';
            }
        },
        ordinalParse: /\d{1,2}-(Ń|Ń|ĐłĐ°)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-Ń' : number + '-Ń';
            case 'D':
                return number + '-ĐłĐ°';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : bulgarian (bg)
    //! author : Krasen Borisov : https://github.com/kraz

    var bg = moment__default.defineLocale('bg', {
        months : 'ŃĐ˝ŃĐ°ŃĐ¸_ŃĐľĐ˛ŃŃĐ°ŃĐ¸_ĐźĐ°ŃŃ_Đ°ĐżŃĐ¸Đť_ĐźĐ°Đš_ŃĐ˝Đ¸_ŃĐťĐ¸_Đ°Đ˛ĐłŃŃŃ_ŃĐľĐżŃĐľĐźĐ˛ŃĐ¸_ĐžĐşŃĐžĐźĐ˛ŃĐ¸_Đ˝ĐžĐľĐźĐ˛ŃĐ¸_Đ´ĐľĐşĐľĐźĐ˛ŃĐ¸'.split('_'),
        monthsShort : 'ŃĐ˝Ń_ŃĐľĐ˛_ĐźĐ°Ń_Đ°ĐżŃ_ĐźĐ°Đš_ŃĐ˝Đ¸_ŃĐťĐ¸_Đ°Đ˛Đł_ŃĐľĐż_ĐžĐşŃ_Đ˝ĐžĐľ_Đ´ĐľĐş'.split('_'),
        weekdays : 'Đ˝ĐľĐ´ĐľĐťŃ_ĐżĐžĐ˝ĐľĐ´ĐľĐťĐ˝Đ¸Đş_Đ˛ŃĐžŃĐ˝Đ¸Đş_ŃŃŃĐ´Đ°_ŃĐľŃĐ˛ŃŃŃŃĐş_ĐżĐľŃŃĐş_ŃŃĐąĐžŃĐ°'.split('_'),
        weekdaysShort : 'Đ˝ĐľĐ´_ĐżĐžĐ˝_Đ˛ŃĐž_ŃŃŃ_ŃĐľŃ_ĐżĐľŃ_ŃŃĐą'.split('_'),
        weekdaysMin : 'Đ˝Đ´_ĐżĐ˝_Đ˛Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : '[ĐĐ˝ĐľŃ Đ˛] LT',
            nextDay : '[ĐŁŃŃĐľ Đ˛] LT',
            nextWeek : 'dddd [Đ˛] LT',
            lastDay : '[ĐŃĐľŃĐ° Đ˛] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[Đ Đ¸ĐˇĐźĐ¸Đ˝Đ°ĐťĐ°ŃĐ°] dddd [Đ˛] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Đ Đ¸ĐˇĐźĐ¸Đ˝Đ°ĐťĐ¸Ń] dddd [Đ˛] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ŃĐťĐľĐ´ %s',
            past : 'ĐżŃĐľĐ´Đ¸ %s',
            s : 'Đ˝ŃĐşĐžĐťĐşĐž ŃĐľĐşŃĐ˝Đ´Đ¸',
            m : 'ĐźĐ¸Đ˝ŃŃĐ°',
            mm : '%d ĐźĐ¸Đ˝ŃŃĐ¸',
            h : 'ŃĐ°Ń',
            hh : '%d ŃĐ°ŃĐ°',
            d : 'Đ´ĐľĐ˝',
            dd : '%d Đ´Đ˝Đ¸',
            M : 'ĐźĐľŃĐľŃ',
            MM : '%d ĐźĐľŃĐľŃĐ°',
            y : 'ĐłĐžĐ´Đ¸Đ˝Đ°',
            yy : '%d ĐłĐžĐ´Đ¸Đ˝Đ¸'
        },
        ordinalParse: /\d{1,2}-(ĐľĐ˛|ĐľĐ˝|ŃĐ¸|Đ˛Đ¸|ŃĐ¸|ĐźĐ¸)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ĐľĐ˛';
            } else if (last2Digits === 0) {
                return number + '-ĐľĐ˝';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-ŃĐ¸';
            } else if (lastDigit === 1) {
                return number + '-Đ˛Đ¸';
            } else if (lastDigit === 2) {
                return number + '-ŃĐ¸';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-ĐźĐ¸';
            } else {
                return number + '-ŃĐ¸';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bengali (bn)
    //! author : Kaushik Gandhi : https://github.com/kaushikgandhi

    var bn__symbolMap = {
        '1': 'ŕ§§',
        '2': 'ŕ§¨',
        '3': 'ŕ§Š',
        '4': 'ŕ§Ş',
        '5': 'ŕ§Ť',
        '6': 'ŕ§Ź',
        '7': 'ŕ§­',
        '8': 'ŕ§Ž',
        '9': 'ŕ§Ż',
        '0': 'ŕ§Ś'
    },
    bn__numberMap = {
        'ŕ§§': '1',
        'ŕ§¨': '2',
        'ŕ§Š': '3',
        'ŕ§Ş': '4',
        'ŕ§Ť': '5',
        'ŕ§Ź': '6',
        'ŕ§­': '7',
        'ŕ§Ž': '8',
        'ŕ§Ż': '9',
        'ŕ§Ś': '0'
    };

    var bn = moment__default.defineLocale('bn', {
        months : 'ŕŚŕŚžŕŚ¨ŕ§ŕ§ŕŚžŕŚ°ŕ§_ŕŚŤŕ§ŕŚŹŕ§ŕ§ŕŚžŕŚ°ŕ§_ŕŚŽŕŚžŕŚ°ŕ§ŕŚ_ŕŚŕŚŞŕ§ŕŚ°ŕŚżŕŚ˛_ŕŚŽŕ§_ŕŚŕ§ŕŚ¨_ŕŚŕ§ŕŚ˛ŕŚžŕŚ_ŕŚŕŚŕŚžŕŚ¸ŕ§ŕŚ_ŕŚ¸ŕ§ŕŚŞŕ§ŕŚŕ§ŕŚŽŕ§ŕŚŹŕŚ°_ŕŚŕŚŕ§ŕŚŕ§ŕŚŹŕŚ°_ŕŚ¨ŕŚ­ŕ§ŕŚŽŕ§ŕŚŹŕŚ°_ŕŚĄŕŚżŕŚ¸ŕ§ŕŚŽŕ§ŕŚŹŕŚ°'.split('_'),
        monthsShort : 'ŕŚŕŚžŕŚ¨ŕ§_ŕŚŤŕ§ŕŚŹ_ŕŚŽŕŚžŕŚ°ŕ§ŕŚ_ŕŚŕŚŞŕŚ°_ŕŚŽŕ§_ŕŚŕ§ŕŚ¨_ŕŚŕ§ŕŚ˛_ŕŚŕŚ_ŕŚ¸ŕ§ŕŚŞŕ§ŕŚ_ŕŚŕŚŕ§ŕŚŕ§_ŕŚ¨ŕŚ­_ŕŚĄŕŚżŕŚ¸ŕ§ŕŚŽŕ§'.split('_'),
        weekdays : 'ŕŚ°ŕŚŹŕŚżŕŚŹŕŚžŕŚ°_ŕŚ¸ŕ§ŕŚŽŕŚŹŕŚžŕŚ°_ŕŚŽŕŚŕ§ŕŚŕŚ˛ŕŚŹŕŚžŕŚ°_ŕŚŹŕ§ŕŚ§ŕŚŹŕŚžŕŚ°_ŕŚŹŕ§ŕŚšŕŚ¸ŕ§ŕŚŞŕŚ¤ŕ§ŕŚ¤ŕŚżŕŚŹŕŚžŕŚ°_ŕŚśŕ§ŕŚŕ§ŕŚ°ŕŚŹŕŚžŕŚ°_ŕŚśŕŚ¨ŕŚżŕŚŹŕŚžŕŚ°'.split('_'),
        weekdaysShort : 'ŕŚ°ŕŚŹŕŚż_ŕŚ¸ŕ§ŕŚŽ_ŕŚŽŕŚŕ§ŕŚŕŚ˛_ŕŚŹŕ§ŕŚ§_ŕŚŹŕ§ŕŚšŕŚ¸ŕ§ŕŚŞŕŚ¤ŕ§ŕŚ¤ŕŚż_ŕŚśŕ§ŕŚŕ§ŕŚ°_ŕŚśŕŚ¨ŕŚż'.split('_'),
        weekdaysMin : 'ŕŚ°ŕŚŹ_ŕŚ¸ŕŚŽ_ŕŚŽŕŚŕ§ŕŚ_ŕŚŹŕ§_ŕŚŹŕ§ŕŚ°ŕŚżŕŚš_ŕŚśŕ§_ŕŚśŕŚ¨ŕŚż'.split('_'),
        longDateFormat : {
            LT : 'A h:mm ŕŚ¸ŕŚŽŕ§',
            LTS : 'A h:mm:ss ŕŚ¸ŕŚŽŕ§',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm ŕŚ¸ŕŚŽŕ§',
            LLLL : 'dddd, D MMMM YYYY, A h:mm ŕŚ¸ŕŚŽŕ§'
        },
        calendar : {
            sameDay : '[ŕŚŕŚ] LT',
            nextDay : '[ŕŚŕŚŕŚžŕŚŽŕ§ŕŚŕŚžŕŚ˛] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕŚŕŚ¤ŕŚŕŚžŕŚ˛] LT',
            lastWeek : '[ŕŚŕŚ¤] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕŚŞŕŚ°ŕ§',
            past : '%s ŕŚŕŚŕ§',
            s : 'ŕŚŕ§ŕ§ŕŚ ŕŚ¸ŕ§ŕŚŕ§ŕŚ¨ŕ§ŕŚĄ',
            m : 'ŕŚŕŚ ŕŚŽŕŚżŕŚ¨ŕŚżŕŚ',
            mm : '%d ŕŚŽŕŚżŕŚ¨ŕŚżŕŚ',
            h : 'ŕŚŕŚ ŕŚŕŚ¨ŕ§ŕŚŕŚž',
            hh : '%d ŕŚŕŚ¨ŕ§ŕŚŕŚž',
            d : 'ŕŚŕŚ ŕŚŚŕŚżŕŚ¨',
            dd : '%d ŕŚŚŕŚżŕŚ¨',
            M : 'ŕŚŕŚ ŕŚŽŕŚžŕŚ¸',
            MM : '%d ŕŚŽŕŚžŕŚ¸',
            y : 'ŕŚŕŚ ŕŚŹŕŚŕŚ°',
            yy : '%d ŕŚŹŕŚŕŚ°'
        },
        preparse: function (string) {
            return string.replace(/[ŕ§§ŕ§¨ŕ§Šŕ§Şŕ§Ťŕ§Źŕ§­ŕ§Žŕ§Żŕ§Ś]/g, function (match) {
                return bn__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return bn__symbolMap[match];
            });
        },
        meridiemParse: /ŕŚ°ŕŚžŕŚ¤|ŕŚ¸ŕŚŕŚžŕŚ˛|ŕŚŚŕ§ŕŚŞŕ§ŕŚ°|ŕŚŹŕŚżŕŚŕŚžŕŚ˛|ŕŚ°ŕŚžŕŚ¤/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if ((meridiem === 'ŕŚ°ŕŚžŕŚ¤' && hour >= 4) ||
                    (meridiem === 'ŕŚŚŕ§ŕŚŞŕ§ŕŚ°' && hour < 5) ||
                    meridiem === 'ŕŚŹŕŚżŕŚŕŚžŕŚ˛') {
                return hour + 12;
            } else {
                return hour;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕŚ°ŕŚžŕŚ¤';
            } else if (hour < 10) {
                return 'ŕŚ¸ŕŚŕŚžŕŚ˛';
            } else if (hour < 17) {
                return 'ŕŚŚŕ§ŕŚŞŕ§ŕŚ°';
            } else if (hour < 20) {
                return 'ŕŚŹŕŚżŕŚŕŚžŕŚ˛';
            } else {
                return 'ŕŚ°ŕŚžŕŚ¤';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : tibetan (bo)
    //! author : Thupten N. Chakrishar : https://github.com/vajradog

    var bo__symbolMap = {
        '1': 'ŕźĄ',
        '2': 'ŕź˘',
        '3': 'ŕźŁ',
        '4': 'ŕź¤',
        '5': 'ŕźĽ',
        '6': 'ŕźŚ',
        '7': 'ŕź§',
        '8': 'ŕź¨',
        '9': 'ŕźŠ',
        '0': 'ŕź '
    },
    bo__numberMap = {
        'ŕźĄ': '1',
        'ŕź˘': '2',
        'ŕźŁ': '3',
        'ŕź¤': '4',
        'ŕźĽ': '5',
        'ŕźŚ': '6',
        'ŕź§': '7',
        'ŕź¨': '8',
        'ŕźŠ': '9',
        'ŕź ': '0'
    };

    var bo = moment__default.defineLocale('bo', {
        months : 'ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕźŕ˝ŕ˝ź_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝Śŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝Śŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝Łŕžŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕž˛ŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝˘ŕžŕžąŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝ŕ˝ŕ˝˛ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝ŕ˝ŕ˝˛ŕ˝Śŕźŕ˝'.split('_'),
        monthsShort : 'ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕźŕ˝ŕ˝ź_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝Śŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝Śŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝Łŕžŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕž˛ŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝˘ŕžŕžąŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝ŕ˝ŕ˝˛ŕ˝ŕźŕ˝_ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝´ŕźŕ˝ŕ˝ŕ˝˛ŕ˝Śŕźŕ˝'.split('_'),
        weekdays : 'ŕ˝ŕ˝ŕ˝ ŕźŕ˝ŕ˝˛ŕźŕ˝ŕź_ŕ˝ŕ˝ŕ˝ ŕźŕ˝ŕžłŕźŕ˝ŕź_ŕ˝ŕ˝ŕ˝ ŕźŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝ŕ˝˘ŕź_ŕ˝ŕ˝ŕ˝ ŕźŕ˝Łŕžˇŕ˝ŕźŕ˝ŕź_ŕ˝ŕ˝ŕ˝ ŕźŕ˝ŕ˝´ŕ˝˘ŕźŕ˝ŕ˝´_ŕ˝ŕ˝ŕ˝ ŕźŕ˝ŕźŕ˝Śŕ˝ŕ˝Śŕź_ŕ˝ŕ˝ŕ˝ ŕźŕ˝Śŕž¤ŕ˝şŕ˝ŕźŕ˝ŕź'.split('_'),
        weekdaysShort : 'ŕ˝ŕ˝˛ŕźŕ˝ŕź_ŕ˝ŕžłŕźŕ˝ŕź_ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝ŕ˝˘ŕź_ŕ˝Łŕžˇŕ˝ŕźŕ˝ŕź_ŕ˝ŕ˝´ŕ˝˘ŕźŕ˝ŕ˝´_ŕ˝ŕźŕ˝Śŕ˝ŕ˝Śŕź_ŕ˝Śŕž¤ŕ˝şŕ˝ŕźŕ˝ŕź'.split('_'),
        weekdaysMin : 'ŕ˝ŕ˝˛ŕźŕ˝ŕź_ŕ˝ŕžłŕźŕ˝ŕź_ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝ŕ˝˘ŕź_ŕ˝Łŕžˇŕ˝ŕźŕ˝ŕź_ŕ˝ŕ˝´ŕ˝˘ŕźŕ˝ŕ˝´_ŕ˝ŕźŕ˝Śŕ˝ŕ˝Śŕź_ŕ˝Śŕž¤ŕ˝şŕ˝ŕźŕ˝ŕź'.split('_'),
        longDateFormat : {
            LT : 'A h:mm',
            LTS : 'A h:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm',
            LLLL : 'dddd, D MMMM YYYY, A h:mm'
        },
        calendar : {
            sameDay : '[ŕ˝ŕ˝˛ŕźŕ˝˘ŕ˝˛ŕ˝] LT',
            nextDay : '[ŕ˝Śŕ˝ŕźŕ˝ŕ˝˛ŕ˝] LT',
            nextWeek : '[ŕ˝ŕ˝ŕ˝´ŕ˝ŕźŕ˝ŕž˛ŕ˝ŕźŕ˝˘ŕžŕ˝şŕ˝Śŕźŕ˝], LT',
            lastDay : '[ŕ˝ŕźŕ˝Śŕ˝] LT',
            lastWeek : '[ŕ˝ŕ˝ŕ˝´ŕ˝ŕźŕ˝ŕž˛ŕ˝ŕźŕ˝ŕ˝ŕ˝ ŕźŕ˝] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕ˝Łŕź',
            past : '%s ŕ˝Śŕžŕ˝ŕźŕ˝Ł',
            s : 'ŕ˝Łŕ˝ŕźŕ˝Śŕ˝',
            m : 'ŕ˝Śŕžŕ˝˘ŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝',
            mm : '%d ŕ˝Śŕžŕ˝˘ŕźŕ˝',
            h : 'ŕ˝ŕ˝´ŕźŕ˝ŕ˝źŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝',
            hh : '%d ŕ˝ŕ˝´ŕźŕ˝ŕ˝źŕ˝',
            d : 'ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝',
            dd : '%d ŕ˝ŕ˝˛ŕ˝ŕź',
            M : 'ŕ˝ŕžłŕźŕ˝ŕźŕ˝ŕ˝ŕ˝˛ŕ˝',
            MM : '%d ŕ˝ŕžłŕźŕ˝',
            y : 'ŕ˝Łŕ˝źŕźŕ˝ŕ˝ŕ˝˛ŕ˝',
            yy : '%d ŕ˝Łŕ˝ź'
        },
        preparse: function (string) {
            return string.replace(/[ŕźĄŕź˘ŕźŁŕź¤ŕźĽŕźŚŕź§ŕź¨ŕźŠŕź ]/g, function (match) {
                return bo__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return bo__symbolMap[match];
            });
        },
        meridiemParse: /ŕ˝ŕ˝ŕ˝ŕźŕ˝ŕ˝ź|ŕ˝ŕ˝źŕ˝ŕ˝Śŕźŕ˝ŕ˝Ś|ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝´ŕ˝|ŕ˝ŕ˝ŕ˝źŕ˝ŕźŕ˝ŕ˝|ŕ˝ŕ˝ŕ˝ŕźŕ˝ŕ˝ź/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if ((meridiem === 'ŕ˝ŕ˝ŕ˝ŕźŕ˝ŕ˝ź' && hour >= 4) ||
                    (meridiem === 'ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝´ŕ˝' && hour < 5) ||
                    meridiem === 'ŕ˝ŕ˝ŕ˝źŕ˝ŕźŕ˝ŕ˝') {
                return hour + 12;
            } else {
                return hour;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ˝ŕ˝ŕ˝ŕźŕ˝ŕ˝ź';
            } else if (hour < 10) {
                return 'ŕ˝ŕ˝źŕ˝ŕ˝Śŕźŕ˝ŕ˝Ś';
            } else if (hour < 17) {
                return 'ŕ˝ŕ˝˛ŕ˝ŕźŕ˝ŕ˝´ŕ˝';
            } else if (hour < 20) {
                return 'ŕ˝ŕ˝ŕ˝źŕ˝ŕźŕ˝ŕ˝';
            } else {
                return 'ŕ˝ŕ˝ŕ˝ŕźŕ˝ŕ˝ź';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : breton (br)
    //! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
            'mm': 'munutenn',
            'MM': 'miz',
            'dd': 'devezh'
        };
        return number + ' ' + mutation(format[key], number);
    }
    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }
    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }
    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }
    function softMutation(text) {
        var mutationTable = {
            'm': 'v',
            'b': 'v',
            'd': 'z'
        };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }

    var br = moment__default.defineLocale('br', {
        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
        longDateFormat : {
            LT : 'h[e]mm A',
            LTS : 'h[e]mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D [a viz] MMMM YYYY',
            LLL : 'D [a viz] MMMM YYYY h[e]mm A',
            LLLL : 'dddd, D [a viz] MMMM YYYY h[e]mm A'
        },
        calendar : {
            sameDay : '[Hiziv da] LT',
            nextDay : '[Warc\'hoazh da] LT',
            nextWeek : 'dddd [da] LT',
            lastDay : '[Dec\'h da] LT',
            lastWeek : 'dddd [paset da] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'a-benn %s',
            past : '%s \'zo',
            s : 'un nebeud segondennoĂš',
            m : 'ur vunutenn',
            mm : relativeTimeWithMutation,
            h : 'un eur',
            hh : '%d eur',
            d : 'un devezh',
            dd : relativeTimeWithMutation,
            M : 'ur miz',
            MM : relativeTimeWithMutation,
            y : 'ur bloaz',
            yy : specialMutationForYears
        },
        ordinalParse: /\d{1,2}(aĂą|vet)/,
        ordinal : function (number) {
            var output = (number === 1) ? 'aĂą' : 'vet';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : bosnian (bs)
    //! author : Nedim Cholich : https://github.com/frontyard
    //! based on (hr) translation by Bojan MarkoviÄ

    function bs__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    var bs = moment__default.defineLocale('bs', {
        months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',
            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[proĹĄlu] dddd [u] LT';
                case 6:
                    return '[proĹĄle] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[proĹĄli] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : bs__translate,
            mm     : bs__translate,
            h      : bs__translate,
            hh     : bs__translate,
            d      : 'dan',
            dd     : bs__translate,
            M      : 'mjesec',
            MM     : bs__translate,
            y      : 'godinu',
            yy     : bs__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : catalan (ca)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado

    var ca = moment__default.defineLocale('ca', {
        months : 'gener_febrer_marĂ§_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextDay : function () {
                return '[demĂ  a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastDay : function () {
                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'fa %s',
            s : 'uns segons',
            m : 'un minut',
            mm : '%d minuts',
            h : 'una hora',
            hh : '%d hores',
            d : 'un dia',
            dd : '%d dies',
            M : 'un mes',
            MM : '%d mesos',
            y : 'un any',
            yy : '%d anys'
        },
        ordinalParse: /\d{1,2}(r|n|t|Ă¨|a)/,
        ordinal : function (number, period) {
            var output = (number === 1) ? 'r' :
                (number === 2) ? 'n' :
                (number === 3) ? 'r' :
                (number === 4) ? 't' : 'Ă¨';
            if (period === 'w' || period === 'W') {
                output = 'a';
            }
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : czech (cs)
    //! author : petrbela : https://github.com/petrbela

    var cs__months = 'leden_Ăşnor_bĹezen_duben_kvÄten_Äerven_Äervenec_srpen_zĂĄĹĂ­_ĹĂ­jen_listopad_prosinec'.split('_'),
        cs__monthsShort = 'led_Ăşno_bĹe_dub_kvÄ_Ävn_Ävc_srp_zĂĄĹ_ĹĂ­j_lis_pro'.split('_');
    function cs__plural(n) {
        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
    }
    function cs__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pĂĄr sekund' : 'pĂĄr sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'dny' : 'dnĂ­');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mÄsĂ­c' : 'mÄsĂ­cem';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'mÄsĂ­ce' : 'mÄsĂ­cĹŻ');
            } else {
                return result + 'mÄsĂ­ci';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }

    var cs = moment__default.defineLocale('cs', {
        months : cs__months,
        monthsShort : cs__monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (Äervenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(cs__months, cs__monthsShort)),
        shortMonthsParse : (function (monthsShort) {
            var i, _shortMonthsParse = [];
            for (i = 0; i < 12; i++) {
                _shortMonthsParse[i] = new RegExp('^' + monthsShort[i] + '$', 'i');
            }
            return _shortMonthsParse;
        }(cs__monthsShort)),
        longMonthsParse : (function (months) {
            var i, _longMonthsParse = [];
            for (i = 0; i < 12; i++) {
                _longMonthsParse[i] = new RegExp('^' + months[i] + '$', 'i');
            }
            return _longMonthsParse;
        }(cs__months)),
        weekdays : 'nedÄle_pondÄlĂ­_ĂşterĂ˝_stĹeda_Ätvrtek_pĂĄtek_sobota'.split('_'),
        weekdaysShort : 'ne_po_Ăşt_st_Ät_pĂĄ_so'.split('_'),
        weekdaysMin : 'ne_po_Ăşt_st_Ät_pĂĄ_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[dnes v] LT',
            nextDay: '[zĂ­tra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nedÄli v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve stĹedu v] LT';
                case 4:
                    return '[ve Ätvrtek v] LT';
                case 5:
                    return '[v pĂĄtek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[vÄera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou nedÄli v] LT';
                case 1:
                case 2:
                    return '[minulĂŠ] dddd [v] LT';
                case 3:
                    return '[minulou stĹedu v] LT';
                case 4:
                case 5:
                    return '[minulĂ˝] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pĹed %s',
            s : cs__translate,
            m : cs__translate,
            mm : cs__translate,
            h : cs__translate,
            hh : cs__translate,
            d : cs__translate,
            dd : cs__translate,
            M : cs__translate,
            MM : cs__translate,
            y : cs__translate,
            yy : cs__translate
        },
        ordinalParse : /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : chuvash (cv)
    //! author : Anatoly Mironov : https://github.com/mirontoli

    var cv = moment__default.defineLocale('cv', {
        months : 'ĐşÓŃĐťĐ°Ń_Đ˝Đ°ŃÓŃ_ĐżŃŃ_Đ°ĐşĐ°_ĐźĐ°Đš_ŇŤÓŃŃĐźĐľ_ŃŃÓ_ŇŤŃŃĐťĐ°_Đ°Đ˛ÓĐ˝_ŃĐżĐ°_ŃÓłĐş_ŃĐ°ŃŃĐ°Đ˛'.split('_'),
        monthsShort : 'ĐşÓŃ_Đ˝Đ°Ń_ĐżŃŃ_Đ°ĐşĐ°_ĐźĐ°Đš_ŇŤÓŃ_ŃŃÓ_ŇŤŃŃ_Đ°Đ˛Đ˝_ŃĐżĐ°_ŃÓłĐş_ŃĐ°Ń'.split('_'),
        weekdays : 'Đ˛ŃŃŃĐ°ŃĐ˝Đ¸ĐşŃĐ˝_ŃŃĐ˝ŃĐ¸ĐşŃĐ˝_ŃŃĐťĐ°ŃĐ¸ĐşŃĐ˝_ŃĐ˝ĐşŃĐ˝_ĐşÓŇŤĐ˝ĐľŃĐ˝Đ¸ĐşŃĐ˝_ŃŃĐ˝ĐľĐşŃĐ˝_ŃÓĐźĐ°ŃĐşŃĐ˝'.split('_'),
        weekdaysShort : 'Đ˛ŃŃ_ŃŃĐ˝_ŃŃĐť_ŃĐ˝_ĐşÓŇŤ_ŃŃĐ˝_ŃÓĐź'.split('_'),
        weekdaysMin : 'Đ˛Ń_ŃĐ˝_ŃŃ_ŃĐ˝_ĐşŇŤ_ŃŃ_ŃĐź'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'YYYY [ŇŤŃĐťŃĐ¸] MMMM [ŃĐšÓŃÓĐ˝] D[-ĐźÓŃÓ]',
            LLL : 'YYYY [ŇŤŃĐťŃĐ¸] MMMM [ŃĐšÓŃÓĐ˝] D[-ĐźÓŃÓ], HH:mm',
            LLLL : 'dddd, YYYY [ŇŤŃĐťŃĐ¸] MMMM [ŃĐšÓŃÓĐ˝] D[-ĐźÓŃÓ], HH:mm'
        },
        calendar : {
            sameDay: '[ĐĐ°ŃĐ˝] LT [ŃĐľŃĐľŃŃĐľ]',
            nextDay: '[ĐŤŃĐ°Đ˝] LT [ŃĐľŃĐľŃŃĐľ]',
            lastDay: '[ÓĐ˝ĐľŃ] LT [ŃĐľŃĐľŃŃĐľ]',
            nextWeek: '[ŇŞĐ¸ŃĐľŃ] dddd LT [ŃĐľŃĐľŃŃĐľ]',
            lastWeek: '[ĐŃŃĐ˝Ó] dddd LT [ŃĐľŃĐľŃŃĐľ]',
            sameElse: 'L'
        },
        relativeTime : {
            future : function (output) {
                var affix = /ŃĐľŃĐľŃ$/i.exec(output) ? 'ŃĐľĐ˝' : /ŇŤŃĐť$/i.exec(output) ? 'ŃĐ°Đ˝' : 'ŃĐ°Đ˝';
                return output + affix;
            },
            past : '%s ĐşĐ°ŃĐťĐťĐ°',
            s : 'ĐżÓŃ-Đ¸Đş ŇŤĐľĐşĐşŃĐ˝Ń',
            m : 'ĐżÓŃ ĐźĐ¸Đ˝ŃŃ',
            mm : '%d ĐźĐ¸Đ˝ŃŃ',
            h : 'ĐżÓŃ ŃĐľŃĐľŃ',
            hh : '%d ŃĐľŃĐľŃ',
            d : 'ĐżÓŃ ĐşŃĐ˝',
            dd : '%d ĐşŃĐ˝',
            M : 'ĐżÓŃ ŃĐšÓŃ',
            MM : '%d ŃĐšÓŃ',
            y : 'ĐżÓŃ ŇŤŃĐť',
            yy : '%d ŇŤŃĐť'
        },
        ordinalParse: /\d{1,2}-ĐźÓŃ/,
        ordinal : '%d-ĐźÓŃ',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Welsh (cy)
    //! author : Robert Allen

    var cy = moment__default.defineLocale('cy', {
        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
        // time formats are the same as en-gb
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[Heddiw am] LT',
            nextDay: '[Yfory am] LT',
            nextWeek: 'dddd [am] LT',
            lastDay: '[Ddoe am] LT',
            lastWeek: 'dddd [diwethaf am] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'mewn %s',
            past: '%s yn Ă´l',
            s: 'ychydig eiliadau',
            m: 'munud',
            mm: '%d munud',
            h: 'awr',
            hh: '%d awr',
            d: 'diwrnod',
            dd: '%d diwrnod',
            M: 'mis',
            MM: '%d mis',
            y: 'blwyddyn',
            yy: '%d flynedd'
        },
        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
        ordinal: function (number) {
            var b = number,
                output = '',
                lookup = [
                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
                ];
            if (b > 20) {
                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                    output = 'fed'; // not 30ain, 70ain or 90ain
                } else {
                    output = 'ain';
                }
            } else if (b > 0) {
                output = lookup[b];
            }
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : danish (da)
    //! author : Ulrik Nielsen : https://github.com/mrbase

    var da = moment__default.defineLocale('da', {
        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'sĂ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lĂ¸rdag'.split('_'),
        weekdaysShort : 'sĂ¸n_man_tir_ons_tor_fre_lĂ¸r'.split('_'),
        weekdaysMin : 'sĂ¸_ma_ti_on_to_fr_lĂ¸'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd [d.] D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[I dag kl.] LT',
            nextDay : '[I morgen kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[I gĂĽr kl.] LT',
            lastWeek : '[sidste] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : '%s siden',
            s : 'fĂĽ sekunder',
            m : 'et minut',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dage',
            M : 'en mĂĽned',
            MM : '%d mĂĽneder',
            y : 'et ĂĽr',
            yy : '%d ĂĽr'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : austrian german (de-at)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion ElensĂşle: https://github.com/Oire
    //! author : Martin Groller : https://github.com/MadMG
    //! author : Mikolaj Dadela : https://github.com/mik01aj

    function de_at__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    var de_at = moment__default.defineLocale('de-at', {
        months : 'JĂ¤nner_Februar_MĂ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'JĂ¤n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : de_at__processRelativeTime,
            mm : '%d Minuten',
            h : de_at__processRelativeTime,
            hh : '%d Stunden',
            d : de_at__processRelativeTime,
            dd : de_at__processRelativeTime,
            M : de_at__processRelativeTime,
            MM : de_at__processRelativeTime,
            y : de_at__processRelativeTime,
            yy : de_at__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : german (de)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion ElensĂşle: https://github.com/Oire
    //! author : Mikolaj Dadela : https://github.com/mik01aj

    function de__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    var de = moment__default.defineLocale('de', {
        months : 'Januar_Februar_MĂ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : de__processRelativeTime,
            mm : '%d Minuten',
            h : de__processRelativeTime,
            hh : '%d Stunden',
            d : de__processRelativeTime,
            dd : de__processRelativeTime,
            M : de__processRelativeTime,
            MM : de__processRelativeTime,
            y : de__processRelativeTime,
            yy : de__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : dhivehi (dv)
    //! author : Jawish Hameed : https://github.com/jawish

    var dv__months = [
        'ŢŢŹŢŢŞŢŢŚŢŢŠ',
        'ŢŢŹŢŢ°ŢŢŞŢŢŚŢŢŠ',
        'ŢŢ§ŢŢ¨ŢŢŞ',
        'ŢŢ­ŢŢ°ŢŢŠŢŢŞ',
        'ŢŢ­',
        'ŢŢŤŢŢ°',
        'ŢŢŞŢŢŚŢŢ¨',
        'ŢŢŻŢŢŚŢŢ°ŢŢŞ',
        'ŢŢŹŢŢ°ŢŢŹŢŢ°ŢŢŚŢŢŞ',
        'ŢŢŽŢŢ°ŢŢŻŢŢŚŢŢŞ',
        'ŢŢŽŢŢŹŢŢ°ŢŢŚŢŢŞ',
        'ŢŢ¨ŢŢŹŢŢ°ŢŢŚŢŢŞ'
    ], dv__weekdays = [
        'ŢŢ§ŢŢ¨ŢŢ°ŢŢŚ',
        'ŢŢŻŢŢŚ',
        'ŢŢŚŢŢ°ŢŢ§ŢŢŚ',
        'ŢŢŞŢŢŚ',
        'ŢŢŞŢŢ§ŢŢ°ŢŢŚŢŢ¨',
        'ŢŢŞŢŢŞŢŢŞ',
        'ŢŢŽŢŢ¨ŢŢ¨ŢŢŞ'
    ];

    var dv = moment__default.defineLocale('dv', {
        months : dv__months,
        monthsShort : dv__months,
        weekdays : dv__weekdays,
        weekdaysShort : dv__weekdays,
        weekdaysMin : 'ŢŢ§ŢŢ¨_ŢŢŻŢŢŚ_ŢŢŚŢŢ°_ŢŢŞŢŢŚ_ŢŢŞŢŢ§_ŢŢŞŢŢŞ_ŢŢŽŢŢ¨'.split('_'),
        longDateFormat : {

            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'D/M/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /ŢŢ|ŢŢ/,
        isPM : function (input) {
            return 'ŢŢ' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ŢŢ';
            } else {
                return 'ŢŢ';
            }
        },
        calendar : {
            sameDay : '[ŢŢ¨ŢŢŚŢŢŞ] LT',
            nextDay : '[ŢŢ§ŢŢŚŢŢ§] LT',
            nextWeek : 'dddd LT',
            lastDay : '[ŢŢ¨ŢŢ°ŢŢŹ] LT',
            lastWeek : '[ŢŢ§ŢŢ¨ŢŢŞŢŢ¨] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ŢŢŹŢŢ­ŢŢŚŢŢ¨ %s',
            past : 'ŢŢŞŢŢ¨ŢŢ° %s',
            s : 'ŢŢ¨ŢŢŞŢŢ°ŢŢŞŢŢŽŢŢŹŢŢ°',
            m : 'ŢŢ¨ŢŢ¨ŢŢŹŢŢ°',
            mm : 'ŢŢ¨ŢŢ¨ŢŢŞ %d',
            h : 'ŢŢŚŢŢ¨ŢŢ¨ŢŢŹŢŢ°',
            hh : 'ŢŢŚŢŢ¨ŢŢ¨ŢŢŞ %d',
            d : 'ŢŢŞŢŢŚŢŢŹŢŢ°',
            dd : 'ŢŢŞŢŢŚŢŢ° %d',
            M : 'ŢŢŚŢŢŹŢŢ°',
            MM : 'ŢŢŚŢŢ° %d',
            y : 'ŢŢŚŢŢŚŢŢŹŢŢ°',
            yy : 'ŢŢŚŢŢŚŢŢŞ %d'
        },
        preparse: function (string) {
            return string.replace(/Ř/g, ',');
        },
        postformat: function (string) {
            return string.replace(/,/g, 'Ř');
        },
        week : {
            dow : 7,  // Sunday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : modern greek (el)
    //! author : Aggelos Karalias : https://github.com/mehiel

    var el = moment__default.defineLocale('el', {
        monthsNominativeEl : 'ÎÎąÎ˝ÎżĎÎŹĎÎšÎżĎ_ÎŚÎľÎ˛ĎÎżĎÎŹĎÎšÎżĎ_ÎÎŹĎĎÎšÎżĎ_ÎĎĎÎŻÎťÎšÎżĎ_ÎÎŹÎšÎżĎ_ÎÎżĎÎ˝ÎšÎżĎ_ÎÎżĎÎťÎšÎżĎ_ÎĎÎłÎżĎĎĎÎżĎ_ÎŁÎľĎĎÎ­ÎźÎ˛ĎÎšÎżĎ_ÎÎşĎĎÎ˛ĎÎšÎżĎ_ÎÎżÎ­ÎźÎ˛ĎÎšÎżĎ_ÎÎľÎşÎ­ÎźÎ˛ĎÎšÎżĎ'.split('_'),
        monthsGenitiveEl : 'ÎÎąÎ˝ÎżĎÎąĎÎŻÎżĎ_ÎŚÎľÎ˛ĎÎżĎÎąĎÎŻÎżĎ_ÎÎąĎĎÎŻÎżĎ_ÎĎĎÎšÎťÎŻÎżĎ_ÎÎąÎÎżĎ_ÎÎżĎÎ˝ÎŻÎżĎ_ÎÎżĎÎťÎŻÎżĎ_ÎĎÎłÎżĎĎĎÎżĎ_ÎŁÎľĎĎÎľÎźÎ˛ĎÎŻÎżĎ_ÎÎşĎĎÎ˛ĎÎŻÎżĎ_ÎÎżÎľÎźÎ˛ĎÎŻÎżĎ_ÎÎľÎşÎľÎźÎ˛ĎÎŻÎżĎ'.split('_'),
        months : function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort : 'ÎÎąÎ˝_ÎŚÎľÎ˛_ÎÎąĎ_ÎĎĎ_ÎÎąĎ_ÎÎżĎÎ˝_ÎÎżĎÎť_ÎĎÎł_ÎŁÎľĎ_ÎÎşĎ_ÎÎżÎľ_ÎÎľÎş'.split('_'),
        weekdays : 'ÎĎĎÎšÎąÎşÎŽ_ÎÎľĎĎÎ­ĎÎą_Î¤ĎÎŻĎÎˇ_Î¤ÎľĎÎŹĎĎÎˇ_Î Î­ÎźĎĎÎˇ_Î ÎąĎÎąĎÎşÎľĎÎŽ_ÎŁÎŹÎ˛Î˛ÎąĎÎż'.split('_'),
        weekdaysShort : 'ÎĎĎ_ÎÎľĎ_Î¤ĎÎš_Î¤ÎľĎ_Î ÎľÎź_Î ÎąĎ_ÎŁÎąÎ˛'.split('_'),
        weekdaysMin : 'ÎĎ_ÎÎľ_Î¤Ď_Î¤Îľ_Î Îľ_Î Îą_ÎŁÎą'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'ÎźÎź' : 'ÎÎ';
            } else {
                return isLower ? 'ĎÎź' : 'Î Î';
            }
        },
        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === 'Îź');
        },
        meridiemParse : /[Î Î]\.?Î?\.?/i,
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendarEl : {
            sameDay : '[ÎŁÎŽÎźÎľĎÎą {}] LT',
            nextDay : '[ÎĎĎÎšÎż {}] LT',
            nextWeek : 'dddd [{}] LT',
            lastDay : '[Î§Î¸ÎľĎ {}] LT',
            lastWeek : function () {
                switch (this.day()) {
                    case 6:
                        return '[ĎÎż ĎĎÎżÎˇÎłÎżĎÎźÎľÎ˝Îż] dddd [{}] LT';
                    default:
                        return '[ĎÎˇÎ˝ ĎĎÎżÎˇÎłÎżĎÎźÎľÎ˝Îˇ] dddd [{}] LT';
                }
            },
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendarEl[key],
                hours = mom && mom.hours();
            if (isFunction(output)) {
                output = output.apply(mom);
            }
            return output.replace('{}', (hours % 12 === 1 ? 'ĎĎÎˇ' : 'ĎĎÎšĎ'));
        },
        relativeTime : {
            future : 'ĎÎľ %s',
            past : '%s ĎĎÎšÎ˝',
            s : 'ÎťÎŻÎłÎą Î´ÎľĎĎÎľĎĎÎťÎľĎĎÎą',
            m : 'Î­Î˝Îą ÎťÎľĎĎĎ',
            mm : '%d ÎťÎľĎĎÎŹ',
            h : 'ÎźÎŻÎą ĎĎÎą',
            hh : '%d ĎĎÎľĎ',
            d : 'ÎźÎŻÎą ÎźÎ­ĎÎą',
            dd : '%d ÎźÎ­ĎÎľĎ',
            M : 'Î­Î˝ÎąĎ ÎźÎŽÎ˝ÎąĎ',
            MM : '%d ÎźÎŽÎ˝ÎľĎ',
            y : 'Î­Î˝ÎąĎ ĎĎĎÎ˝ÎżĎ',
            yy : '%d ĎĎĎÎ˝ÎšÎą'
        },
        ordinalParse: /\d{1,2}Îˇ/,
        ordinal: '%dÎˇ',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : australian english (en-au)

    var en_au = moment__default.defineLocale('en-au', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : canadian english (en-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca

    var en_ca = moment__default.defineLocale('en-ca', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'YYYY-MM-DD',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY h:mm A',
            LLLL : 'dddd, MMMM D, YYYY h:mm A'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    //! moment.js locale configuration
    //! locale : great britain english (en-gb)
    //! author : Chris Gedrim : https://github.com/chrisgedrim

    var en_gb = moment__default.defineLocale('en-gb', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Irish english (en-ie)
    //! author : Chris Cartlidge : https://github.com/chriscartlidge

    var en_ie = moment__default.defineLocale('en-ie', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : New Zealand english (en-nz)

    var en_nz = moment__default.defineLocale('en-nz', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : esperanto (eo)
    //! author : Colin Dean : https://github.com/colindean
    //! komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
    //!          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

    var eo = moment__default.defineLocale('eo', {
        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_aĹ­gusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aĹ­g_sep_okt_nov_dec'.split('_'),
        weekdays : 'DimanÄo_Lundo_Mardo_Merkredo_Ä´aĹ­do_Vendredo_Sabato'.split('_'),
        weekdaysShort : 'Dim_Lun_Mard_Merk_Ä´aĹ­_Ven_Sab'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Ä´a_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D[-an de] MMMM, YYYY',
            LLL : 'D[-an de] MMMM, YYYY HH:mm',
            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY HH:mm'
        },
        meridiemParse: /[ap]\.t\.m/i,
        isPM: function (input) {
            return input.charAt(0).toLowerCase() === 'p';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar : {
            sameDay : '[HodiaĹ­ je] LT',
            nextDay : '[MorgaĹ­ je] LT',
            nextWeek : 'dddd [je] LT',
            lastDay : '[HieraĹ­ je] LT',
            lastWeek : '[pasinta] dddd [je] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'je %s',
            past : 'antaĹ­ %s',
            s : 'sekundoj',
            m : 'minuto',
            mm : '%d minutoj',
            h : 'horo',
            hh : '%d horoj',
            d : 'tago',//ne 'diurno', Äar estas uzita por proksimumo
            dd : '%d tagoj',
            M : 'monato',
            MM : '%d monatoj',
            y : 'jaro',
            yy : '%d jaroj'
        },
        ordinalParse: /\d{1,2}a/,
        ordinal : '%da',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : spanish (es)
    //! author : Julio NapurĂ­ : https://github.com/julionc

    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
        es__monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

    var es = moment__default.defineLocale('es', {
        months : 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return es__monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : 'domingo_lunes_martes_miĂŠrcoles_jueves_viernes_sĂĄbado'.split('_'),
        weekdaysShort : 'dom._lun._mar._miĂŠ._jue._vie._sĂĄb.'.split('_'),
        weekdaysMin : 'do_lu_ma_mi_ju_vi_sĂĄ'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY H:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[maĂąana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'hace %s',
            s : 'unos segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'una hora',
            hh : '%d horas',
            d : 'un dĂ­a',
            dd : '%d dĂ­as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un aĂąo',
            yy : '%d aĂąos'
        },
        ordinalParse : /\d{1,2}Âş/,
        ordinal : '%dÂş',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : estonian (et)
    //! author : Henry Kehlmann : https://github.com/madhenry
    //! improvements : Illimar Tambek : https://github.com/ragulka

    function et__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's' : ['mĂľne sekundi', 'mĂľni sekund', 'paar sekundit'],
            'm' : ['Ăźhe minuti', 'Ăźks minut'],
            'mm': [number + ' minuti', number + ' minutit'],
            'h' : ['Ăźhe tunni', 'tund aega', 'Ăźks tund'],
            'hh': [number + ' tunni', number + ' tundi'],
            'd' : ['Ăźhe pĂ¤eva', 'Ăźks pĂ¤ev'],
            'M' : ['kuu aja', 'kuu aega', 'Ăźks kuu'],
            'MM': [number + ' kuu', number + ' kuud'],
            'y' : ['Ăźhe aasta', 'aasta', 'Ăźks aasta'],
            'yy': [number + ' aasta', number + ' aastat']
        };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }

    var et = moment__default.defineLocale('et', {
        months        : 'jaanuar_veebruar_mĂ¤rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort   : 'jaan_veebr_mĂ¤rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays      : 'pĂźhapĂ¤ev_esmaspĂ¤ev_teisipĂ¤ev_kolmapĂ¤ev_neljapĂ¤ev_reede_laupĂ¤ev'.split('_'),
        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat : {
            LT   : 'H:mm',
            LTS : 'H:mm:ss',
            L    : 'DD.MM.YYYY',
            LL   : 'D. MMMM YYYY',
            LLL  : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[TĂ¤na,] LT',
            nextDay  : '[Homme,] LT',
            nextWeek : '[JĂ¤rgmine] dddd LT',
            lastDay  : '[Eile,] LT',
            lastWeek : '[Eelmine] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s pĂ¤rast',
            past   : '%s tagasi',
            s      : et__processRelativeTime,
            m      : et__processRelativeTime,
            mm     : et__processRelativeTime,
            h      : et__processRelativeTime,
            hh     : et__processRelativeTime,
            d      : et__processRelativeTime,
            dd     : '%d pĂ¤eva',
            M      : et__processRelativeTime,
            MM     : et__processRelativeTime,
            y      : et__processRelativeTime,
            yy     : et__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : euskara (eu)
    //! author : Eneko Illarramendi : https://github.com/eillarra

    var eu = moment__default.defineLocale('eu', {
        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY[ko] MMMM[ren] D[a]',
            LLL : 'YYYY[ko] MMMM[ren] D[a] HH:mm',
            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
            l : 'YYYY-M-D',
            ll : 'YYYY[ko] MMM D[a]',
            lll : 'YYYY[ko] MMM D[a] HH:mm',
            llll : 'ddd, YYYY[ko] MMM D[a] HH:mm'
        },
        calendar : {
            sameDay : '[gaur] LT[etan]',
            nextDay : '[bihar] LT[etan]',
            nextWeek : 'dddd LT[etan]',
            lastDay : '[atzo] LT[etan]',
            lastWeek : '[aurreko] dddd LT[etan]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s barru',
            past : 'duela %s',
            s : 'segundo batzuk',
            m : 'minutu bat',
            mm : '%d minutu',
            h : 'ordu bat',
            hh : '%d ordu',
            d : 'egun bat',
            dd : '%d egun',
            M : 'hilabete bat',
            MM : '%d hilabete',
            y : 'urte bat',
            yy : '%d urte'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Persian (fa)
    //! author : Ebrahim Byagowi : https://github.com/ebraminio

    var fa__symbolMap = {
        '1': 'Űą',
        '2': 'Ű˛',
        '3': 'Űł',
        '4': 'Ű´',
        '5': 'Űľ',
        '6': 'Űś',
        '7': 'Űˇ',
        '8': 'Ű¸',
        '9': 'Űš',
        '0': 'Ű°'
    }, fa__numberMap = {
        'Űą': '1',
        'Ű˛': '2',
        'Űł': '3',
        'Ű´': '4',
        'Űľ': '5',
        'Űś': '6',
        'Űˇ': '7',
        'Ű¸': '8',
        'Űš': '9',
        'Ű°': '0'
    };

    var fa = moment__default.defineLocale('fa', {
        months : 'ÚŘ§ŮŮŰŮ_ŮŮŘąŰŮ_ŮŘ§ŘąŘł_Ř˘ŮŘąŰŮ_ŮŮ_ÚŮŘŚŮ_ÚŮŘŚŰŮ_Ř§ŮŘŞ_ŘłŮžŘŞŘ§ŮŘ¨Řą_Ř§ÚŠŘŞŘ¨Řą_ŮŮŘ§ŮŘ¨Řą_ŘŻŘłŘ§ŮŘ¨Řą'.split('_'),
        monthsShort : 'ÚŘ§ŮŮŰŮ_ŮŮŘąŰŮ_ŮŘ§ŘąŘł_Ř˘ŮŘąŰŮ_ŮŮ_ÚŮŘŚŮ_ÚŮŘŚŰŮ_Ř§ŮŘŞ_ŘłŮžŘŞŘ§ŮŘ¨Řą_Ř§ÚŠŘŞŘ¨Řą_ŮŮŘ§ŮŘ¨Řą_ŘŻŘłŘ§ŮŘ¨Řą'.split('_'),
        weekdays : 'ŰÚŠ\u200cŘ´ŮŘ¨Ů_ŘŻŮŘ´ŮŘ¨Ů_ŘłŮ\u200cŘ´ŮŘ¨Ů_ÚŮŘ§ŘąŘ´ŮŘ¨Ů_ŮžŮŘŹ\u200cŘ´ŮŘ¨Ů_ŘŹŮŘšŮ_Ř´ŮŘ¨Ů'.split('_'),
        weekdaysShort : 'ŰÚŠ\u200cŘ´ŮŘ¨Ů_ŘŻŮŘ´ŮŘ¨Ů_ŘłŮ\u200cŘ´ŮŘ¨Ů_ÚŮŘ§ŘąŘ´ŮŘ¨Ů_ŮžŮŘŹ\u200cŘ´ŮŘ¨Ů_ŘŹŮŘšŮ_Ř´ŮŘ¨Ů'.split('_'),
        weekdaysMin : 'Ű_ŘŻ_Řł_Ú_Ůž_ŘŹ_Ř´'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        meridiemParse: /ŮŘ¨Ů Ř§Ř˛ Ř¸ŮŘą|Ř¨ŘšŘŻ Ř§Ř˛ Ř¸ŮŘą/,
        isPM: function (input) {
            return /Ř¨ŘšŘŻ Ř§Ř˛ Ř¸ŮŘą/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ŮŘ¨Ů Ř§Ř˛ Ř¸ŮŘą';
            } else {
                return 'Ř¨ŘšŘŻ Ř§Ř˛ Ř¸ŮŘą';
            }
        },
        calendar : {
            sameDay : '[Ř§ŮŘąŮŘ˛ ŘłŘ§ŘšŘŞ] LT',
            nextDay : '[ŮŘąŘŻŘ§ ŘłŘ§ŘšŘŞ] LT',
            nextWeek : 'dddd [ŘłŘ§ŘšŘŞ] LT',
            lastDay : '[ŘŻŰŘąŮŘ˛ ŘłŘ§ŘšŘŞ] LT',
            lastWeek : 'dddd [ŮžŰŘ´] [ŘłŘ§ŘšŘŞ] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ŘŻŘą %s',
            past : '%s ŮžŰŘ´',
            s : 'ÚŮŘŻŰŮ ŘŤŘ§ŮŰŮ',
            m : 'ŰÚŠ ŘŻŮŰŮŮ',
            mm : '%d ŘŻŮŰŮŮ',
            h : 'ŰÚŠ ŘłŘ§ŘšŘŞ',
            hh : '%d ŘłŘ§ŘšŘŞ',
            d : 'ŰÚŠ ŘąŮŘ˛',
            dd : '%d ŘąŮŘ˛',
            M : 'ŰÚŠ ŮŘ§Ů',
            MM : '%d ŮŘ§Ů',
            y : 'ŰÚŠ ŘłŘ§Ů',
            yy : '%d ŘłŘ§Ů'
        },
        preparse: function (string) {
            return string.replace(/[Ű°-Űš]/g, function (match) {
                return fa__numberMap[match];
            }).replace(/Ř/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return fa__symbolMap[match];
            }).replace(/,/g, 'Ř');
        },
        ordinalParse: /\d{1,2}Ů/,
        ordinal : '%dŮ',
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12 // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : finnish (fi)
    //! author : Tarmo Aidantausta : https://github.com/bleadof

    var numbersPast = 'nolla yksi kaksi kolme neljĂ¤ viisi kuusi seitsemĂ¤n kahdeksan yhdeksĂ¤n'.split(' '),
        numbersFuture = [
            'nolla', 'yhden', 'kahden', 'kolmen', 'neljĂ¤n', 'viiden', 'kuuden',
            numbersPast[7], numbersPast[8], numbersPast[9]
        ];
    function fi__translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'pĂ¤ivĂ¤n' : 'pĂ¤ivĂ¤';
        case 'dd':
            result = isFuture ? 'pĂ¤ivĂ¤n' : 'pĂ¤ivĂ¤Ă¤';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }
    function verbalNumber(number, isFuture) {
        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
    }

    var fi = moment__default.defineLocale('fi', {
        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesĂ¤kuu_heinĂ¤kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort : 'tammi_helmi_maalis_huhti_touko_kesĂ¤_heinĂ¤_elo_syys_loka_marras_joulu'.split('_'),
        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD.MM.YYYY',
            LL : 'Do MMMM[ta] YYYY',
            LLL : 'Do MMMM[ta] YYYY, [klo] HH.mm',
            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] HH.mm',
            l : 'D.M.YYYY',
            ll : 'Do MMM YYYY',
            lll : 'Do MMM YYYY, [klo] HH.mm',
            llll : 'ddd, Do MMM YYYY, [klo] HH.mm'
        },
        calendar : {
            sameDay : '[tĂ¤nĂ¤Ă¤n] [klo] LT',
            nextDay : '[huomenna] [klo] LT',
            nextWeek : 'dddd [klo] LT',
            lastDay : '[eilen] [klo] LT',
            lastWeek : '[viime] dddd[na] [klo] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s pĂ¤Ă¤stĂ¤',
            past : '%s sitten',
            s : fi__translate,
            m : fi__translate,
            mm : fi__translate,
            h : fi__translate,
            hh : fi__translate,
            d : fi__translate,
            dd : fi__translate,
            M : fi__translate,
            MM : fi__translate,
            y : fi__translate,
            yy : fi__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : faroese (fo)
    //! author : Ragnar Johannesen : https://github.com/ragnar123

    var fo = moment__default.defineLocale('fo', {
        months : 'januar_februar_mars_aprĂ­l_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sunnudagur_mĂĄnadagur_tĂ˝sdagur_mikudagur_hĂłsdagur_frĂ­ggjadagur_leygardagur'.split('_'),
        weekdaysShort : 'sun_mĂĄn_tĂ˝s_mik_hĂłs_frĂ­_ley'.split('_'),
        weekdaysMin : 'su_mĂĄ_tĂ˝_mi_hĂł_fr_le'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D. MMMM, YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Ă dag kl.] LT',
            nextDay : '[Ă morgin kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[Ă gjĂĄr kl.] LT',
            lastWeek : '[sĂ­Ă°stu] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'um %s',
            past : '%s sĂ­Ă°ani',
            s : 'fĂĄ sekund',
            m : 'ein minutt',
            mm : '%d minuttir',
            h : 'ein tĂ­mi',
            hh : '%d tĂ­mar',
            d : 'ein dagur',
            dd : '%d dagar',
            M : 'ein mĂĄnaĂ°i',
            MM : '%d mĂĄnaĂ°ir',
            y : 'eitt ĂĄr',
            yy : '%d ĂĄr'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : canadian french (fr-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca

    var fr_ca = moment__default.defineLocale('fr-ca', {
        months : 'janvier_fĂŠvrier_mars_avril_mai_juin_juillet_aoĂťt_septembre_octobre_novembre_dĂŠcembre'.split('_'),
        monthsShort : 'janv._fĂŠvr._mars_avr._mai_juin_juil._aoĂťt_sept._oct._nov._dĂŠc.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui Ă ] LT',
            nextDay: '[Demain Ă ] LT',
            nextWeek: 'dddd [Ă ] LT',
            lastDay: '[Hier Ă ] LT',
            lastWeek: 'dddd [dernier Ă ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|e)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : 'e');
        }
    });

    //! moment.js locale configuration
    //! locale : swiss french (fr)
    //! author : Gaspard Bucher : https://github.com/gaspard

    var fr_ch = moment__default.defineLocale('fr-ch', {
        months : 'janvier_fĂŠvrier_mars_avril_mai_juin_juillet_aoĂťt_septembre_octobre_novembre_dĂŠcembre'.split('_'),
        monthsShort : 'janv._fĂŠvr._mars_avr._mai_juin_juil._aoĂťt_sept._oct._nov._dĂŠc.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui Ă ] LT',
            nextDay: '[Demain Ă ] LT',
            nextWeek: 'dddd [Ă ] LT',
            lastDay: '[Hier Ă ] LT',
            lastWeek: 'dddd [dernier Ă ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|e)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : 'e');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : french (fr)
    //! author : John Fischer : https://github.com/jfroffice

    var fr = moment__default.defineLocale('fr', {
        months : 'janvier_fĂŠvrier_mars_avril_mai_juin_juillet_aoĂťt_septembre_octobre_novembre_dĂŠcembre'.split('_'),
        monthsShort : 'janv._fĂŠvr._mars_avr._mai_juin_juil._aoĂťt_sept._oct._nov._dĂŠc.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui Ă ] LT',
            nextDay: '[Demain Ă ] LT',
            nextWeek: 'dddd [Ă ] LT',
            lastDay: '[Hier Ă ] LT',
            lastWeek: 'dddd [dernier Ă ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : frisian (fy)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v

    var fy__monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
        fy__monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');

    var fy = moment__default.defineLocale('fy', {
        months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return fy__monthsShortWithoutDots[m.month()];
            } else {
                return fy__monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
        weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
        weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[hjoed om] LT',
            nextDay: '[moarn om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[juster om] LT',
            lastWeek: '[Ă´frĂťne] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'oer %s',
            past : '%s lyn',
            s : 'in pear sekonden',
            m : 'ien minĂşt',
            mm : '%d minuten',
            h : 'ien oere',
            hh : '%d oeren',
            d : 'ien dei',
            dd : '%d dagen',
            M : 'ien moanne',
            MM : '%d moannen',
            y : 'ien jier',
            yy : '%d jierren'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : great britain scottish gealic (gd)
    //! author : Jon Ashdown : https://github.com/jonashdown

    var gd__months = [
        'Am Faoilleach', 'An Gearran', 'Am MĂ rt', 'An Giblean', 'An CĂ¨itean', 'An t-Ăgmhios', 'An t-Iuchar', 'An LĂšnastal', 'An t-Sultain', 'An DĂ mhair', 'An t-Samhain', 'An DĂšbhlachd'
    ];

    var gd__monthsShort = ['Faoi', 'Gear', 'MĂ rt', 'Gibl', 'CĂ¨it', 'Ăgmh', 'Iuch', 'LĂšn', 'Sult', 'DĂ mh', 'Samh', 'DĂšbh'];

    var gd__weekdays = ['DidĂ˛mhnaich', 'Diluain', 'DimĂ irt', 'Diciadain', 'Diardaoin', 'Dihaoine', 'Disathairne'];

    var weekdaysShort = ['Did', 'Dil', 'Dim', 'Dic', 'Dia', 'Dih', 'Dis'];

    var weekdaysMin = ['DĂ˛', 'Lu', 'MĂ ', 'Ci', 'Ar', 'Ha', 'Sa'];

    var gd = moment__default.defineLocale('gd', {
        months : gd__months,
        monthsShort : gd__monthsShort,
        monthsParseExact : true,
        weekdays : gd__weekdays,
        weekdaysShort : weekdaysShort,
        weekdaysMin : weekdaysMin,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[An-diugh aig] LT',
            nextDay : '[A-mĂ ireach aig] LT',
            nextWeek : 'dddd [aig] LT',
            lastDay : '[An-dĂ¨ aig] LT',
            lastWeek : 'dddd [seo chaidh] [aig] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ann an %s',
            past : 'bho chionn %s',
            s : 'beagan diogan',
            m : 'mionaid',
            mm : '%d mionaidean',
            h : 'uair',
            hh : '%d uairean',
            d : 'latha',
            dd : '%d latha',
            M : 'mĂŹos',
            MM : '%d mĂŹosan',
            y : 'bliadhna',
            yy : '%d bliadhna'
        },
        ordinalParse : /\d{1,2}(d|na|mh)/,
        ordinal : function (number) {
            var output = number === 1 ? 'd' : number % 10 === 2 ? 'na' : 'mh';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : galician (gl)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado

    var gl = moment__default.defineLocale('gl', {
        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_XuĂąo_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort : 'Xan._Feb._Mar._Abr._Mai._XuĂą._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays : 'Domingo_Luns_Martes_MĂŠrcores_Xoves_Venres_SĂĄbado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._MĂŠr._Xov._Ven._SĂĄb.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_MĂŠ_Xo_Ve_SĂĄ'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[hoxe ' + ((this.hours() !== 1) ? 'ĂĄs' : 'ĂĄ') + '] LT';
            },
            nextDay : function () {
                return '[maĂąĂĄ ' + ((this.hours() !== 1) ? 'ĂĄs' : 'ĂĄ') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [' + ((this.hours() !== 1) ? 'ĂĄs' : 'a') + '] LT';
            },
            lastDay : function () {
                return '[onte ' + ((this.hours() !== 1) ? 'ĂĄ' : 'a') + '] LT';
            },
            lastWeek : function () {
                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'ĂĄs' : 'a') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past : 'hai %s',
            s : 'uns segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'unha hora',
            hh : '%d horas',
            d : 'un dĂ­a',
            dd : '%d dĂ­as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un ano',
            yy : '%d anos'
        },
        ordinalParse : /\d{1,2}Âş/,
        ordinal : '%dÂş',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Hebrew (he)
    //! author : Tomer Cohen : https://github.com/tomer
    //! author : Moshe Simantov : https://github.com/DevelopmentIL
    //! author : Tal Ater : https://github.com/TalAter

    var he = moment__default.defineLocale('he', {
        months : '×× ×××¨_×¤××¨×××¨_××¨×Ľ_××¤×¨××_×××_××× ×_××××_×××××Ą×_×Ą×¤××××¨_×××§××××¨_× ×××××¨_××Ś×××¨'.split('_'),
        monthsShort : '×× ××ł_×¤××¨×ł_××¨×Ľ_××¤×¨×ł_×××_××× ×_××××_××××ł_×Ą×¤××ł_×××§×ł_× ×××ł_××Ś××ł'.split('_'),
        weekdays : '×¨××Š××_×Š× ×_×Š×××Š×_×¨×××˘×_××××Š×_×Š××Š×_×Š××Ş'.split('_'),
        weekdaysShort : '××ł_××ł_××ł_××ł_××ł_××ł_×Š×ł'.split('_'),
        weekdaysMin : '×_×_×_×_×_×_×Š'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [×]MMMM YYYY',
            LLL : 'D [×]MMMM YYYY HH:mm',
            LLLL : 'dddd, D [×]MMMM YYYY HH:mm',
            l : 'D/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY HH:mm',
            llll : 'ddd, D MMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[×××× ×Öž]LT',
            nextDay : '[×××¨ ×Öž]LT',
            nextWeek : 'dddd [××Š×˘×] LT',
            lastDay : '[××Ş××× ×Öž]LT',
            lastWeek : '[××××] dddd [××××¨×× ××Š×˘×] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '××˘×× %s',
            past : '××¤× × %s',
            s : '××Ą×¤×¨ ×Š× ×××Ş',
            m : '××§×',
            mm : '%d ××§××Ş',
            h : '×Š×˘×',
            hh : function (number) {
                if (number === 2) {
                    return '×Š×˘×Ş×××';
                }
                return number + ' ×Š×˘××Ş';
            },
            d : '×××',
            dd : function (number) {
                if (number === 2) {
                    return '××××××';
                }
                return number + ' ××××';
            },
            M : '××××Š',
            MM : function (number) {
                if (number === 2) {
                    return '××××Š×××';
                }
                return number + ' ××××Š××';
            },
            y : '×Š× ×',
            yy : function (number) {
                if (number === 2) {
                    return '×Š× ×Ş×××';
                } else if (number % 10 === 0 && number !== 10) {
                    return number + ' ×Š× ×';
                }
                return number + ' ×Š× ××';
            }
        },
        meridiemParse: /×××"×Ś|××¤× ×"×Ś|×××¨× ××Ś××¨×××|××¤× × ××Ś××¨×××|××¤× ××Ş ×××§×¨|××××§×¨|××˘×¨×/i,
        isPM : function (input) {
            return /^(×××"×Ś|×××¨× ××Ś××¨×××|××˘×¨×)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 5) {
                return '××¤× ××Ş ×××§×¨';
            } else if (hour < 10) {
                return '××××§×¨';
            } else if (hour < 12) {
                return isLower ? '××¤× ×"×Ś' : '××¤× × ××Ś××¨×××';
            } else if (hour < 18) {
                return isLower ? '×××"×Ś' : '×××¨× ××Ś××¨×××';
            } else {
                return '××˘×¨×';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : hindi (hi)
    //! author : Mayank Singhal : https://github.com/mayanksinghal

    var hi__symbolMap = {
        '1': 'ŕĽ§',
        '2': 'ŕĽ¨',
        '3': 'ŕĽŠ',
        '4': 'ŕĽŞ',
        '5': 'ŕĽŤ',
        '6': 'ŕĽŹ',
        '7': 'ŕĽ­',
        '8': 'ŕĽŽ',
        '9': 'ŕĽŻ',
        '0': 'ŕĽŚ'
    },
    hi__numberMap = {
        'ŕĽ§': '1',
        'ŕĽ¨': '2',
        'ŕĽŠ': '3',
        'ŕĽŞ': '4',
        'ŕĽŤ': '5',
        'ŕĽŹ': '6',
        'ŕĽ­': '7',
        'ŕĽŽ': '8',
        'ŕĽŻ': '9',
        'ŕĽŚ': '0'
    };

    var hi = moment__default.defineLocale('hi', {
        months : 'ŕ¤ŕ¤¨ŕ¤ľŕ¤°ŕĽ_ŕ¤Ťŕ¤źŕ¤°ŕ¤ľŕ¤°ŕĽ_ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤_ŕ¤ŕ¤ŞŕĽŕ¤°ŕĽŕ¤˛_ŕ¤Žŕ¤_ŕ¤ŕĽŕ¤¨_ŕ¤ŕĽŕ¤˛ŕ¤žŕ¤_ŕ¤ŕ¤ŕ¤¸ŕĽŕ¤¤_ŕ¤¸ŕ¤żŕ¤¤ŕ¤ŽŕĽŕ¤Źŕ¤°_ŕ¤ŕ¤ŕĽŕ¤ŕĽŕ¤Źŕ¤°_ŕ¤¨ŕ¤ľŕ¤ŽŕĽŕ¤Źŕ¤°_ŕ¤Śŕ¤żŕ¤¸ŕ¤ŽŕĽŕ¤Źŕ¤°'.split('_'),
        monthsShort : 'ŕ¤ŕ¤¨._ŕ¤Ťŕ¤źŕ¤°._ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤_ŕ¤ŕ¤ŞŕĽŕ¤°ŕĽ._ŕ¤Žŕ¤_ŕ¤ŕĽŕ¤¨_ŕ¤ŕĽŕ¤˛._ŕ¤ŕ¤._ŕ¤¸ŕ¤żŕ¤¤._ŕ¤ŕ¤ŕĽŕ¤ŕĽ._ŕ¤¨ŕ¤ľ._ŕ¤Śŕ¤żŕ¤¸.'.split('_'),
        weekdays : 'ŕ¤°ŕ¤ľŕ¤żŕ¤ľŕ¤žŕ¤°_ŕ¤¸ŕĽŕ¤Žŕ¤ľŕ¤žŕ¤°_ŕ¤Žŕ¤ŕ¤ŕ¤˛ŕ¤ľŕ¤žŕ¤°_ŕ¤ŹŕĽŕ¤§ŕ¤ľŕ¤žŕ¤°_ŕ¤ŕĽŕ¤°ŕĽŕ¤ľŕ¤žŕ¤°_ŕ¤śŕĽŕ¤ŕĽŕ¤°ŕ¤ľŕ¤žŕ¤°_ŕ¤śŕ¤¨ŕ¤żŕ¤ľŕ¤žŕ¤°'.split('_'),
        weekdaysShort : 'ŕ¤°ŕ¤ľŕ¤ż_ŕ¤¸ŕĽŕ¤Ž_ŕ¤Žŕ¤ŕ¤ŕ¤˛_ŕ¤ŹŕĽŕ¤§_ŕ¤ŕĽŕ¤°ŕĽ_ŕ¤śŕĽŕ¤ŕĽŕ¤°_ŕ¤śŕ¤¨ŕ¤ż'.split('_'),
        weekdaysMin : 'ŕ¤°_ŕ¤¸ŕĽ_ŕ¤Žŕ¤_ŕ¤ŹŕĽ_ŕ¤ŕĽ_ŕ¤śŕĽ_ŕ¤ś'.split('_'),
        longDateFormat : {
            LT : 'A h:mm ŕ¤Źŕ¤ŕĽ',
            LTS : 'A h:mm:ss ŕ¤Źŕ¤ŕĽ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm ŕ¤Źŕ¤ŕĽ',
            LLLL : 'dddd, D MMMM YYYY, A h:mm ŕ¤Źŕ¤ŕĽ'
        },
        calendar : {
            sameDay : '[ŕ¤ŕ¤] LT',
            nextDay : '[ŕ¤ŕ¤˛] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕ¤ŕ¤˛] LT',
            lastWeek : '[ŕ¤Şŕ¤żŕ¤ŕ¤˛ŕĽ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕ¤ŽŕĽŕ¤',
            past : '%s ŕ¤Şŕ¤šŕ¤˛ŕĽ',
            s : 'ŕ¤ŕĽŕ¤ ŕ¤šŕĽ ŕ¤ŕĽŕ¤ˇŕ¤Ł',
            m : 'ŕ¤ŕ¤ ŕ¤Žŕ¤żŕ¤¨ŕ¤',
            mm : '%d ŕ¤Žŕ¤żŕ¤¨ŕ¤',
            h : 'ŕ¤ŕ¤ ŕ¤ŕ¤ŕ¤ŕ¤ž',
            hh : '%d ŕ¤ŕ¤ŕ¤ŕĽ',
            d : 'ŕ¤ŕ¤ ŕ¤Śŕ¤żŕ¤¨',
            dd : '%d ŕ¤Śŕ¤żŕ¤¨',
            M : 'ŕ¤ŕ¤ ŕ¤Žŕ¤šŕĽŕ¤¨ŕĽ',
            MM : '%d ŕ¤Žŕ¤šŕĽŕ¤¨ŕĽ',
            y : 'ŕ¤ŕ¤ ŕ¤ľŕ¤°ŕĽŕ¤ˇ',
            yy : '%d ŕ¤ľŕ¤°ŕĽŕ¤ˇ'
        },
        preparse: function (string) {
            return string.replace(/[ŕĽ§ŕĽ¨ŕĽŠŕĽŞŕĽŤŕĽŹŕĽ­ŕĽŽŕĽŻŕĽŚ]/g, function (match) {
                return hi__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return hi__symbolMap[match];
            });
        },
        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
        meridiemParse: /ŕ¤°ŕ¤žŕ¤¤|ŕ¤¸ŕĽŕ¤Źŕ¤š|ŕ¤ŚŕĽŕ¤Şŕ¤šŕ¤°|ŕ¤śŕ¤žŕ¤Ž/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕ¤°ŕ¤žŕ¤¤') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤¸ŕĽŕ¤Źŕ¤š') {
                return hour;
            } else if (meridiem === 'ŕ¤ŚŕĽŕ¤Şŕ¤šŕ¤°') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤śŕ¤žŕ¤Ž') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ¤°ŕ¤žŕ¤¤';
            } else if (hour < 10) {
                return 'ŕ¤¸ŕĽŕ¤Źŕ¤š';
            } else if (hour < 17) {
                return 'ŕ¤ŚŕĽŕ¤Şŕ¤šŕ¤°';
            } else if (hour < 20) {
                return 'ŕ¤śŕ¤žŕ¤Ž';
            } else {
                return 'ŕ¤°ŕ¤žŕ¤¤';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : hrvatski (hr)
    //! author : Bojan MarkoviÄ : https://github.com/bmarkovic

    function hr__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    var hr = moment__default.defineLocale('hr', {
        months : {
            format: 'sijeÄnja_veljaÄe_oĹžujka_travnja_svibnja_lipnja_srpnja_kolovoza_rujna_listopada_studenoga_prosinca'.split('_'),
            standalone: 'sijeÄanj_veljaÄa_oĹžujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_')
        },
        monthsShort : 'sij._velj._oĹžu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',
            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[proĹĄlu] dddd [u] LT';
                case 6:
                    return '[proĹĄle] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[proĹĄli] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : hr__translate,
            mm     : hr__translate,
            h      : hr__translate,
            hh     : hr__translate,
            d      : 'dan',
            dd     : hr__translate,
            M      : 'mjesec',
            MM     : hr__translate,
            y      : 'godinu',
            yy     : hr__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : hungarian (hu)
    //! author : Adam Brunner : https://github.com/adambrunner

    var weekEndings = 'vasĂĄrnap hĂŠtfĹn kedden szerdĂĄn csĂźtĂśrtĂśkĂśn pĂŠnteken szombaton'.split(' ');
    function hu__translate(number, withoutSuffix, key, isFuture) {
        var num = number,
            suffix;
        switch (key) {
        case 's':
            return (isFuture || withoutSuffix) ? 'nĂŠhĂĄny mĂĄsodperc' : 'nĂŠhĂĄny mĂĄsodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' Ăłra' : ' ĂłrĂĄja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' Ăłra' : ' ĂłrĂĄja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' hĂłnap' : ' hĂłnapja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' hĂłnap' : ' hĂłnapja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' ĂŠv' : ' ĂŠve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' ĂŠv' : ' ĂŠve');
        }
        return '';
    }
    function week(isFuture) {
        return (isFuture ? '' : '[mĂşlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }

    var hu = moment__default.defineLocale('hu', {
        months : 'januĂĄr_februĂĄr_mĂĄrcius_ĂĄprilis_mĂĄjus_jĂşnius_jĂşlius_augusztus_szeptember_oktĂłber_november_december'.split('_'),
        monthsShort : 'jan_feb_mĂĄrc_ĂĄpr_mĂĄj_jĂşn_jĂşl_aug_szept_okt_nov_dec'.split('_'),
        weekdays : 'vasĂĄrnap_hĂŠtfĹ_kedd_szerda_csĂźtĂśrtĂśk_pĂŠntek_szombat'.split('_'),
        weekdaysShort : 'vas_hĂŠt_kedd_sze_csĂźt_pĂŠn_szo'.split('_'),
        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'YYYY.MM.DD.',
            LL : 'YYYY. MMMM D.',
            LLL : 'YYYY. MMMM D. H:mm',
            LLLL : 'YYYY. MMMM D., dddd H:mm'
        },
        meridiemParse: /de|du/i,
        isPM: function (input) {
            return input.charAt(1).toLowerCase() === 'u';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar : {
            sameDay : '[ma] LT[-kor]',
            nextDay : '[holnap] LT[-kor]',
            nextWeek : function () {
                return week.call(this, true);
            },
            lastDay : '[tegnap] LT[-kor]',
            lastWeek : function () {
                return week.call(this, false);
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s mĂşlva',
            past : '%s',
            s : hu__translate,
            m : hu__translate,
            mm : hu__translate,
            h : hu__translate,
            hh : hu__translate,
            d : hu__translate,
            dd : hu__translate,
            M : hu__translate,
            MM : hu__translate,
            y : hu__translate,
            yy : hu__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Armenian (hy-am)
    //! author : Armendarabyan : https://github.com/armendarabyan

    var hy_am = moment__default.defineLocale('hy-am', {
        months : {
            format: 'Ő°Ő¸ÖŐśŐžŐĄÖŐŤ_ÖŐĽŐżÖŐžŐĄÖŐŤ_Ő´ŐĄÖŐżŐŤ_ŐĄŐşÖŐŤŐŹŐŤ_Ő´ŐĄŐľŐŤŐ˝ŐŤ_Ő°Ő¸ÖŐśŐŤŐ˝ŐŤ_Ő°Ő¸ÖŐŹŐŤŐ˝ŐŤ_ÖŐŁŐ¸Ő˝ŐżŐ¸Ő˝ŐŤ_Ő˝ŐĽŐşŐżŐĽŐ´Ő˘ŐĽÖŐŤ_Ő°Ő¸ŐŻŐżŐĽŐ´Ő˘ŐĽÖŐŤ_ŐśŐ¸ŐľŐĽŐ´Ő˘ŐĽÖŐŤ_Ő¤ŐĽŐŻŐżŐĽŐ´Ő˘ŐĽÖŐŤ'.split('_'),
            standalone: 'Ő°Ő¸ÖŐśŐžŐĄÖ_ÖŐĽŐżÖŐžŐĄÖ_Ő´ŐĄÖŐż_ŐĄŐşÖŐŤŐŹ_Ő´ŐĄŐľŐŤŐ˝_Ő°Ő¸ÖŐśŐŤŐ˝_Ő°Ő¸ÖŐŹŐŤŐ˝_ÖŐŁŐ¸Ő˝ŐżŐ¸Ő˝_Ő˝ŐĽŐşŐżŐĽŐ´Ő˘ŐĽÖ_Ő°Ő¸ŐŻŐżŐĽŐ´Ő˘ŐĽÖ_ŐśŐ¸ŐľŐĽŐ´Ő˘ŐĽÖ_Ő¤ŐĽŐŻŐżŐĽŐ´Ő˘ŐĽÖ'.split('_')
        },
        monthsShort : 'Ő°ŐśŐž_ÖŐżÖ_Ő´ÖŐż_ŐĄŐşÖ_Ő´ŐľŐ˝_Ő°ŐśŐ˝_Ő°ŐŹŐ˝_ÖŐŁŐ˝_Ő˝ŐşŐż_Ő°ŐŻŐż_ŐśŐ´Ő˘_Ő¤ŐŻŐż'.split('_'),
        weekdays : 'ŐŻŐŤÖŐĄŐŻŐŤ_ŐĽÖŐŻŐ¸ÖŐˇŐĄŐ˘ŐŠŐŤ_ŐĽÖŐĽÖŐˇŐĄŐ˘ŐŠŐŤ_ŐšŐ¸ÖŐĽÖŐˇŐĄŐ˘ŐŠŐŤ_Ő°ŐŤŐśŐŁŐˇŐĄŐ˘ŐŠŐŤ_Ő¸ÖÖŐ˘ŐĄŐŠ_ŐˇŐĄŐ˘ŐĄŐŠ'.split('_'),
        weekdaysShort : 'ŐŻÖŐŻ_ŐĽÖŐŻ_ŐĽÖÖ_ŐšÖÖ_Ő°ŐśŐŁ_Ő¸ÖÖŐ˘_ŐˇŐ˘ŐŠ'.split('_'),
        weekdaysMin : 'ŐŻÖŐŻ_ŐĽÖŐŻ_ŐĽÖÖ_ŐšÖÖ_Ő°ŐśŐŁ_Ő¸ÖÖŐ˘_ŐˇŐ˘ŐŠ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY ŐŠ.',
            LLL : 'D MMMM YYYY ŐŠ., HH:mm',
            LLLL : 'dddd, D MMMM YYYY ŐŠ., HH:mm'
        },
        calendar : {
            sameDay: '[ŐĄŐľŐ˝ÖÖ] LT',
            nextDay: '[ŐžŐĄŐ˛Ő¨] LT',
            lastDay: '[ŐĽÖŐĽŐŻ] LT',
            nextWeek: function () {
                return 'dddd [ÖÖŐ¨ ŐŞŐĄŐ´Ő¨] LT';
            },
            lastWeek: function () {
                return '[ŐĄŐśÖŐĄŐŽ] dddd [ÖÖŐ¨ ŐŞŐĄŐ´Ő¨] LT';
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s Ő°ŐĽŐżŐ¸',
            past : '%s ŐĄŐźŐĄŐť',
            s : 'Ő´ŐŤ ÖŐĄŐśŐŤ ŐžŐĄŐľÖŐŻŐľŐĄŐś',
            m : 'ÖŐ¸ŐşŐĽ',
            mm : '%d ÖŐ¸ŐşŐĽ',
            h : 'ŐŞŐĄŐ´',
            hh : '%d ŐŞŐĄŐ´',
            d : 'ÖÖ',
            dd : '%d ÖÖ',
            M : 'ŐĄŐ´ŐŤŐ˝',
            MM : '%d ŐĄŐ´ŐŤŐ˝',
            y : 'ŐżŐĄÖŐŤ',
            yy : '%d ŐżŐĄÖŐŤ'
        },
        meridiemParse: /ŐŁŐŤŐˇŐĽÖŐžŐĄ|ŐĄŐźŐĄŐžŐ¸ŐżŐžŐĄ|ÖŐĽÖŐĽŐŻŐžŐĄ|ŐĽÖŐĽŐŻŐ¸ŐľŐĄŐś/,
        isPM: function (input) {
            return /^(ÖŐĽÖŐĽŐŻŐžŐĄ|ŐĽÖŐĽŐŻŐ¸ŐľŐĄŐś)$/.test(input);
        },
        meridiem : function (hour) {
            if (hour < 4) {
                return 'ŐŁŐŤŐˇŐĽÖŐžŐĄ';
            } else if (hour < 12) {
                return 'ŐĄŐźŐĄŐžŐ¸ŐżŐžŐĄ';
            } else if (hour < 17) {
                return 'ÖŐĽÖŐĽŐŻŐžŐĄ';
            } else {
                return 'ŐĽÖŐĽŐŻŐ¸ŐľŐĄŐś';
            }
        },
        ordinalParse: /\d{1,2}|\d{1,2}-(ŐŤŐś|ÖŐ¤)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-ŐŤŐś';
                }
                return number + '-ÖŐ¤';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Indonesia (id)
    //! author : Mohammad Satrio Utomo : https://github.com/tyok
    //! reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

    var id = moment__default.defineLocale('id', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|siang|sore|malam/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'siang') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'sore' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'siang';
            } else if (hours < 19) {
                return 'sore';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Besok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kemarin pukul] LT',
            lastWeek : 'dddd [lalu pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lalu',
            s : 'beberapa detik',
            m : 'semenit',
            mm : '%d menit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : icelandic (is)
    //! author : Hinrik Ărn SigurĂ°sson : https://github.com/hinrik

    function is__plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }
    function is__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sekĂşndur' : 'nokkrum sekĂşndum';
        case 'm':
            return withoutSuffix ? 'mĂ­nĂşta' : 'mĂ­nĂştu';
        case 'mm':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'mĂ­nĂştur' : 'mĂ­nĂştum');
            } else if (withoutSuffix) {
                return result + 'mĂ­nĂşta';
            }
            return result + 'mĂ­nĂştu';
        case 'hh':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'dĂśgum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'mĂĄnuĂ°ur';
            }
            return isFuture ? 'mĂĄnuĂ°' : 'mĂĄnuĂ°i';
        case 'MM':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'mĂĄnuĂ°ir';
                }
                return result + (isFuture ? 'mĂĄnuĂ°i' : 'mĂĄnuĂ°um');
            } else if (withoutSuffix) {
                return result + 'mĂĄnuĂ°ur';
            }
            return result + (isFuture ? 'mĂĄnuĂ°' : 'mĂĄnuĂ°i');
        case 'y':
            return withoutSuffix || isFuture ? 'ĂĄr' : 'ĂĄri';
        case 'yy':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'ĂĄr' : 'ĂĄrum');
            }
            return result + (withoutSuffix || isFuture ? 'ĂĄr' : 'ĂĄri');
        }
    }

    var is = moment__default.defineLocale('is', {
        months : 'janĂşar_febrĂşar_mars_aprĂ­l_maĂ­_jĂşnĂ­_jĂşlĂ­_ĂĄgĂşst_september_oktĂłber_nĂłvember_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maĂ­_jĂşn_jĂşl_ĂĄgĂş_sep_okt_nĂłv_des'.split('_'),
        weekdays : 'sunnudagur_mĂĄnudagur_ĂžriĂ°judagur_miĂ°vikudagur_fimmtudagur_fĂśstudagur_laugardagur'.split('_'),
        weekdaysShort : 'sun_mĂĄn_Ăžri_miĂ°_fim_fĂśs_lau'.split('_'),
        weekdaysMin : 'Su_MĂĄ_Ăr_Mi_Fi_FĂś_La'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] H:mm',
            LLLL : 'dddd, D. MMMM YYYY [kl.] H:mm'
        },
        calendar : {
            sameDay : '[Ă­ dag kl.] LT',
            nextDay : '[ĂĄ morgun kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[Ă­ gĂŚr kl.] LT',
            lastWeek : '[sĂ­Ă°asta] dddd [kl.] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'eftir %s',
            past : 'fyrir %s sĂ­Ă°an',
            s : is__translate,
            m : is__translate,
            mm : is__translate,
            h : 'klukkustund',
            hh : is__translate,
            d : is__translate,
            dd : is__translate,
            M : is__translate,
            MM : is__translate,
            y : is__translate,
            yy : is__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : italian (it)
    //! author : Lorenzo : https://github.com/aliem
    //! author: Mattia Larentis: https://github.com/nostalgiaz

    var it = moment__default.defineLocale('it', {
        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
        weekdays : 'Domenica_LunedĂŹ_MartedĂŹ_MercoledĂŹ_GiovedĂŹ_VenerdĂŹ_Sabato'.split('_'),
        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Me_Gi_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[la scorsa] dddd [alle] LT';
                    default:
                        return '[lo scorso] dddd [alle] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : function (s) {
                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
            },
            past : '%s fa',
            s : 'alcuni secondi',
            m : 'un minuto',
            mm : '%d minuti',
            h : 'un\'ora',
            hh : '%d ore',
            d : 'un giorno',
            dd : '%d giorni',
            M : 'un mese',
            MM : '%d mesi',
            y : 'un anno',
            yy : '%d anni'
        },
        ordinalParse : /\d{1,2}Âş/,
        ordinal: '%dÂş',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : japanese (ja)
    //! author : LI Long : https://github.com/baryon

    var ja = moment__default.defineLocale('ja', {
        months : '1ć_2ć_3ć_4ć_5ć_6ć_7ć_8ć_9ć_10ć_11ć_12ć'.split('_'),
        monthsShort : '1ć_2ć_3ć_4ć_5ć_6ć_7ć_8ć_9ć_10ć_11ć_12ć'.split('_'),
        weekdays : 'ćĽććĽ_ćććĽ_çŤććĽ_ć°´ććĽ_ć¨ććĽ_éććĽ_ĺććĽ'.split('_'),
        weekdaysShort : 'ćĽ_ć_çŤ_ć°´_ć¨_é_ĺ'.split('_'),
        weekdaysMin : 'ćĽ_ć_çŤ_ć°´_ć¨_é_ĺ'.split('_'),
        longDateFormat : {
            LT : 'Ahćmĺ',
            LTS : 'Ahćmĺsç§',
            L : 'YYYY/MM/DD',
            LL : 'YYYYĺš´MćDćĽ',
            LLL : 'YYYYĺš´MćDćĽAhćmĺ',
            LLLL : 'YYYYĺš´MćDćĽAhćmĺ dddd'
        },
        meridiemParse: /ĺĺ|ĺĺž/i,
        isPM : function (input) {
            return input === 'ĺĺž';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ĺĺ';
            } else {
                return 'ĺĺž';
            }
        },
        calendar : {
            sameDay : '[äťćĽ] LT',
            nextDay : '[ććĽ] LT',
            nextWeek : '[ćĽéą]dddd LT',
            lastDay : '[ć¨ćĽ] LT',
            lastWeek : '[ĺéą]dddd LT',
            sameElse : 'L'
        },
        ordinalParse : /\d{1,2}ćĽ/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + 'ćĽ';
            default:
                return number;
            }
        },
        relativeTime : {
            future : '%sĺž',
            past : '%sĺ',
            s : 'ć°ç§',
            m : '1ĺ',
            mm : '%dĺ',
            h : '1ćé',
            hh : '%dćé',
            d : '1ćĽ',
            dd : '%dćĽ',
            M : '1ăść',
            MM : '%dăść',
            y : '1ĺš´',
            yy : '%dĺš´'
        }
    });

    //! moment.js locale configuration
    //! locale : Boso Jowo (jv)
    //! author : Rony Lantip : https://github.com/lantip
    //! reference: http://jv.wikipedia.org/wiki/Basa_Jawa

    var jv = moment__default.defineLocale('jv', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
        weekdays : 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /enjing|siyang|sonten|ndalu/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'enjing') {
                return hour;
            } else if (meridiem === 'siyang') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'sonten' || meridiem === 'ndalu') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'enjing';
            } else if (hours < 15) {
                return 'siyang';
            } else if (hours < 19) {
                return 'sonten';
            } else {
                return 'ndalu';
            }
        },
        calendar : {
            sameDay : '[Dinten puniko pukul] LT',
            nextDay : '[Mbenjang pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kala wingi pukul] LT',
            lastWeek : 'dddd [kepengker pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'wonten ing %s',
            past : '%s ingkang kepengker',
            s : 'sawetawis detik',
            m : 'setunggal menit',
            mm : '%d menit',
            h : 'setunggal jam',
            hh : '%d jam',
            d : 'sedinten',
            dd : '%d dinten',
            M : 'sewulan',
            MM : '%d wulan',
            y : 'setaun',
            yy : '%d taun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Georgian (ka)
    //! author : Irakli Janiashvili : https://github.com/irakli-janiashvili

    var ka = moment__default.defineLocale('ka', {
        months : {
            standalone: 'áááááá á_ááááá áááá_ááá á˘á_ááá ááá_ááááĄá_áááááĄá_áááááĄá_áááááĄá˘á_áĄááĽá˘ááááá á_ááĽá˘ááááá á_ááááááá á_áááááááá á'.split('_'),
            format: 'áááááá áĄ_ááááá ááááĄ_ááá á˘áĄ_ááá ááááĄ_ááááĄáĄ_áááááĄáĄ_áááááĄáĄ_áááááĄá˘áĄ_áĄááĽá˘ááááá áĄ_ááĽá˘ááááá áĄ_ááááááá áĄ_áááááááá áĄ'.split('_')
        },
        monthsShort : 'ááá_ááá_ááá _ááá _ááá_ááá_ááá_ááá_áĄááĽ_ááĽá˘_ááá_ááá'.split('_'),
        weekdays : {
            standalone: 'áááá á_áá á¨ááááá_áĄááá¨ááááá_áááŽá¨ááááá_áŽáŁáá¨ááááá_ááá ááĄáááá_á¨ááááá'.split('_'),
            format: 'áááá ááĄ_áá á¨áááááĄ_áĄááá¨áááááĄ_áááŽá¨áááááĄ_áŽáŁáá¨áááááĄ_ááá ááĄááááĄ_á¨áááááĄ'.split('_'),
            isFormat: /(áŹááá|á¨ááááá)/
        },
        weekdaysShort : 'ááá_áá á¨_áĄáá_áááŽ_áŽáŁá_ááá _á¨áá'.split('_'),
        weekdaysMin : 'áá_áá _áĄá_áá_áŽáŁ_áá_á¨á'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendar : {
            sameDay : '[ááŚááĄ] LT[-áá]',
            nextDay : '[áŽááá] LT[-áá]',
            lastDay : '[ááŁá¨áá] LT[-áá]',
            nextWeek : '[á¨ááááá] dddd LT[-áá]',
            lastWeek : '[áŹááá] dddd LT-áá',
            sameElse : 'L'
        },
        relativeTime : {
            future : function (s) {
                return (/(áŹááá|áŹáŁáá|áĄáááá|áŹááá)/).test(s) ?
                    s.replace(/á$/, 'á¨á') :
                    s + 'á¨á';
            },
            past : function (s) {
                if ((/(áŹááá|áŹáŁáá|áĄáááá|ááŚá|ááá)/).test(s)) {
                    return s.replace(/(á|á)$/, 'ááĄ áŹáá');
                }
                if ((/áŹááá/).test(s)) {
                    return s.replace(/áŹááá$/, 'áŹáááĄ áŹáá');
                }
            },
            s : 'á áááááááá áŹááá',
            m : 'áŹáŁáá',
            mm : '%d áŹáŁáá',
            h : 'áĄáááá',
            hh : '%d áĄáááá',
            d : 'ááŚá',
            dd : '%d ááŚá',
            M : 'ááá',
            MM : '%d ááá',
            y : 'áŹááá',
            yy : '%d áŹááá'
        },
        ordinalParse: /0|1-áá|áá-\d{1,2}|\d{1,2}-á/,
        ordinal : function (number) {
            if (number === 0) {
                return number;
            }
            if (number === 1) {
                return number + '-áá';
            }
            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
                return 'áá-' + number;
            }
            return number + '-á';
        },
        week : {
            dow : 1,
            doy : 7
        }
    });

    //! moment.js locale configuration
    //! locale : kazakh (kk)
    //! authors : Nurlan Rakhimzhanov : https://github.com/nurlan

    var kk__suffixes = {
        0: '-ŃŃ',
        1: '-ŃŃ',
        2: '-ŃŃ',
        3: '-ŃŃ',
        4: '-ŃŃ',
        5: '-ŃŃ',
        6: '-ŃŃ',
        7: '-ŃŃ',
        8: '-ŃŃ',
        9: '-ŃŃ',
        10: '-ŃŃ',
        20: '-ŃŃ',
        30: '-ŃŃ',
        40: '-ŃŃ',
        50: '-ŃŃ',
        60: '-ŃŃ',
        70: '-ŃŃ',
        80: '-ŃŃ',
        90: '-ŃŃ',
        100: '-ŃŃ'
    };

    var kk = moment__default.defineLocale('kk', {
        months : 'ŇĐ°ŇŁŃĐ°Ń_ĐŇĐżĐ°Đ˝_ĐĐ°ŃŃŃĐˇ_ĐĄÓŃŃŃ_ĐĐ°ĐźŃŃ_ĐĐ°ŃŃŃĐź_Đ¨ŃĐťĐ´Đľ_Đ˘Đ°ĐźŃĐˇ_ŇŃŃĐşŇŻĐšĐľĐş_ŇĐ°ĐˇĐ°Đ˝_ŇĐ°ŃĐ°ŃĐ°_ĐĐľĐťŃĐžŇŃĐ°Đ˝'.split('_'),
        monthsShort : 'ŇĐ°ŇŁ_ĐŇĐż_ĐĐ°Ń_ĐĄÓŃ_ĐĐ°Đź_ĐĐ°Ń_Đ¨ŃĐť_Đ˘Đ°Đź_ŇŃŃ_ŇĐ°Đˇ_ŇĐ°Ń_ĐĐľĐť'.split('_'),
        weekdays : 'ĐĐľĐşŃĐľĐ˝ĐąŃ_ĐŇŻĐšŃĐľĐ˝ĐąŃ_ĐĄĐľĐšŃĐľĐ˝ĐąŃ_ĐĄÓŃŃĐľĐ˝ĐąŃ_ĐĐľĐšŃĐľĐ˝ĐąŃ_ĐŇąĐźĐ°_ĐĄĐľĐ˝ĐąŃ'.split('_'),
        weekdaysShort : 'ĐĐľĐş_ĐŇŻĐš_ĐĄĐľĐš_ĐĄÓŃ_ĐĐľĐš_ĐŇąĐź_ĐĄĐľĐ˝'.split('_'),
        weekdaysMin : 'ĐĐş_ĐĐš_ĐĄĐš_ĐĄŃ_ĐĐš_ĐĐź_ĐĄĐ˝'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[ĐŇŻĐłŃĐ˝ ŃĐ°ŇĐ°Ń] LT',
            nextDay : '[ĐŃŃĐľŇŁ ŃĐ°ŇĐ°Ń] LT',
            nextWeek : 'dddd [ŃĐ°ŇĐ°Ń] LT',
            lastDay : '[ĐĐľŃĐľ ŃĐ°ŇĐ°Ń] LT',
            lastWeek : '[Ó¨ŃĐşĐľĐ˝ Đ°ĐżŃĐ°Đ˝ŃŇŁ] dddd [ŃĐ°ŇĐ°Ń] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŃŃŃĐ˝Đ´Đľ',
            past : '%s ĐąŇąŃŃĐ˝',
            s : 'ĐąŃŃĐ˝ĐľŃĐľ ŃĐľĐşŃĐ˝Đ´',
            m : 'ĐąŃŃ ĐźĐ¸Đ˝ŃŃ',
            mm : '%d ĐźĐ¸Đ˝ŃŃ',
            h : 'ĐąŃŃ ŃĐ°ŇĐ°Ń',
            hh : '%d ŃĐ°ŇĐ°Ń',
            d : 'ĐąŃŃ ĐşŇŻĐ˝',
            dd : '%d ĐşŇŻĐ˝',
            M : 'ĐąŃŃ Đ°Đš',
            MM : '%d Đ°Đš',
            y : 'ĐąŃŃ ĐśŃĐť',
            yy : '%d ĐśŃĐť'
        },
        ordinalParse: /\d{1,2}-(ŃŃ|ŃŃ)/,
        ordinal : function (number) {
            var a = number % 10,
                b = number >= 100 ? 100 : null;
            return number + (kk__suffixes[number] || kk__suffixes[a] || kk__suffixes[b]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : khmer (km)
    //! author : Kruy Vanna : https://github.com/kruyvanna

    var km = moment__default.defineLocale('km', {
        months: 'ááááś_ááťáááá_ááˇááś_ááááś_á§áááś_ááˇááťááś_ááááááś_áá¸á áś_áááááś_ááťááś_ááˇááááˇááś_ááááź'.split('_'),
        monthsShort: 'ááááś_ááťáááá_ááˇááś_ááááś_á§áááś_ááˇááťááś_ááááááś_áá¸á áś_áááááś_ááťááś_ááˇááááˇááś_ááááź'.split('_'),
        weekdays: 'á˘áśááˇááá_ááááá_á˘ááááśá_ááťá_áááá áááááˇá_ááťááá_áááá'.split('_'),
        weekdaysShort: 'á˘áśááˇááá_ááááá_á˘ááááśá_ááťá_áááá áááááˇá_ááťááá_áááá'.split('_'),
        weekdaysMin: 'á˘áśááˇááá_ááááá_á˘ááááśá_ááťá_áááá áááááˇá_ááťááá_áááá'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[ááááááá áááá] LT',
            nextDay: '[ááá˘áá áááá] LT',
            nextWeek: 'dddd [áááá] LT',
            lastDay: '[ááááˇáááˇá áááá] LT',
            lastWeek: 'dddd [áááááśá áááťá] [áááá] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%sááá',
            past: '%sááťá',
            s: 'áááťááááśáááˇááśáá¸',
            m: 'áá˝áááśáá¸',
            mm: '%d ááśáá¸',
            h: 'áá˝ááááá',
            hh: '%d áááá',
            d: 'áá˝ááááá',
            dd: '%d áááá',
            M: 'áá˝ááá',
            MM: '%d áá',
            y: 'áá˝áááááśá',
            yy: '%d ááááśá'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : korean (ko)
    //!
    //! authors
    //!
    //! - Kyungwook, Park : https://github.com/kyungw00k
    //! - Jeeeyul Lee <jeeeyul@gmail.com>

    var ko = moment__default.defineLocale('ko', {
        months : '1ě_2ě_3ě_4ě_5ě_6ě_7ě_8ě_9ě_10ě_11ě_12ě'.split('_'),
        monthsShort : '1ě_2ě_3ě_4ě_5ě_6ě_7ě_8ě_9ě_10ě_11ě_12ě'.split('_'),
        weekdays : 'ěźěěź_ěěěź_íěěź_ěěěź_ëŞŠěěź_ę¸ěěź_í ěěź'.split('_'),
        weekdaysShort : 'ěź_ě_í_ě_ëŞŠ_ę¸_í '.split('_'),
        weekdaysMin : 'ěź_ě_í_ě_ëŞŠ_ę¸_í '.split('_'),
        longDateFormat : {
            LT : 'A hě mëś',
            LTS : 'A hě mëś sě´',
            L : 'YYYY.MM.DD',
            LL : 'YYYYë MMMM Děź',
            LLL : 'YYYYë MMMM Děź A hě mëś',
            LLLL : 'YYYYë MMMM Děź dddd A hě mëś'
        },
        calendar : {
            sameDay : 'ě¤ë LT',
            nextDay : 'ë´ěź LT',
            nextWeek : 'dddd LT',
            lastDay : 'ě´ě  LT',
            lastWeek : 'ě§ëěŁź dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s í',
            past : '%s ě ',
            s : 'ëŞě´',
            ss : '%dě´',
            m : 'ěźëś',
            mm : '%dëś',
            h : 'íěę°',
            hh : '%děę°',
            d : 'íëŁ¨',
            dd : '%děź',
            M : 'íëŹ',
            MM : '%dëŹ',
            y : 'ěźë',
            yy : '%dë'
        },
        ordinalParse : /\d{1,2}ěź/,
        ordinal : '%děź',
        meridiemParse : /ě¤ě |ě¤í/,
        isPM : function (token) {
            return token === 'ě¤í';
        },
        meridiem : function (hour, minute, isUpper) {
            return hour < 12 ? 'ě¤ě ' : 'ě¤í';
        }
    });

    //! moment.js locale configuration
    //! locale : Luxembourgish (lb)
    //! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

    function lb__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eng Minutt', 'enger Minutt'],
            'h': ['eng Stonn', 'enger Stonn'],
            'd': ['een Dag', 'engem Dag'],
            'M': ['ee Mount', 'engem Mount'],
            'y': ['ee Joer', 'engem Joer']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }
    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }
    /**
     * Returns true if the word before the given number loses the '-n' ending.
     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
     *
     * @param number {integer}
     * @returns {boolean}
     */
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            // Negative Number --> always true
            return true;
        } else if (number < 10) {
            // Only 1 digit
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            // 2 digits
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            // 3 or 4 digits --> recursively check first digit
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            // Anything larger than 4 digits: recursively check first n-3 digits
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }

    var lb = moment__default.defineLocale('lb', {
        months: 'Januar_Februar_MĂ¤erz_AbrĂŤll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_MĂŠindeg_DĂŤnschdeg_MĂŤttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._MĂŠ._DĂŤ._MĂŤ._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_MĂŠ_DĂŤ_MĂŤ_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            LTS: 'H:mm:ss [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm [Auer]',
            LLLL: 'dddd, D. MMMM YYYY H:mm [Auer]'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[GĂŤschter um] LT',
            lastWeek: function () {
                // Different date string for 'DĂŤnschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                switch (this.day()) {
                    case 2:
                    case 4:
                        return '[Leschten] dddd [um] LT';
                    default:
                        return '[Leschte] dddd [um] LT';
                }
            }
        },
        relativeTime : {
            future : processFutureTime,
            past : processPastTime,
            s : 'e puer Sekonnen',
            m : lb__processRelativeTime,
            mm : '%d Minutten',
            h : lb__processRelativeTime,
            hh : '%d Stonnen',
            d : lb__processRelativeTime,
            dd : '%d Deeg',
            M : lb__processRelativeTime,
            MM : '%d MĂŠint',
            y : lb__processRelativeTime,
            yy : '%d Joer'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : lao (lo)
    //! author : Ryan Hart : https://github.com/ryanhart2

    var lo = moment__default.defineLocale('lo', {
        months : 'ŕşĄŕşąŕşŕşŕş­ŕş_ŕşŕş¸ŕşĄŕşŕş˛_ŕşĄŕşľŕşŕş˛_ŕťŕşĄŕşŞŕş˛_ŕşŕşśŕşŕşŞŕş°ŕşŕş˛_ŕşĄŕş´ŕşŕş¸ŕşŕş˛_ŕşŕťŕşĽŕş°ŕşŕşťŕş_ŕşŞŕş´ŕşŕşŤŕş˛_ŕşŕşąŕşŕşŕş˛_ŕşŕş¸ŕşĽŕş˛_ŕşŕş°ŕşŕş´ŕş_ŕşŕşąŕşŕş§ŕş˛'.split('_'),
        monthsShort : 'ŕşĄŕşąŕşŕşŕş­ŕş_ŕşŕş¸ŕşĄŕşŕş˛_ŕşĄŕşľŕşŕş˛_ŕťŕşĄŕşŞŕş˛_ŕşŕşśŕşŕşŞŕş°ŕşŕş˛_ŕşĄŕş´ŕşŕş¸ŕşŕş˛_ŕşŕťŕşĽŕş°ŕşŕşťŕş_ŕşŞŕş´ŕşŕşŤŕş˛_ŕşŕşąŕşŕşŕş˛_ŕşŕş¸ŕşĽŕş˛_ŕşŕş°ŕşŕş´ŕş_ŕşŕşąŕşŕş§ŕş˛'.split('_'),
        weekdays : 'ŕş­ŕş˛ŕşŕş´ŕş_ŕşŕşąŕş_ŕş­ŕşąŕşŕşŕş˛ŕş_ŕşŕş¸ŕş_ŕşŕş°ŕşŤŕşąŕş_ŕşŞŕş¸ŕş_ŕťŕşŞŕşťŕş˛'.split('_'),
        weekdaysShort : 'ŕşŕş´ŕş_ŕşŕşąŕş_ŕş­ŕşąŕşŕşŕş˛ŕş_ŕşŕş¸ŕş_ŕşŕş°ŕşŤŕşąŕş_ŕşŞŕş¸ŕş_ŕťŕşŞŕşťŕş˛'.split('_'),
        weekdaysMin : 'ŕş_ŕş_ŕş­ŕş_ŕş_ŕşŕşŤ_ŕşŞŕş_ŕşŞ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'ŕş§ŕşąŕşdddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /ŕşŕş­ŕşŕťŕşŕşťŕťŕş˛|ŕşŕş­ŕşŕťŕşĽŕş/,
        isPM: function (input) {
            return input === 'ŕşŕş­ŕşŕťŕşĽŕş';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ŕşŕş­ŕşŕťŕşŕşťŕťŕş˛';
            } else {
                return 'ŕşŕş­ŕşŕťŕşĽŕş';
            }
        },
        calendar : {
            sameDay : '[ŕşĄŕşˇŕťŕşŕşľŕťŕťŕş§ŕşĽŕş˛] LT',
            nextDay : '[ŕşĄŕşˇŕťŕş­ŕşˇŕťŕşŕťŕş§ŕşĽŕş˛] LT',
            nextWeek : '[ŕş§ŕşąŕş]dddd[ŕťŕťŕş˛ŕťŕş§ŕşĽŕş˛] LT',
            lastDay : '[ŕşĄŕşˇŕťŕş§ŕş˛ŕşŕşŕşľŕťŕťŕş§ŕşĽŕş˛] LT',
            lastWeek : '[ŕş§ŕşąŕş]dddd[ŕťŕşĽŕťŕş§ŕşŕşľŕťŕťŕş§ŕşĽŕş˛] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ŕş­ŕşľŕş %s',
            past : '%sŕşŕťŕş˛ŕşŕşĄŕş˛',
            s : 'ŕşŕťŕťŕťŕşŕşťŕťŕş˛ŕťŕşŕş§ŕş´ŕşŕş˛ŕşŕşľ',
            m : '1 ŕşŕş˛ŕşŕşľ',
            mm : '%d ŕşŕş˛ŕşŕşľ',
            h : '1 ŕşŕşťŕťŕş§ŕťŕşĄŕş',
            hh : '%d ŕşŕşťŕťŕş§ŕťŕşĄŕş',
            d : '1 ŕşĄŕşˇŕť',
            dd : '%d ŕşĄŕşˇŕť',
            M : '1 ŕťŕşŕşˇŕş­ŕş',
            MM : '%d ŕťŕşŕşˇŕş­ŕş',
            y : '1 ŕşŕşľ',
            yy : '%d ŕşŕşľ'
        },
        ordinalParse: /(ŕşŕşľŕť)\d{1,2}/,
        ordinal : function (number) {
            return 'ŕşŕşľŕť' + number;
        }
    });

    //! moment.js locale configuration
    //! locale : Lithuanian (lt)
    //! author : Mindaugas MozĹŤras : https://github.com/mmozuras

    var lt__units = {
        'm' : 'minutÄ_minutÄs_minutÄ',
        'mm': 'minutÄs_minuÄiĹł_minutes',
        'h' : 'valanda_valandos_valandÄ',
        'hh': 'valandos_valandĹł_valandas',
        'd' : 'diena_dienos_dienÄ',
        'dd': 'dienos_dienĹł_dienas',
        'M' : 'mÄnuo_mÄnesio_mÄnesÄŻ',
        'MM': 'mÄnesiai_mÄnesiĹł_mÄnesius',
        'y' : 'metai_metĹł_metus',
        'yy': 'metai_metĹł_metus'
    };
    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekundÄs';
        } else {
            return isFuture ? 'keliĹł sekundĹžiĹł' : 'kelias sekundes';
        }
    }
    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
    }
    function special(number) {
        return number % 10 === 0 || (number > 10 && number < 20);
    }
    function forms(key) {
        return lt__units[key].split('_');
    }
    function lt__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }
    var lt = moment__default.defineLocale('lt', {
        months : {
            format: 'sausio_vasario_kovo_balandĹžio_geguĹžÄs_birĹželio_liepos_rugpjĹŤÄio_rugsÄjo_spalio_lapkriÄio_gruodĹžio'.split('_'),
            standalone: 'sausis_vasaris_kovas_balandis_geguĹžÄ_birĹželis_liepa_rugpjĹŤtis_rugsÄjis_spalis_lapkritis_gruodis'.split('_')
        },
        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
        weekdays : {
            format: 'sekmadienÄŻ_pirmadienÄŻ_antradienÄŻ_treÄiadienÄŻ_ketvirtadienÄŻ_penktadienÄŻ_ĹĄeĹĄtadienÄŻ'.split('_'),
            standalone: 'sekmadienis_pirmadienis_antradienis_treÄiadienis_ketvirtadienis_penktadienis_ĹĄeĹĄtadienis'.split('_'),
            isFormat: /dddd HH:mm/
        },
        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_Ĺ eĹĄ'.split('_'),
        weekdaysMin : 'S_P_A_T_K_Pn_Ĺ '.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY [m.] MMMM D [d.]',
            LLL : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            LLLL : 'YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]',
            l : 'YYYY-MM-DD',
            ll : 'YYYY [m.] MMMM D [d.]',
            lll : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            llll : 'YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]'
        },
        calendar : {
            sameDay : '[Ĺ iandien] LT',
            nextDay : '[Rytoj] LT',
            nextWeek : 'dddd LT',
            lastDay : '[Vakar] LT',
            lastWeek : '[PraÄjusÄŻ] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'po %s',
            past : 'prieĹĄ %s',
            s : translateSeconds,
            m : translateSingular,
            mm : lt__translate,
            h : translateSingular,
            hh : lt__translate,
            d : translateSingular,
            dd : lt__translate,
            M : translateSingular,
            MM : lt__translate,
            y : translateSingular,
            yy : lt__translate
        },
        ordinalParse: /\d{1,2}-oji/,
        ordinal : function (number) {
            return number + '-oji';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : latvian (lv)
    //! author : Kristaps Karlsons : https://github.com/skakri
    //! author : JÄnis Elmeris : https://github.com/JanisE

    var lv__units = {
        'm': 'minĹŤtes_minĹŤtÄm_minĹŤte_minĹŤtes'.split('_'),
        'mm': 'minĹŤtes_minĹŤtÄm_minĹŤte_minĹŤtes'.split('_'),
        'h': 'stundas_stundÄm_stunda_stundas'.split('_'),
        'hh': 'stundas_stundÄm_stunda_stundas'.split('_'),
        'd': 'dienas_dienÄm_diena_dienas'.split('_'),
        'dd': 'dienas_dienÄm_diena_dienas'.split('_'),
        'M': 'mÄneĹĄa_mÄneĹĄiem_mÄnesis_mÄneĹĄi'.split('_'),
        'MM': 'mÄneĹĄa_mÄneĹĄiem_mÄnesis_mÄneĹĄi'.split('_'),
        'y': 'gada_gadiem_gads_gadi'.split('_'),
        'yy': 'gada_gadiem_gads_gadi'.split('_')
    };
    /**
     * @param withoutSuffix boolean true = a length of time; false = before/after a period of time.
     */
    function lv__format(forms, number, withoutSuffix) {
        if (withoutSuffix) {
            // E.g. "21 minĹŤte", "3 minĹŤtes".
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            // E.g. "21 minĹŤtes" as in "pÄc 21 minĹŤtes".
            // E.g. "3 minĹŤtÄm" as in "pÄc 3 minĹŤtÄm".
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }
    function lv__relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeTimeWithSingular(number, withoutSuffix, key) {
        return lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeSeconds(number, withoutSuffix) {
        return withoutSuffix ? 'daĹžas sekundes' : 'daĹžÄm sekundÄm';
    }

    var lv = moment__default.defineLocale('lv', {
        months : 'janvÄris_februÄris_marts_aprÄŤlis_maijs_jĹŤnijs_jĹŤlijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jĹŤn_jĹŤl_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'svÄtdiena_pirmdiena_otrdiena_treĹĄdiena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY.',
            LL : 'YYYY. [gada] D. MMMM',
            LLL : 'YYYY. [gada] D. MMMM, HH:mm',
            LLLL : 'YYYY. [gada] D. MMMM, dddd, HH:mm'
        },
        calendar : {
            sameDay : '[Ĺ odien pulksten] LT',
            nextDay : '[RÄŤt pulksten] LT',
            nextWeek : 'dddd [pulksten] LT',
            lastDay : '[Vakar pulksten] LT',
            lastWeek : '[PagÄjuĹĄÄ] dddd [pulksten] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'pÄc %s',
            past : 'pirms %s',
            s : relativeSeconds,
            m : relativeTimeWithSingular,
            mm : lv__relativeTimeWithPlural,
            h : relativeTimeWithSingular,
            hh : lv__relativeTimeWithPlural,
            d : relativeTimeWithSingular,
            dd : lv__relativeTimeWithPlural,
            M : relativeTimeWithSingular,
            MM : lv__relativeTimeWithPlural,
            y : relativeTimeWithSingular,
            yy : lv__relativeTimeWithPlural
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Montenegrin (me)
    //! author : Miodrag NikaÄ <miodrag@restartit.me> : https://github.com/miodragnikac

    var me__translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jednog minuta'],
            mm: ['minut', 'minuta', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mjesec', 'mjeseca', 'mjeseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = me__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + me__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var me = moment__default.defineLocale('me', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'Äetvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sri.', 'Äet.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'Äe', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sjutra u] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄe u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[proĹĄle] [nedjelje] [u] LT',
                    '[proĹĄlog] [ponedjeljka] [u] LT',
                    '[proĹĄlog] [utorka] [u] LT',
                    '[proĹĄle] [srijede] [u] LT',
                    '[proĹĄlog] [Äetvrtka] [u] LT',
                    '[proĹĄlog] [petka] [u] LT',
                    '[proĹĄle] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'nekoliko sekundi',
            m      : me__translator.translate,
            mm     : me__translator.translate,
            h      : me__translator.translate,
            hh     : me__translator.translate,
            d      : 'dan',
            dd     : me__translator.translate,
            M      : 'mjesec',
            MM     : me__translator.translate,
            y      : 'godinu',
            yy     : me__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : macedonian (mk)
    //! author : Borislav Mickov : https://github.com/B0k0

    var mk = moment__default.defineLocale('mk', {
        months : 'ŃĐ°Đ˝ŃĐ°ŃĐ¸_ŃĐľĐ˛ŃŃĐ°ŃĐ¸_ĐźĐ°ŃŃ_Đ°ĐżŃĐ¸Đť_ĐźĐ°Ń_ŃŃĐ˝Đ¸_ŃŃĐťĐ¸_Đ°Đ˛ĐłŃŃŃ_ŃĐľĐżŃĐľĐźĐ˛ŃĐ¸_ĐžĐşŃĐžĐźĐ˛ŃĐ¸_Đ˝ĐžĐľĐźĐ˛ŃĐ¸_Đ´ĐľĐşĐľĐźĐ˛ŃĐ¸'.split('_'),
        monthsShort : 'ŃĐ°Đ˝_ŃĐľĐ˛_ĐźĐ°Ń_Đ°ĐżŃ_ĐźĐ°Ń_ŃŃĐ˝_ŃŃĐť_Đ°Đ˛Đł_ŃĐľĐż_ĐžĐşŃ_Đ˝ĐžĐľ_Đ´ĐľĐş'.split('_'),
        weekdays : 'Đ˝ĐľĐ´ĐľĐťĐ°_ĐżĐžĐ˝ĐľĐ´ĐľĐťĐ˝Đ¸Đş_Đ˛ŃĐžŃĐ˝Đ¸Đş_ŃŃĐľĐ´Đ°_ŃĐľŃĐ˛ŃŃĐžĐş_ĐżĐľŃĐžĐş_ŃĐ°ĐąĐžŃĐ°'.split('_'),
        weekdaysShort : 'Đ˝ĐľĐ´_ĐżĐžĐ˝_Đ˛ŃĐž_ŃŃĐľ_ŃĐľŃ_ĐżĐľŃ_ŃĐ°Đą'.split('_'),
        weekdaysMin : 'Đ˝e_Đżo_Đ˛Ń_ŃŃ_ŃĐľ_ĐżĐľ_Ńa'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : '[ĐĐľĐ˝ĐľŃ Đ˛Đž] LT',
            nextDay : '[ĐŁŃŃĐľ Đ˛Đž] LT',
            nextWeek : '[ĐĐž] dddd [Đ˛Đž] LT',
            lastDay : '[ĐŃĐľŃĐ° Đ˛Đž] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[ĐĐˇĐźĐ¸Đ˝Đ°ŃĐ°ŃĐ°] dddd [Đ˛Đž] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[ĐĐˇĐźĐ¸Đ˝Đ°ŃĐ¸ĐžŃ] dddd [Đ˛Đž] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ĐżĐžŃĐťĐľ %s',
            past : 'ĐżŃĐľĐ´ %s',
            s : 'Đ˝ĐľĐşĐžĐťĐşŃ ŃĐľĐşŃĐ˝Đ´Đ¸',
            m : 'ĐźĐ¸Đ˝ŃŃĐ°',
            mm : '%d ĐźĐ¸Đ˝ŃŃĐ¸',
            h : 'ŃĐ°Ń',
            hh : '%d ŃĐ°ŃĐ°',
            d : 'Đ´ĐľĐ˝',
            dd : '%d Đ´ĐľĐ˝Đ°',
            M : 'ĐźĐľŃĐľŃ',
            MM : '%d ĐźĐľŃĐľŃĐ¸',
            y : 'ĐłĐžĐ´Đ¸Đ˝Đ°',
            yy : '%d ĐłĐžĐ´Đ¸Đ˝Đ¸'
        },
        ordinalParse: /\d{1,2}-(ĐľĐ˛|ĐľĐ˝|ŃĐ¸|Đ˛Đ¸|ŃĐ¸|ĐźĐ¸)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ĐľĐ˛';
            } else if (last2Digits === 0) {
                return number + '-ĐľĐ˝';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-ŃĐ¸';
            } else if (lastDigit === 1) {
                return number + '-Đ˛Đ¸';
            } else if (lastDigit === 2) {
                return number + '-ŃĐ¸';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-ĐźĐ¸';
            } else {
                return number + '-ŃĐ¸';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : malayalam (ml)
    //! author : Floyd Pink : https://github.com/floydpink

    var ml = moment__default.defineLocale('ml', {
        months : 'ŕ´ŕ´¨ŕľŕ´ľŕ´°ŕ´ż_ŕ´Ťŕľŕ´Źŕľŕ´°ŕľŕ´ľŕ´°ŕ´ż_ŕ´Žŕ´žŕľźŕ´ŕľŕ´ŕľ_ŕ´ŕ´Şŕľŕ´°ŕ´żŕľ˝_ŕ´Žŕľŕ´Żŕľ_ŕ´ŕľŕľş_ŕ´ŕľŕ´˛ŕľ_ŕ´ŕ´ŕ´¸ŕľŕ´ąŕľŕ´ąŕľ_ŕ´¸ŕľŕ´Şŕľŕ´ąŕľŕ´ąŕ´ŕ´Źŕľź_ŕ´ŕ´ŕľŕ´ŕľŕ´Źŕľź_ŕ´¨ŕ´ľŕ´ŕ´Źŕľź_ŕ´Ąŕ´żŕ´¸ŕ´ŕ´Źŕľź'.split('_'),
        monthsShort : 'ŕ´ŕ´¨ŕľ._ŕ´Ťŕľŕ´Źŕľŕ´°ŕľ._ŕ´Žŕ´žŕľź._ŕ´ŕ´Şŕľŕ´°ŕ´ż._ŕ´Žŕľŕ´Żŕľ_ŕ´ŕľŕľş_ŕ´ŕľŕ´˛ŕľ._ŕ´ŕ´._ŕ´¸ŕľŕ´Şŕľŕ´ąŕľŕ´ą._ŕ´ŕ´ŕľŕ´ŕľ._ŕ´¨ŕ´ľŕ´._ŕ´Ąŕ´żŕ´¸ŕ´.'.split('_'),
        weekdays : 'ŕ´ŕ´žŕ´Żŕ´ąŕ´žŕ´´ŕľŕ´_ŕ´¤ŕ´żŕ´ŕľŕ´ŕ´łŕ´žŕ´´ŕľŕ´_ŕ´ŕľŕ´ľŕľŕ´ľŕ´žŕ´´ŕľŕ´_ŕ´Źŕľŕ´§ŕ´¨ŕ´žŕ´´ŕľŕ´_ŕ´ľŕľŕ´Żŕ´žŕ´´ŕ´žŕ´´ŕľŕ´_ŕ´ľŕľŕ´łŕľŕ´łŕ´żŕ´Żŕ´žŕ´´ŕľŕ´_ŕ´śŕ´¨ŕ´żŕ´Żŕ´žŕ´´ŕľŕ´'.split('_'),
        weekdaysShort : 'ŕ´ŕ´žŕ´Żŕľź_ŕ´¤ŕ´żŕ´ŕľŕ´ŕľž_ŕ´ŕľŕ´ľŕľŕ´ľ_ŕ´Źŕľŕ´§ŕľť_ŕ´ľŕľŕ´Żŕ´žŕ´´ŕ´_ŕ´ľŕľŕ´łŕľŕ´łŕ´ż_ŕ´śŕ´¨ŕ´ż'.split('_'),
        weekdaysMin : 'ŕ´ŕ´ž_ŕ´¤ŕ´ż_ŕ´ŕľ_ŕ´Źŕľ_ŕ´ľŕľŕ´Żŕ´ž_ŕ´ľŕľ_ŕ´ś'.split('_'),
        longDateFormat : {
            LT : 'A h:mm -ŕ´¨ŕľ',
            LTS : 'A h:mm:ss -ŕ´¨ŕľ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm -ŕ´¨ŕľ',
            LLLL : 'dddd, D MMMM YYYY, A h:mm -ŕ´¨ŕľ'
        },
        calendar : {
            sameDay : '[ŕ´ŕ´¨ŕľŕ´¨ŕľ] LT',
            nextDay : '[ŕ´¨ŕ´žŕ´łŕľ] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕ´ŕ´¨ŕľŕ´¨ŕ´˛ŕľ] LT',
            lastWeek : '[ŕ´ŕ´´ŕ´żŕ´ŕľŕ´] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕ´ŕ´´ŕ´żŕ´ŕľŕ´ŕľ',
            past : '%s ŕ´Žŕľŕľťŕ´Şŕľ',
            s : 'ŕ´ŕľ˝ŕ´Ş ŕ´¨ŕ´żŕ´Žŕ´żŕ´ˇŕ´ŕľŕ´ŕľž',
            m : 'ŕ´ŕ´°ŕľ ŕ´Žŕ´żŕ´¨ŕ´żŕ´ąŕľŕ´ąŕľ',
            mm : '%d ŕ´Žŕ´żŕ´¨ŕ´żŕ´ąŕľŕ´ąŕľ',
            h : 'ŕ´ŕ´°ŕľ ŕ´Žŕ´Łŕ´żŕ´ŕľŕ´ŕľŕľź',
            hh : '%d ŕ´Žŕ´Łŕ´żŕ´ŕľŕ´ŕľŕľź',
            d : 'ŕ´ŕ´°ŕľ ŕ´Śŕ´żŕ´ľŕ´¸ŕ´',
            dd : '%d ŕ´Śŕ´żŕ´ľŕ´¸ŕ´',
            M : 'ŕ´ŕ´°ŕľ ŕ´Žŕ´žŕ´¸ŕ´',
            MM : '%d ŕ´Žŕ´žŕ´¸ŕ´',
            y : 'ŕ´ŕ´°ŕľ ŕ´ľŕľźŕ´ˇŕ´',
            yy : '%d ŕ´ľŕľźŕ´ˇŕ´'
        },
        meridiemParse: /ŕ´°ŕ´žŕ´¤ŕľŕ´°ŕ´ż|ŕ´°ŕ´žŕ´ľŕ´żŕ´˛ŕľ|ŕ´ŕ´ŕľŕ´ ŕ´ŕ´´ŕ´żŕ´ŕľŕ´ŕľ|ŕ´ľŕľŕ´ŕľŕ´¨ŕľŕ´¨ŕľŕ´°ŕ´|ŕ´°ŕ´žŕ´¤ŕľŕ´°ŕ´ż/i,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if ((meridiem === 'ŕ´°ŕ´žŕ´¤ŕľŕ´°ŕ´ż' && hour >= 4) ||
                    meridiem === 'ŕ´ŕ´ŕľŕ´ ŕ´ŕ´´ŕ´żŕ´ŕľŕ´ŕľ' ||
                    meridiem === 'ŕ´ľŕľŕ´ŕľŕ´¨ŕľŕ´¨ŕľŕ´°ŕ´') {
                return hour + 12;
            } else {
                return hour;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ´°ŕ´žŕ´¤ŕľŕ´°ŕ´ż';
            } else if (hour < 12) {
                return 'ŕ´°ŕ´žŕ´ľŕ´żŕ´˛ŕľ';
            } else if (hour < 17) {
                return 'ŕ´ŕ´ŕľŕ´ ŕ´ŕ´´ŕ´żŕ´ŕľŕ´ŕľ';
            } else if (hour < 20) {
                return 'ŕ´ľŕľŕ´ŕľŕ´¨ŕľŕ´¨ŕľŕ´°ŕ´';
            } else {
                return 'ŕ´°ŕ´žŕ´¤ŕľŕ´°ŕ´ż';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : Marathi (mr)
    //! author : Harshad Kale : https://github.com/kalehv
    //! author : Vivek Athalye : https://github.com/vnathalye

    var mr__symbolMap = {
        '1': 'ŕĽ§',
        '2': 'ŕĽ¨',
        '3': 'ŕĽŠ',
        '4': 'ŕĽŞ',
        '5': 'ŕĽŤ',
        '6': 'ŕĽŹ',
        '7': 'ŕĽ­',
        '8': 'ŕĽŽ',
        '9': 'ŕĽŻ',
        '0': 'ŕĽŚ'
    },
    mr__numberMap = {
        'ŕĽ§': '1',
        'ŕĽ¨': '2',
        'ŕĽŠ': '3',
        'ŕĽŞ': '4',
        'ŕĽŤ': '5',
        'ŕĽŹ': '6',
        'ŕĽ­': '7',
        'ŕĽŽ': '8',
        'ŕĽŻ': '9',
        'ŕĽŚ': '0'
    };

    function relativeTimeMr(number, withoutSuffix, string, isFuture)
    {
        var output = '';
        if (withoutSuffix) {
            switch (string) {
                case 's': output = 'ŕ¤ŕ¤žŕ¤šŕĽ ŕ¤¸ŕĽŕ¤ŕ¤ŕ¤Ś'; break;
                case 'm': output = 'ŕ¤ŕ¤ ŕ¤Žŕ¤żŕ¤¨ŕ¤żŕ¤'; break;
                case 'mm': output = '%d ŕ¤Žŕ¤żŕ¤¨ŕ¤żŕ¤ŕĽ'; break;
                case 'h': output = 'ŕ¤ŕ¤ ŕ¤¤ŕ¤žŕ¤¸'; break;
                case 'hh': output = '%d ŕ¤¤ŕ¤žŕ¤¸'; break;
                case 'd': output = 'ŕ¤ŕ¤ ŕ¤Śŕ¤żŕ¤ľŕ¤¸'; break;
                case 'dd': output = '%d ŕ¤Śŕ¤żŕ¤ľŕ¤¸'; break;
                case 'M': output = 'ŕ¤ŕ¤ ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕ¤ž'; break;
                case 'MM': output = '%d ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕĽ'; break;
                case 'y': output = 'ŕ¤ŕ¤ ŕ¤ľŕ¤°ŕĽŕ¤ˇ'; break;
                case 'yy': output = '%d ŕ¤ľŕ¤°ŕĽŕ¤ˇŕĽ'; break;
            }
        }
        else {
            switch (string) {
                case 's': output = 'ŕ¤ŕ¤žŕ¤šŕĽ ŕ¤¸ŕĽŕ¤ŕ¤ŕ¤Śŕ¤žŕ¤'; break;
                case 'm': output = 'ŕ¤ŕ¤ŕ¤ž ŕ¤Žŕ¤żŕ¤¨ŕ¤żŕ¤ŕ¤ž'; break;
                case 'mm': output = '%d ŕ¤Žŕ¤żŕ¤¨ŕ¤żŕ¤ŕ¤žŕ¤'; break;
                case 'h': output = 'ŕ¤ŕ¤ŕ¤ž ŕ¤¤ŕ¤žŕ¤¸ŕ¤ž'; break;
                case 'hh': output = '%d ŕ¤¤ŕ¤žŕ¤¸ŕ¤žŕ¤'; break;
                case 'd': output = 'ŕ¤ŕ¤ŕ¤ž ŕ¤Śŕ¤żŕ¤ľŕ¤¸ŕ¤ž'; break;
                case 'dd': output = '%d ŕ¤Śŕ¤żŕ¤ľŕ¤¸ŕ¤žŕ¤'; break;
                case 'M': output = 'ŕ¤ŕ¤ŕ¤ž ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕĽŕ¤Żŕ¤ž'; break;
                case 'MM': output = '%d ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕĽŕ¤Żŕ¤žŕ¤'; break;
                case 'y': output = 'ŕ¤ŕ¤ŕ¤ž ŕ¤ľŕ¤°ŕĽŕ¤ˇŕ¤ž'; break;
                case 'yy': output = '%d ŕ¤ľŕ¤°ŕĽŕ¤ˇŕ¤žŕ¤'; break;
            }
        }
        return output.replace(/%d/i, number);
    }

    var mr = moment__default.defineLocale('mr', {
        months : 'ŕ¤ŕ¤žŕ¤¨ŕĽŕ¤ľŕ¤žŕ¤°ŕĽ_ŕ¤ŤŕĽŕ¤ŹŕĽŕ¤°ŕĽŕ¤ľŕ¤žŕ¤°ŕĽ_ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤_ŕ¤ŕ¤ŞŕĽŕ¤°ŕ¤żŕ¤˛_ŕ¤ŽŕĽ_ŕ¤ŕĽŕ¤¨_ŕ¤ŕĽŕ¤˛ŕĽ_ŕ¤ŕ¤ŕ¤¸ŕĽŕ¤_ŕ¤¸ŕ¤ŞŕĽŕ¤ŕĽŕ¤ŕ¤Źŕ¤°_ŕ¤ŕ¤ŕĽŕ¤ŕĽŕ¤Źŕ¤°_ŕ¤¨ŕĽŕ¤ľŕĽŕ¤šŕĽŕ¤ŕ¤Źŕ¤°_ŕ¤Ąŕ¤żŕ¤¸ŕĽŕ¤ŕ¤Źŕ¤°'.split('_'),
        monthsShort: 'ŕ¤ŕ¤žŕ¤¨ŕĽ._ŕ¤ŤŕĽŕ¤ŹŕĽŕ¤°ŕĽ._ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤._ŕ¤ŕ¤ŞŕĽŕ¤°ŕ¤ż._ŕ¤ŽŕĽ._ŕ¤ŕĽŕ¤¨._ŕ¤ŕĽŕ¤˛ŕĽ._ŕ¤ŕ¤._ŕ¤¸ŕ¤ŞŕĽŕ¤ŕĽŕ¤._ŕ¤ŕ¤ŕĽŕ¤ŕĽ._ŕ¤¨ŕĽŕ¤ľŕĽŕ¤šŕĽŕ¤._ŕ¤Ąŕ¤żŕ¤¸ŕĽŕ¤.'.split('_'),
        weekdays : 'ŕ¤°ŕ¤ľŕ¤żŕ¤ľŕ¤žŕ¤°_ŕ¤¸ŕĽŕ¤Žŕ¤ľŕ¤žŕ¤°_ŕ¤Žŕ¤ŕ¤ŕ¤łŕ¤ľŕ¤žŕ¤°_ŕ¤ŹŕĽŕ¤§ŕ¤ľŕ¤žŕ¤°_ŕ¤ŕĽŕ¤°ŕĽŕ¤ľŕ¤žŕ¤°_ŕ¤śŕĽŕ¤ŕĽŕ¤°ŕ¤ľŕ¤žŕ¤°_ŕ¤śŕ¤¨ŕ¤żŕ¤ľŕ¤žŕ¤°'.split('_'),
        weekdaysShort : 'ŕ¤°ŕ¤ľŕ¤ż_ŕ¤¸ŕĽŕ¤Ž_ŕ¤Žŕ¤ŕ¤ŕ¤ł_ŕ¤ŹŕĽŕ¤§_ŕ¤ŕĽŕ¤°ŕĽ_ŕ¤śŕĽŕ¤ŕĽŕ¤°_ŕ¤śŕ¤¨ŕ¤ż'.split('_'),
        weekdaysMin : 'ŕ¤°_ŕ¤¸ŕĽ_ŕ¤Žŕ¤_ŕ¤ŹŕĽ_ŕ¤ŕĽ_ŕ¤śŕĽ_ŕ¤ś'.split('_'),
        longDateFormat : {
            LT : 'A h:mm ŕ¤ľŕ¤žŕ¤ŕ¤¤ŕ¤ž',
            LTS : 'A h:mm:ss ŕ¤ľŕ¤žŕ¤ŕ¤¤ŕ¤ž',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm ŕ¤ľŕ¤žŕ¤ŕ¤¤ŕ¤ž',
            LLLL : 'dddd, D MMMM YYYY, A h:mm ŕ¤ľŕ¤žŕ¤ŕ¤¤ŕ¤ž'
        },
        calendar : {
            sameDay : '[ŕ¤ŕ¤] LT',
            nextDay : '[ŕ¤ŕ¤ŚŕĽŕ¤Żŕ¤ž] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕ¤ŕ¤žŕ¤˛] LT',
            lastWeek: '[ŕ¤Žŕ¤žŕ¤ŕĽŕ¤˛] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future: '%sŕ¤Žŕ¤§ŕĽŕ¤ŻŕĽ',
            past: '%sŕ¤ŞŕĽŕ¤°ŕĽŕ¤ľŕĽ',
            s: relativeTimeMr,
            m: relativeTimeMr,
            mm: relativeTimeMr,
            h: relativeTimeMr,
            hh: relativeTimeMr,
            d: relativeTimeMr,
            dd: relativeTimeMr,
            M: relativeTimeMr,
            MM: relativeTimeMr,
            y: relativeTimeMr,
            yy: relativeTimeMr
        },
        preparse: function (string) {
            return string.replace(/[ŕĽ§ŕĽ¨ŕĽŠŕĽŞŕĽŤŕĽŹŕĽ­ŕĽŽŕĽŻŕĽŚ]/g, function (match) {
                return mr__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return mr__symbolMap[match];
            });
        },
        meridiemParse: /ŕ¤°ŕ¤žŕ¤¤ŕĽŕ¤°ŕĽ|ŕ¤¸ŕ¤ŕ¤žŕ¤łŕĽ|ŕ¤ŚŕĽŕ¤Şŕ¤žŕ¤°ŕĽ|ŕ¤¸ŕ¤žŕ¤Żŕ¤ŕ¤ŕ¤žŕ¤łŕĽ/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕ¤°ŕ¤žŕ¤¤ŕĽŕ¤°ŕĽ') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤¸ŕ¤ŕ¤žŕ¤łŕĽ') {
                return hour;
            } else if (meridiem === 'ŕ¤ŚŕĽŕ¤Şŕ¤žŕ¤°ŕĽ') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤¸ŕ¤žŕ¤Żŕ¤ŕ¤ŕ¤žŕ¤łŕĽ') {
                return hour + 12;
            }
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ¤°ŕ¤žŕ¤¤ŕĽŕ¤°ŕĽ';
            } else if (hour < 10) {
                return 'ŕ¤¸ŕ¤ŕ¤žŕ¤łŕĽ';
            } else if (hour < 17) {
                return 'ŕ¤ŚŕĽŕ¤Şŕ¤žŕ¤°ŕĽ';
            } else if (hour < 20) {
                return 'ŕ¤¸ŕ¤žŕ¤Żŕ¤ŕ¤ŕ¤žŕ¤łŕĽ';
            } else {
                return 'ŕ¤°ŕ¤žŕ¤¤ŕĽŕ¤°ŕĽ';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan

    var ms_my = moment__default.defineLocale('ms-my', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|tengahari|petang|malam/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'tengahari') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'petang' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan

    var locale_ms = moment__default.defineLocale('ms', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|tengahari|petang|malam/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'tengahari') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'petang' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Burmese (my)
    //! author : Squar team, mysquar.com

    var my__symbolMap = {
        '1': 'á',
        '2': 'á',
        '3': 'á',
        '4': 'á',
        '5': 'á',
        '6': 'á',
        '7': 'á',
        '8': 'á',
        '9': 'á',
        '0': 'á'
    }, my__numberMap = {
        'á': '1',
        'á': '2',
        'á': '3',
        'á': '4',
        'á': '5',
        'á': '6',
        'á': '7',
        'á': '8',
        'á': '9',
        'á': '0'
    };

    var my = moment__default.defineLocale('my', {
        months: 'áááşáááŤááŽ_ááąááąáŹáşááŤááŽ_áááş_á§ááźáŽ_ááą_áá˝ááş_áá°áá­áŻááş_ááźááŻááş_áááşáááşááŹ_áĄáąáŹááşáá­áŻááŹ_áá­áŻáááşááŹ_ááŽáááşááŹ'.split('_'),
        monthsShort: 'áááş_ááą_áááş_ááźáŽ_ááą_áá˝ááş_áá­áŻááş_ááź_áááş_áĄáąáŹááş_áá­áŻ_ááŽ'.split('_'),
        weekdays: 'ááááşášááá˝áą_ááááşášááŹ_áĄááşášááŤ_ááŻáášááá°á¸_ááźáŹááááąá¸_ááąáŹááźáŹ_áááą'.split('_'),
        weekdaysShort: 'áá˝áą_ááŹ_ááŤ_áá°á¸_ááźáŹ_ááąáŹ_ááą'.split('_'),
        weekdaysMin: 'áá˝áą_ááŹ_ááŤ_áá°á¸_ááźáŹ_ááąáŹ_ááą'.split('_'),

        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[áááą.] LT [áážáŹ]',
            nextDay: '[ááááşááźááş] LT [áážáŹ]',
            nextWeek: 'dddd LT [áážáŹ]',
            lastDay: '[áááą.á] LT [áážáŹ]',
            lastWeek: '[ááźáŽá¸áá˛áˇááąáŹ] dddd LT [áážáŹ]',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'ááŹáááşáˇ %s áážáŹ',
            past: 'áá˝ááşáá˛áˇááąáŹ %s á',
            s: 'ááášáááş.áĄáááşá¸áááş',
            m: 'áááşáá­áááş',
            mm: '%d áá­áááş',
            h: 'áááşááŹááŽ',
            hh: '%d ááŹááŽ',
            d: 'áááşáááş',
            dd: '%d áááş',
            M: 'áááşá',
            MM: '%d á',
            y: 'áááşáážááş',
            yy: '%d áážááş'
        },
        preparse: function (string) {
            return string.replace(/[áááááááááá]/g, function (match) {
                return my__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return my__symbolMap[match];
            });
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : norwegian bokmĂĽl (nb)
    //! authors : Espen Hovlandsdal : https://github.com/rexxars
    //!           Sigurd Gartmann : https://github.com/sigurdga

    var nb = moment__default.defineLocale('nb', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.'.split('_'),
        weekdays : 'sĂ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lĂ¸rdag'.split('_'),
        weekdaysShort : 'sĂ¸._ma._ti._on._to._fr._lĂ¸.'.split('_'),
        weekdaysMin : 'sĂ¸_ma_ti_on_to_fr_lĂ¸'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] HH:mm',
            LLLL : 'dddd D. MMMM YYYY [kl.] HH:mm'
        },
        calendar : {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i gĂĽr kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s siden',
            s : 'noen sekunder',
            m : 'ett minutt',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dager',
            M : 'en mĂĽned',
            MM : '%d mĂĽneder',
            y : 'ett ĂĽr',
            yy : '%d ĂĽr'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : nepali/nepalese
    //! author : suvash : https://github.com/suvash

    var ne__symbolMap = {
        '1': 'ŕĽ§',
        '2': 'ŕĽ¨',
        '3': 'ŕĽŠ',
        '4': 'ŕĽŞ',
        '5': 'ŕĽŤ',
        '6': 'ŕĽŹ',
        '7': 'ŕĽ­',
        '8': 'ŕĽŽ',
        '9': 'ŕĽŻ',
        '0': 'ŕĽŚ'
    },
    ne__numberMap = {
        'ŕĽ§': '1',
        'ŕĽ¨': '2',
        'ŕĽŠ': '3',
        'ŕĽŞ': '4',
        'ŕĽŤ': '5',
        'ŕĽŹ': '6',
        'ŕĽ­': '7',
        'ŕĽŽ': '8',
        'ŕĽŻ': '9',
        'ŕĽŚ': '0'
    };

    var ne = moment__default.defineLocale('ne', {
        months : 'ŕ¤ŕ¤¨ŕ¤ľŕ¤°ŕĽ_ŕ¤ŤŕĽŕ¤ŹŕĽŕ¤°ŕĽŕ¤ľŕ¤°ŕĽ_ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤_ŕ¤ŕ¤ŞŕĽŕ¤°ŕ¤żŕ¤˛_ŕ¤Žŕ¤_ŕ¤ŕĽŕ¤¨_ŕ¤ŕĽŕ¤˛ŕ¤žŕ¤_ŕ¤ŕ¤ŕ¤ˇŕĽŕ¤_ŕ¤¸ŕĽŕ¤ŞŕĽŕ¤ŕĽŕ¤ŽŕĽŕ¤Źŕ¤°_ŕ¤ŕ¤ŕĽŕ¤ŕĽŕ¤Źŕ¤°_ŕ¤¨ŕĽŕ¤­ŕĽŕ¤ŽŕĽŕ¤Źŕ¤°_ŕ¤Ąŕ¤żŕ¤¸ŕĽŕ¤ŽŕĽŕ¤Źŕ¤°'.split('_'),
        monthsShort : 'ŕ¤ŕ¤¨._ŕ¤ŤŕĽŕ¤ŹŕĽŕ¤°ŕĽ._ŕ¤Žŕ¤žŕ¤°ŕĽŕ¤_ŕ¤ŕ¤ŞŕĽŕ¤°ŕ¤ż._ŕ¤Žŕ¤_ŕ¤ŕĽŕ¤¨_ŕ¤ŕĽŕ¤˛ŕ¤žŕ¤._ŕ¤ŕ¤._ŕ¤¸ŕĽŕ¤ŞŕĽŕ¤._ŕ¤ŕ¤ŕĽŕ¤ŕĽ._ŕ¤¨ŕĽŕ¤­ŕĽ._ŕ¤Ąŕ¤żŕ¤¸ŕĽ.'.split('_'),
        weekdays : 'ŕ¤ŕ¤ŕ¤¤ŕ¤Źŕ¤žŕ¤°_ŕ¤¸ŕĽŕ¤Žŕ¤Źŕ¤žŕ¤°_ŕ¤Žŕ¤ŕĽŕ¤ŕ¤˛ŕ¤Źŕ¤žŕ¤°_ŕ¤ŹŕĽŕ¤§ŕ¤Źŕ¤žŕ¤°_ŕ¤Źŕ¤żŕ¤šŕ¤żŕ¤Źŕ¤žŕ¤°_ŕ¤śŕĽŕ¤ŕĽŕ¤°ŕ¤Źŕ¤žŕ¤°_ŕ¤śŕ¤¨ŕ¤żŕ¤Źŕ¤žŕ¤°'.split('_'),
        weekdaysShort : 'ŕ¤ŕ¤ŕ¤¤._ŕ¤¸ŕĽŕ¤Ž._ŕ¤Žŕ¤ŕĽŕ¤ŕ¤˛._ŕ¤ŹŕĽŕ¤§._ŕ¤Źŕ¤żŕ¤šŕ¤ż._ŕ¤śŕĽŕ¤ŕĽŕ¤°._ŕ¤śŕ¤¨ŕ¤ż.'.split('_'),
        weekdaysMin : 'ŕ¤._ŕ¤¸ŕĽ._ŕ¤Žŕ¤._ŕ¤ŹŕĽ._ŕ¤Źŕ¤ż._ŕ¤śŕĽ._ŕ¤ś.'.split('_'),
        longDateFormat : {
            LT : 'Aŕ¤ŕĽ h:mm ŕ¤Źŕ¤ŕĽ',
            LTS : 'Aŕ¤ŕĽ h:mm:ss ŕ¤Źŕ¤ŕĽ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, Aŕ¤ŕĽ h:mm ŕ¤Źŕ¤ŕĽ',
            LLLL : 'dddd, D MMMM YYYY, Aŕ¤ŕĽ h:mm ŕ¤Źŕ¤ŕĽ'
        },
        preparse: function (string) {
            return string.replace(/[ŕĽ§ŕĽ¨ŕĽŠŕĽŞŕĽŤŕĽŹŕĽ­ŕĽŽŕĽŻŕĽŚ]/g, function (match) {
                return ne__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ne__symbolMap[match];
            });
        },
        meridiemParse: /ŕ¤°ŕ¤žŕ¤¤ŕ¤ż|ŕ¤Źŕ¤żŕ¤šŕ¤žŕ¤¨|ŕ¤Śŕ¤żŕ¤ŕ¤ŕ¤¸ŕĽ|ŕ¤¸ŕ¤žŕ¤ŕ¤/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕ¤°ŕ¤žŕ¤¤ŕ¤ż') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤Źŕ¤żŕ¤šŕ¤žŕ¤¨') {
                return hour;
            } else if (meridiem === 'ŕ¤Śŕ¤żŕ¤ŕ¤ŕ¤¸ŕĽ') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¤¸ŕ¤žŕ¤ŕ¤') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 3) {
                return 'ŕ¤°ŕ¤žŕ¤¤ŕ¤ż';
            } else if (hour < 12) {
                return 'ŕ¤Źŕ¤żŕ¤šŕ¤žŕ¤¨';
            } else if (hour < 16) {
                return 'ŕ¤Śŕ¤żŕ¤ŕ¤ŕ¤¸ŕĽ';
            } else if (hour < 20) {
                return 'ŕ¤¸ŕ¤žŕ¤ŕ¤';
            } else {
                return 'ŕ¤°ŕ¤žŕ¤¤ŕ¤ż';
            }
        },
        calendar : {
            sameDay : '[ŕ¤ŕ¤] LT',
            nextDay : '[ŕ¤­ŕĽŕ¤˛ŕ¤ż] LT',
            nextWeek : '[ŕ¤ŕ¤ŕ¤ŕ¤ŚŕĽ] dddd[,] LT',
            lastDay : '[ŕ¤šŕ¤żŕ¤ŕĽ] LT',
            lastWeek : '[ŕ¤ŕ¤ŕ¤ŕĽ] dddd[,] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%sŕ¤Žŕ¤ž',
            past : '%s ŕ¤ŕ¤ŕ¤žŕ¤Ąŕ¤ż',
            s : 'ŕ¤ŕĽŕ¤šŕĽ ŕ¤ŕĽŕ¤ˇŕ¤Ł',
            m : 'ŕ¤ŕ¤ ŕ¤Žŕ¤żŕ¤¨ŕĽŕ¤',
            mm : '%d ŕ¤Žŕ¤żŕ¤¨ŕĽŕ¤',
            h : 'ŕ¤ŕ¤ ŕ¤ŕ¤ŁŕĽŕ¤ŕ¤ž',
            hh : '%d ŕ¤ŕ¤ŁŕĽŕ¤ŕ¤ž',
            d : 'ŕ¤ŕ¤ ŕ¤Śŕ¤żŕ¤¨',
            dd : '%d ŕ¤Śŕ¤żŕ¤¨',
            M : 'ŕ¤ŕ¤ ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕ¤ž',
            MM : '%d ŕ¤Žŕ¤šŕ¤żŕ¤¨ŕ¤ž',
            y : 'ŕ¤ŕ¤ ŕ¤Źŕ¤°ŕĽŕ¤ˇ',
            yy : '%d ŕ¤Źŕ¤°ŕĽŕ¤ˇ'
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : dutch (nl)
    //! author : Joris RĂśling : https://github.com/jjupiter

    var nl__monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        nl__monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

    var nl = moment__default.defineLocale('nl', {
        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return nl__monthsShortWithoutDots[m.month()];
            } else {
                return nl__monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'over %s',
            past : '%s geleden',
            s : 'een paar seconden',
            m : 'ĂŠĂŠn minuut',
            mm : '%d minuten',
            h : 'ĂŠĂŠn uur',
            hh : '%d uur',
            d : 'ĂŠĂŠn dag',
            dd : '%d dagen',
            M : 'ĂŠĂŠn maand',
            MM : '%d maanden',
            y : 'ĂŠĂŠn jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : norwegian nynorsk (nn)
    //! author : https://github.com/mechuwind

    var nn = moment__default.defineLocale('nn', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sundag_mĂĽndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort : 'sun_mĂĽn_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin : 'su_mĂĽ_ty_on_to_fr_lĂ¸'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] H:mm',
            LLLL : 'dddd D. MMMM YYYY [kl.] HH:mm'
        },
        calendar : {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I gĂĽr klokka] LT',
            lastWeek: '[FĂ¸regĂĽande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s sidan',
            s : 'nokre sekund',
            m : 'eit minutt',
            mm : '%d minutt',
            h : 'ein time',
            hh : '%d timar',
            d : 'ein dag',
            dd : '%d dagar',
            M : 'ein mĂĽnad',
            MM : '%d mĂĽnader',
            y : 'eit ĂĽr',
            yy : '%d ĂĽr'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : punjabi india (pa-in)
    //! author : Harpreet Singh : https://github.com/harpreetkhalsagtbit

    var pa_in__symbolMap = {
        '1': 'ŕŠ§',
        '2': 'ŕŠ¨',
        '3': 'ŕŠŠ',
        '4': 'ŕŠŞ',
        '5': 'ŕŠŤ',
        '6': 'ŕŠŹ',
        '7': 'ŕŠ­',
        '8': 'ŕŠŽ',
        '9': 'ŕŠŻ',
        '0': 'ŕŠŚ'
    },
    pa_in__numberMap = {
        'ŕŠ§': '1',
        'ŕŠ¨': '2',
        'ŕŠŠ': '3',
        'ŕŠŞ': '4',
        'ŕŠŤ': '5',
        'ŕŠŹ': '6',
        'ŕŠ­': '7',
        'ŕŠŽ': '8',
        'ŕŠŻ': '9',
        'ŕŠŚ': '0'
    };

    var pa_in = moment__default.defineLocale('pa-in', {
        // There are months name as per Nanakshahi Calender but they are not used as rigidly in modern Punjabi.
        months : 'ŕ¨ŕ¨¨ŕ¨ľŕ¨°ŕŠ_ŕ¨Ťŕ¨źŕ¨°ŕ¨ľŕ¨°ŕŠ_ŕ¨Žŕ¨žŕ¨°ŕ¨_ŕ¨ŕ¨ŞŕŠŕ¨°ŕŠŕ¨˛_ŕ¨Žŕ¨_ŕ¨ŕŠŕ¨¨_ŕ¨ŕŠŕ¨˛ŕ¨žŕ¨_ŕ¨ŕ¨ŕ¨¸ŕ¨¤_ŕ¨¸ŕ¨¤ŕŠ°ŕ¨Źŕ¨°_ŕ¨ŕ¨ŕ¨¤ŕŠŕ¨Źŕ¨°_ŕ¨¨ŕ¨ľŕŠ°ŕ¨Źŕ¨°_ŕ¨Śŕ¨¸ŕŠ°ŕ¨Źŕ¨°'.split('_'),
        monthsShort : 'ŕ¨ŕ¨¨ŕ¨ľŕ¨°ŕŠ_ŕ¨Ťŕ¨źŕ¨°ŕ¨ľŕ¨°ŕŠ_ŕ¨Žŕ¨žŕ¨°ŕ¨_ŕ¨ŕ¨ŞŕŠŕ¨°ŕŠŕ¨˛_ŕ¨Žŕ¨_ŕ¨ŕŠŕ¨¨_ŕ¨ŕŠŕ¨˛ŕ¨žŕ¨_ŕ¨ŕ¨ŕ¨¸ŕ¨¤_ŕ¨¸ŕ¨¤ŕŠ°ŕ¨Źŕ¨°_ŕ¨ŕ¨ŕ¨¤ŕŠŕ¨Źŕ¨°_ŕ¨¨ŕ¨ľŕŠ°ŕ¨Źŕ¨°_ŕ¨Śŕ¨¸ŕŠ°ŕ¨Źŕ¨°'.split('_'),
        weekdays : 'ŕ¨ŕ¨¤ŕ¨ľŕ¨žŕ¨°_ŕ¨¸ŕŠŕ¨Žŕ¨ľŕ¨žŕ¨°_ŕ¨ŽŕŠ°ŕ¨ŕ¨˛ŕ¨ľŕ¨žŕ¨°_ŕ¨ŹŕŠŕ¨§ŕ¨ľŕ¨žŕ¨°_ŕ¨ľŕŠŕ¨°ŕ¨ľŕ¨žŕ¨°_ŕ¨¸ŕ¨źŕŠŕŠąŕ¨ŕ¨°ŕ¨ľŕ¨žŕ¨°_ŕ¨¸ŕ¨źŕ¨¨ŕŠŕ¨ŕ¨°ŕ¨ľŕ¨žŕ¨°'.split('_'),
        weekdaysShort : 'ŕ¨ŕ¨¤_ŕ¨¸ŕŠŕ¨Ž_ŕ¨ŽŕŠ°ŕ¨ŕ¨˛_ŕ¨ŹŕŠŕ¨§_ŕ¨ľŕŠŕ¨°_ŕ¨¸ŕ¨źŕŠŕ¨ŕ¨°_ŕ¨¸ŕ¨źŕ¨¨ŕŠ'.split('_'),
        weekdaysMin : 'ŕ¨ŕ¨¤_ŕ¨¸ŕŠŕ¨Ž_ŕ¨ŽŕŠ°ŕ¨ŕ¨˛_ŕ¨ŹŕŠŕ¨§_ŕ¨ľŕŠŕ¨°_ŕ¨¸ŕ¨źŕŠŕ¨ŕ¨°_ŕ¨¸ŕ¨źŕ¨¨ŕŠ'.split('_'),
        longDateFormat : {
            LT : 'A h:mm ŕ¨ľŕ¨ŕŠ',
            LTS : 'A h:mm:ss ŕ¨ľŕ¨ŕŠ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm ŕ¨ľŕ¨ŕŠ',
            LLLL : 'dddd, D MMMM YYYY, A h:mm ŕ¨ľŕ¨ŕŠ'
        },
        calendar : {
            sameDay : '[ŕ¨ŕ¨] LT',
            nextDay : '[ŕ¨ŕ¨˛] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕ¨ŕ¨˛] LT',
            lastWeek : '[ŕ¨Şŕ¨żŕ¨ŕ¨˛ŕŠ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕ¨ľŕ¨żŕŠąŕ¨',
            past : '%s ŕ¨Şŕ¨żŕ¨ŕ¨˛ŕŠ',
            s : 'ŕ¨ŕŠŕ¨ ŕ¨¸ŕ¨ŕ¨żŕŠ°ŕ¨',
            m : 'ŕ¨ŕ¨ ŕ¨Žŕ¨żŕŠ°ŕ¨',
            mm : '%d ŕ¨Žŕ¨żŕŠ°ŕ¨',
            h : 'ŕ¨ŕŠąŕ¨ ŕ¨ŕŠ°ŕ¨ŕ¨ž',
            hh : '%d ŕ¨ŕŠ°ŕ¨ŕŠ',
            d : 'ŕ¨ŕŠąŕ¨ ŕ¨Śŕ¨żŕ¨¨',
            dd : '%d ŕ¨Śŕ¨żŕ¨¨',
            M : 'ŕ¨ŕŠąŕ¨ ŕ¨Žŕ¨šŕŠŕ¨¨ŕ¨ž',
            MM : '%d ŕ¨Žŕ¨šŕŠŕ¨¨ŕŠ',
            y : 'ŕ¨ŕŠąŕ¨ ŕ¨¸ŕ¨žŕ¨˛',
            yy : '%d ŕ¨¸ŕ¨žŕ¨˛'
        },
        preparse: function (string) {
            return string.replace(/[ŕŠ§ŕŠ¨ŕŠŠŕŠŞŕŠŤŕŠŹŕŠ­ŕŠŽŕŠŻŕŠŚ]/g, function (match) {
                return pa_in__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return pa_in__symbolMap[match];
            });
        },
        // Punjabi notation for meridiems are quite fuzzy in practice. While there exists
        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Punjabi.
        meridiemParse: /ŕ¨°ŕ¨žŕ¨¤|ŕ¨¸ŕ¨ľŕŠŕ¨°|ŕ¨ŚŕŠŕ¨Şŕ¨šŕ¨żŕ¨°|ŕ¨¸ŕ¨źŕ¨žŕ¨Ž/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕ¨°ŕ¨žŕ¨¤') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¨¸ŕ¨ľŕŠŕ¨°') {
                return hour;
            } else if (meridiem === 'ŕ¨ŚŕŠŕ¨Şŕ¨šŕ¨żŕ¨°') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'ŕ¨¸ŕ¨źŕ¨žŕ¨Ž') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ¨°ŕ¨žŕ¨¤';
            } else if (hour < 10) {
                return 'ŕ¨¸ŕ¨ľŕŠŕ¨°';
            } else if (hour < 17) {
                return 'ŕ¨ŚŕŠŕ¨Şŕ¨šŕ¨żŕ¨°';
            } else if (hour < 20) {
                return 'ŕ¨¸ŕ¨źŕ¨žŕ¨Ž';
            } else {
                return 'ŕ¨°ŕ¨žŕ¨¤';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : polish (pl)
    //! author : Rafal Hirsz : https://github.com/evoL

    var monthsNominative = 'styczeĹ_luty_marzec_kwiecieĹ_maj_czerwiec_lipiec_sierpieĹ_wrzesieĹ_paĹşdziernik_listopad_grudzieĹ'.split('_'),
        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrzeĹnia_paĹşdziernika_listopada_grudnia'.split('_');
    function pl__plural(n) {
        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
    }
    function pl__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minutÄ';
        case 'mm':
            return result + (pl__plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix  ? 'godzina'  : 'godzinÄ';
        case 'hh':
            return result + (pl__plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (pl__plural(number) ? 'miesiÄce' : 'miesiÄcy');
        case 'yy':
            return result + (pl__plural(number) ? 'lata' : 'lat');
        }
    }

    var pl = moment__default.defineLocale('pl', {
        months : function (momentToFormat, format) {
            if (format === '') {
                // Hack: if format empty we know this is used to generate
                // RegExp by moment. Give then back both valid forms of months
                // in RegExp ready format.
                return '(' + monthsSubjective[momentToFormat.month()] + '|' + monthsNominative[momentToFormat.month()] + ')';
            } else if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paĹş_lis_gru'.split('_'),
        weekdays : 'niedziela_poniedziaĹek_wtorek_Ĺroda_czwartek_piÄtek_sobota'.split('_'),
        weekdaysShort : 'nie_pon_wt_Ĺr_czw_pt_sb'.split('_'),
        weekdaysMin : 'Nd_Pn_Wt_Ĺr_Cz_Pt_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[DziĹ o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zeszĹÄ niedzielÄ o] LT';
                case 3:
                    return '[W zeszĹÄ ĹrodÄ o] LT';
                case 6:
                    return '[W zeszĹÄ sobotÄ o] LT';
                default:
                    return '[W zeszĹy] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : '%s temu',
            s : 'kilka sekund',
            m : pl__translate,
            mm : pl__translate,
            h : pl__translate,
            hh : pl__translate,
            d : '1 dzieĹ',
            dd : '%d dni',
            M : 'miesiÄc',
            MM : pl__translate,
            y : 'rok',
            yy : pl__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : brazilian portuguese (pt-br)
    //! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

    var pt_br = moment__default.defineLocale('pt-br', {
        months : 'Janeiro_Fevereiro_MarĂ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-feira_TerĂ§a-feira_Quarta-feira_Quinta-feira_Sexta-feira_SĂĄbado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_SĂĄb'.split('_'),
        weekdaysMin : 'Dom_2ÂŞ_3ÂŞ_4ÂŞ_5ÂŞ_6ÂŞ_SĂĄb'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [Ă s] HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [Ă s] HH:mm'
        },
        calendar : {
            sameDay: '[Hoje Ă s] LT',
            nextDay: '[AmanhĂŁ Ă s] LT',
            nextWeek: 'dddd [Ă s] LT',
            lastDay: '[Ontem Ă s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Ăltimo] dddd [Ă s] LT' : // Saturday + Sunday
                    '[Ăltima] dddd [Ă s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atrĂĄs',
            s : 'poucos segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mĂŞs',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}Âş/,
        ordinal : '%dÂş'
    });

    //! moment.js locale configuration
    //! locale : portuguese (pt)
    //! author : Jefferson : https://github.com/jalex79

    var pt = moment__default.defineLocale('pt', {
        months : 'Janeiro_Fevereiro_MarĂ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-Feira_TerĂ§a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_SĂĄbado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_SĂĄb'.split('_'),
        weekdaysMin : 'Dom_2ÂŞ_3ÂŞ_4ÂŞ_5ÂŞ_6ÂŞ_SĂĄb'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Hoje Ă s] LT',
            nextDay: '[AmanhĂŁ Ă s] LT',
            nextWeek: 'dddd [Ă s] LT',
            lastDay: '[Ontem Ă s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Ăltimo] dddd [Ă s] LT' : // Saturday + Sunday
                    '[Ăltima] dddd [Ă s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : 'hĂĄ %s',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mĂŞs',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}Âş/,
        ordinal : '%dÂş',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : romanian (ro)
    //! author : Vlad Gurdiga : https://github.com/gurdiga
    //! author : Valentin Agachi : https://github.com/avaly

    function ro__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            },
            separator = ' ';
        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
            separator = ' de ';
        }
        return number + separator + format[key];
    }

    var ro = moment__default.defineLocale('ro', {
        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays : 'duminicÄ_luni_marČi_miercuri_joi_vineri_sĂ˘mbÄtÄ'.split('_'),
        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_SĂ˘m'.split('_'),
        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_SĂ˘'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[azi la] LT',
            nextDay: '[mĂ˘ine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'peste %s',
            past : '%s ĂŽn urmÄ',
            s : 'cĂ˘teva secunde',
            m : 'un minut',
            mm : ro__relativeTimeWithPlural,
            h : 'o orÄ',
            hh : ro__relativeTimeWithPlural,
            d : 'o zi',
            dd : ro__relativeTimeWithPlural,
            M : 'o lunÄ',
            MM : ro__relativeTimeWithPlural,
            y : 'un an',
            yy : ro__relativeTimeWithPlural
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : russian (ru)
    //! author : Viktorminator : https://github.com/Viktorminator
    //! Author : Menelion ElensĂşle : https://github.com/Oire
    //! author : ĐĐžŃĐľĐ˝ĐąĐľŃĐł ĐĐ°ŃĐş : https://github.com/socketpair

    function ru__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function ru__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'ĐźĐ¸Đ˝ŃŃĐ°_ĐźĐ¸Đ˝ŃŃŃ_ĐźĐ¸Đ˝ŃŃ' : 'ĐźĐ¸Đ˝ŃŃŃ_ĐźĐ¸Đ˝ŃŃŃ_ĐźĐ¸Đ˝ŃŃ',
            'hh': 'ŃĐ°Ń_ŃĐ°ŃĐ°_ŃĐ°ŃĐžĐ˛',
            'dd': 'Đ´ĐľĐ˝Ń_Đ´Đ˝Ń_Đ´Đ˝ĐľĐš',
            'MM': 'ĐźĐľŃŃŃ_ĐźĐľŃŃŃĐ°_ĐźĐľŃŃŃĐľĐ˛',
            'yy': 'ĐłĐžĐ´_ĐłĐžĐ´Đ°_ĐťĐľŃ'
        };
        if (key === 'm') {
            return withoutSuffix ? 'ĐźĐ¸Đ˝ŃŃĐ°' : 'ĐźĐ¸Đ˝ŃŃŃ';
        }
        else {
            return number + ' ' + ru__plural(format[key], +number);
        }
    }
    var monthsParse = [/^ŃĐ˝Đ˛/i, /^ŃĐľĐ˛/i, /^ĐźĐ°Ń/i, /^Đ°ĐżŃ/i, /^ĐźĐ°[Đš|Ń]/i, /^Đ¸ŃĐ˝/i, /^Đ¸ŃĐť/i, /^Đ°Đ˛Đł/i, /^ŃĐľĐ˝/i, /^ĐžĐşŃ/i, /^Đ˝ĐžŃ/i, /^Đ´ĐľĐş/i];

    // http://new.gramota.ru/spravka/rules/139-prop : Â§ 103
    var ru = moment__default.defineLocale('ru', {
        months : {
            format: 'ŃĐ˝Đ˛Đ°ŃŃ_ŃĐľĐ˛ŃĐ°ĐťŃ_ĐźĐ°ŃŃĐ°_Đ°ĐżŃĐľĐťŃ_ĐźĐ°Ń_Đ¸ŃĐ˝Ń_Đ¸ŃĐťŃ_Đ°Đ˛ĐłŃŃŃĐ°_ŃĐľĐ˝ŃŃĐąŃŃ_ĐžĐşŃŃĐąŃŃ_Đ˝ĐžŃĐąŃŃ_Đ´ĐľĐşĐ°ĐąŃŃ'.split('_'),
            standalone: 'ŃĐ˝Đ˛Đ°ŃŃ_ŃĐľĐ˛ŃĐ°ĐťŃ_ĐźĐ°ŃŃ_Đ°ĐżŃĐľĐťŃ_ĐźĐ°Đš_Đ¸ŃĐ˝Ń_Đ¸ŃĐťŃ_Đ°Đ˛ĐłŃŃŃ_ŃĐľĐ˝ŃŃĐąŃŃ_ĐžĐşŃŃĐąŃŃ_Đ˝ĐžŃĐąŃŃ_Đ´ĐľĐşĐ°ĐąŃŃ'.split('_')
        },
        monthsShort : {
            format: 'ŃĐ˝Đ˛_ŃĐľĐ˛_ĐźĐ°Ń_Đ°ĐżŃ_ĐźĐ°Ń_Đ¸ŃĐ˝Ń_Đ¸ŃĐťŃ_Đ°Đ˛Đł_ŃĐľĐ˝_ĐžĐşŃ_Đ˝ĐžŃ_Đ´ĐľĐş'.split('_'),
            standalone: 'ŃĐ˝Đ˛_ŃĐľĐ˛_ĐźĐ°ŃŃ_Đ°ĐżŃ_ĐźĐ°Đš_Đ¸ŃĐ˝Ń_Đ¸ŃĐťŃ_Đ°Đ˛Đł_ŃĐľĐ˝_ĐžĐşŃ_Đ˝ĐžŃ_Đ´ĐľĐş'.split('_')
        },
        weekdays : {
            standalone: 'Đ˛ĐžŃĐşŃĐľŃĐľĐ˝ŃĐľ_ĐżĐžĐ˝ĐľĐ´ĐľĐťŃĐ˝Đ¸Đş_Đ˛ŃĐžŃĐ˝Đ¸Đş_ŃŃĐľĐ´Đ°_ŃĐľŃĐ˛ĐľŃĐł_ĐżŃŃĐ˝Đ¸ŃĐ°_ŃŃĐąĐąĐžŃĐ°'.split('_'),
            format: 'Đ˛ĐžŃĐşŃĐľŃĐľĐ˝ŃĐľ_ĐżĐžĐ˝ĐľĐ´ĐľĐťŃĐ˝Đ¸Đş_Đ˛ŃĐžŃĐ˝Đ¸Đş_ŃŃĐľĐ´Ń_ŃĐľŃĐ˛ĐľŃĐł_ĐżŃŃĐ˝Đ¸ŃŃ_ŃŃĐąĐąĐžŃŃ'.split('_'),
            isFormat: /\[ ?[ĐĐ˛] ?(?:ĐżŃĐžŃĐťŃŃ|ŃĐťĐľĐ´ŃŃŃŃŃ|ŃŃŃ)? ?\] ?dddd/
        },
        weekdaysShort : 'Đ˛Ń_ĐżĐ˝_Đ˛Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        weekdaysMin : 'Đ˛Ń_ĐżĐ˝_Đ˛Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        monthsParse : monthsParse,
        longMonthsParse : monthsParse,
        shortMonthsParse : monthsParse,
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Đł.',
            LLL : 'D MMMM YYYY Đł., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Đł., HH:mm'
        },
        calendar : {
            sameDay: '[ĐĄĐľĐłĐžĐ´Đ˝Ń Đ˛] LT',
            nextDay: '[ĐĐ°Đ˛ŃŃĐ° Đ˛] LT',
            lastDay: '[ĐŃĐľŃĐ° Đ˛] LT',
            nextWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                    case 0:
                        return '[Đ ŃĐťĐľĐ´ŃŃŃĐľĐľ] dddd [Đ˛] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[Đ ŃĐťĐľĐ´ŃŃŃĐ¸Đš] dddd [Đ˛] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[Đ ŃĐťĐľĐ´ŃŃŃŃŃ] dddd [Đ˛] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[ĐĐž] dddd [Đ˛] LT';
                    } else {
                        return '[Đ] dddd [Đ˛] LT';
                    }
                }
            },
            lastWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                    case 0:
                        return '[Đ ĐżŃĐžŃĐťĐžĐľ] dddd [Đ˛] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[Đ ĐżŃĐžŃĐťŃĐš] dddd [Đ˛] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[Đ ĐżŃĐžŃĐťŃŃ] dddd [Đ˛] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[ĐĐž] dddd [Đ˛] LT';
                    } else {
                        return '[Đ] dddd [Đ˛] LT';
                    }
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ŃĐľŃĐľĐˇ %s',
            past : '%s Đ˝Đ°ĐˇĐ°Đ´',
            s : 'Đ˝ĐľŃĐşĐžĐťŃĐşĐž ŃĐľĐşŃĐ˝Đ´',
            m : ru__relativeTimeWithPlural,
            mm : ru__relativeTimeWithPlural,
            h : 'ŃĐ°Ń',
            hh : ru__relativeTimeWithPlural,
            d : 'Đ´ĐľĐ˝Ń',
            dd : ru__relativeTimeWithPlural,
            M : 'ĐźĐľŃŃŃ',
            MM : ru__relativeTimeWithPlural,
            y : 'ĐłĐžĐ´',
            yy : ru__relativeTimeWithPlural
        },
        meridiemParse: /Đ˝ĐžŃĐ¸|ŃŃŃĐ°|Đ´Đ˝Ń|Đ˛ĐľŃĐľŃĐ°/i,
        isPM : function (input) {
            return /^(Đ´Đ˝Ń|Đ˛ĐľŃĐľŃĐ°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Đ˝ĐžŃĐ¸';
            } else if (hour < 12) {
                return 'ŃŃŃĐ°';
            } else if (hour < 17) {
                return 'Đ´Đ˝Ń';
            } else {
                return 'Đ˛ĐľŃĐľŃĐ°';
            }
        },
        ordinalParse: /\d{1,2}-(Đš|ĐłĐž|Ń)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-Đš';
            case 'D':
                return number + '-ĐłĐž';
            case 'w':
            case 'W':
                return number + '-Ń';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Northern Sami (se)
    //! authors : BĂĽrd Rolstad Henriksen : https://github.com/karamell


    var se = moment__default.defineLocale('se', {
        months : 'oÄÄajagemĂĄnnu_guovvamĂĄnnu_njukÄamĂĄnnu_cuoĹomĂĄnnu_miessemĂĄnnu_geassemĂĄnnu_suoidnemĂĄnnu_borgemĂĄnnu_ÄakÄamĂĄnnu_golggotmĂĄnnu_skĂĄbmamĂĄnnu_juovlamĂĄnnu'.split('_'),
        monthsShort : 'oÄÄj_guov_njuk_cuo_mies_geas_suoi_borg_ÄakÄ_golg_skĂĄb_juov'.split('_'),
        weekdays : 'sotnabeaivi_vuossĂĄrga_maĹĹebĂĄrga_gaskavahkku_duorastat_bearjadat_lĂĄvvardat'.split('_'),
        weekdaysShort : 'sotn_vuos_maĹ_gask_duor_bear_lĂĄv'.split('_'),
        weekdaysMin : 's_v_m_g_d_b_L'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'MMMM D. [b.] YYYY',
            LLL : 'MMMM D. [b.] YYYY [ti.] HH:mm',
            LLLL : 'dddd, MMMM D. [b.] YYYY [ti.] HH:mm'
        },
        calendar : {
            sameDay: '[otne ti] LT',
            nextDay: '[ihttin ti] LT',
            nextWeek: 'dddd [ti] LT',
            lastDay: '[ikte ti] LT',
            lastWeek: '[ovddit] dddd [ti] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s geaĹžes',
            past : 'maĹit %s',
            s : 'moadde sekunddat',
            m : 'okta minuhta',
            mm : '%d minuhtat',
            h : 'okta diimmu',
            hh : '%d diimmut',
            d : 'okta beaivi',
            dd : '%d beaivvit',
            M : 'okta mĂĄnnu',
            MM : '%d mĂĄnut',
            y : 'okta jahki',
            yy : '%d jagit'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Sinhalese (si)
    //! author : Sampath Sitinamaluwa : https://github.com/sampathsris

    /*jshint -W100*/
    var si = moment__default.defineLocale('si', {
        months : 'ŕś˘ŕśąŕˇŕˇŕśťŕˇ_ŕś´ŕˇŕśśŕśťŕˇŕˇŕśťŕˇ_ŕś¸ŕˇŕśťŕˇŕś­ŕˇ_ŕśŕś´ŕˇâŕśťŕˇŕś˝ŕˇ_ŕś¸ŕˇŕśşŕˇ_ŕś˘ŕˇŕśąŕˇ_ŕś˘ŕˇŕś˝ŕˇ_ŕśŕśŕˇŕˇŕˇŕś­ŕˇ_ŕˇŕˇŕś´ŕˇŕś­ŕˇŕś¸ŕˇŕśśŕśťŕˇ_ŕśŕśŕˇŕś­ŕˇŕśśŕśťŕˇ_ŕśąŕˇŕˇŕˇŕś¸ŕˇŕśśŕśťŕˇ_ŕśŻŕˇŕˇŕˇŕś¸ŕˇŕśśŕśťŕˇ'.split('_'),
        monthsShort : 'ŕś˘ŕśą_ŕś´ŕˇŕśś_ŕś¸ŕˇŕśťŕˇ_ŕśŕś´ŕˇ_ŕś¸ŕˇŕśşŕˇ_ŕś˘ŕˇŕśąŕˇ_ŕś˘ŕˇŕś˝ŕˇ_ŕśŕśŕˇ_ŕˇŕˇŕś´ŕˇ_ŕśŕśŕˇ_ŕśąŕˇŕˇŕˇ_ŕśŻŕˇŕˇŕˇ'.split('_'),
        weekdays : 'ŕśŕśťŕˇŕśŻŕˇ_ŕˇŕśłŕˇŕśŻŕˇ_ŕśŕśŕˇŕśťŕˇŕˇŕˇŕśŻŕˇ_ŕśśŕśŻŕˇŕśŻŕˇ_ŕśśŕˇâŕśťŕˇŕˇŕˇŕś´ŕś­ŕˇŕśąŕˇŕśŻŕˇ_ŕˇŕˇŕśŕˇŕśťŕˇŕśŻŕˇ_ŕˇŕˇŕśąŕˇŕˇŕśťŕˇŕśŻŕˇ'.split('_'),
        weekdaysShort : 'ŕśŕśťŕˇ_ŕˇŕśłŕˇ_ŕśŕś_ŕśśŕśŻŕˇ_ŕśśŕˇâŕśťŕˇ_ŕˇŕˇŕśŕˇ_ŕˇŕˇŕśą'.split('_'),
        weekdaysMin : 'ŕś_ŕˇ_ŕś_ŕśś_ŕśśŕˇâŕśť_ŕˇŕˇ_ŕˇŕˇ'.split('_'),
        longDateFormat : {
            LT : 'a h:mm',
            LTS : 'a h:mm:ss',
            L : 'YYYY/MM/DD',
            LL : 'YYYY MMMM D',
            LLL : 'YYYY MMMM D, a h:mm',
            LLLL : 'YYYY MMMM D [ŕˇŕˇŕśąŕˇ] dddd, a h:mm:ss'
        },
        calendar : {
            sameDay : '[ŕśŕśŻ] LT[ŕś§]',
            nextDay : '[ŕˇŕˇŕś§] LT[ŕś§]',
            nextWeek : 'dddd LT[ŕś§]',
            lastDay : '[ŕśŕśşŕˇ] LT[ŕś§]',
            lastWeek : '[ŕś´ŕˇŕˇŕśŕˇŕśş] dddd LT[ŕś§]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%sŕśŕˇŕśąŕˇ',
            past : '%sŕśŕś§ ŕś´ŕˇŕśť',
            s : 'ŕś­ŕś­ŕˇŕś´ŕśť ŕśŕˇŕˇŕˇŕś´ŕśş',
            m : 'ŕś¸ŕˇŕśąŕˇŕś­ŕˇŕś­ŕˇŕˇ',
            mm : 'ŕś¸ŕˇŕśąŕˇŕś­ŕˇŕś­ŕˇ %d',
            h : 'ŕś´ŕˇŕśş',
            hh : 'ŕś´ŕˇŕśş %d',
            d : 'ŕśŻŕˇŕśąŕśş',
            dd : 'ŕśŻŕˇŕśą %d',
            M : 'ŕś¸ŕˇŕˇŕśş',
            MM : 'ŕś¸ŕˇŕˇ %d',
            y : 'ŕˇŕˇŕśť',
            yy : 'ŕˇŕˇŕśť %d'
        },
        ordinalParse: /\d{1,2} ŕˇŕˇŕśąŕˇ/,
        ordinal : function (number) {
            return number + ' ŕˇŕˇŕśąŕˇ';
        },
        meridiemParse : /ŕś´ŕˇŕśť ŕˇŕśťŕˇ|ŕś´ŕˇŕˇ ŕˇŕśťŕˇ|ŕś´ŕˇ.ŕˇ|ŕś´.ŕˇ./,
        isPM : function (input) {
            return input === 'ŕś´.ŕˇ.' || input === 'ŕś´ŕˇŕˇ ŕˇŕśťŕˇ';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'ŕś´.ŕˇ.' : 'ŕś´ŕˇŕˇ ŕˇŕśťŕˇ';
            } else {
                return isLower ? 'ŕś´ŕˇ.ŕˇ.' : 'ŕś´ŕˇŕśť ŕˇŕśťŕˇ';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : slovak (sk)
    //! author : Martin Minka : https://github.com/k2s
    //! based on work of petrbela : https://github.com/petrbela

    var sk__months = 'januĂĄr_februĂĄr_marec_aprĂ­l_mĂĄj_jĂşn_jĂşl_august_september_oktĂłber_november_december'.split('_'),
        sk__monthsShort = 'jan_feb_mar_apr_mĂĄj_jĂşn_jĂşl_aug_sep_okt_nov_dec'.split('_');
    function sk__plural(n) {
        return (n > 1) && (n < 5);
    }
    function sk__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pĂĄr sekĂşnd' : 'pĂĄr sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minĂşta' : (isFuture ? 'minĂştu' : 'minĂştou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'minĂşty' : 'minĂşt');
            } else {
                return result + 'minĂştami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'hodiny' : 'hodĂ­n');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'deĹ' : 'dĹom';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'dni' : 'dnĂ­');
            } else {
                return result + 'dĹami';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }

    var sk = moment__default.defineLocale('sk', {
        months : sk__months,
        monthsShort : sk__monthsShort,
        weekdays : 'nedeÄža_pondelok_utorok_streda_ĹĄtvrtok_piatok_sobota'.split('_'),
        weekdaysShort : 'ne_po_ut_st_ĹĄt_pi_so'.split('_'),
        weekdaysMin : 'ne_po_ut_st_ĹĄt_pi_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nedeÄžu o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo ĹĄtvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[vÄera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulĂş nedeÄžu o] LT';
                case 1:
                case 2:
                    return '[minulĂ˝] dddd [o] LT';
                case 3:
                    return '[minulĂş stredu o] LT';
                case 4:
                case 5:
                    return '[minulĂ˝] dddd [o] LT';
                case 6:
                    return '[minulĂş sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pred %s',
            s : sk__translate,
            m : sk__translate,
            mm : sk__translate,
            h : sk__translate,
            hh : sk__translate,
            d : sk__translate,
            dd : sk__translate,
            M : sk__translate,
            MM : sk__translate,
            y : sk__translate,
            yy : sk__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : slovenian (sl)
    //! author : Robert SedovĹĄek : https://github.com/sedovsek

    function sl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nekaj sekund' : 'nekaj sekundami';
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += withoutSuffix ? 'minuta' : 'minuto';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'minuti' : 'minutama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'minute' : 'minutami';
            } else {
                result += withoutSuffix || isFuture ? 'minut' : 'minutami';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += withoutSuffix ? 'ura' : 'uro';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'uri' : 'urama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'ure' : 'urami';
            } else {
                result += withoutSuffix || isFuture ? 'ur' : 'urami';
            }
            return result;
        case 'd':
            return withoutSuffix || isFuture ? 'en dan' : 'enim dnem';
        case 'dd':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'dan' : 'dnem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevoma';
            } else {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevi';
            }
            return result;
        case 'M':
            return withoutSuffix || isFuture ? 'en mesec' : 'enim mesecem';
        case 'MM':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'mesec' : 'mesecem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'meseca' : 'mesecema';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'mesece' : 'meseci';
            } else {
                result += withoutSuffix || isFuture ? 'mesecev' : 'meseci';
            }
            return result;
        case 'y':
            return withoutSuffix || isFuture ? 'eno leto' : 'enim letom';
        case 'yy':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'leto' : 'letom';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'leti' : 'letoma';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'leta' : 'leti';
            } else {
                result += withoutSuffix || isFuture ? 'let' : 'leti';
            }
            return result;
        }
    }

    var sl = moment__default.defineLocale('sl', {
        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedelja_ponedeljek_torek_sreda_Äetrtek_petek_sobota'.split('_'),
        weekdaysShort : 'ned._pon._tor._sre._Äet._pet._sob.'.split('_'),
        weekdaysMin : 'ne_po_to_sr_Äe_pe_so'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danes ob] LT',
            nextDay  : '[jutri ob] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[v] [nedeljo] [ob] LT';
                case 3:
                    return '[v] [sredo] [ob] LT';
                case 6:
                    return '[v] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[v] dddd [ob] LT';
                }
            },
            lastDay  : '[vÄeraj ob] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[prejĹĄnjo] [nedeljo] [ob] LT';
                case 3:
                    return '[prejĹĄnjo] [sredo] [ob] LT';
                case 6:
                    return '[prejĹĄnjo] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prejĹĄnji] dddd [ob] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Äez %s',
            past   : 'pred %s',
            s      : sl__processRelativeTime,
            m      : sl__processRelativeTime,
            mm     : sl__processRelativeTime,
            h      : sl__processRelativeTime,
            hh     : sl__processRelativeTime,
            d      : sl__processRelativeTime,
            dd     : sl__processRelativeTime,
            M      : sl__processRelativeTime,
            MM     : sl__processRelativeTime,
            y      : sl__processRelativeTime,
            yy     : sl__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Albanian (sq)
    //! author : FlakĂŤrim Ismani : https://github.com/flakerimi
    //! author: Menelion ElensĂşle: https://github.com/Oire (tests)
    //! author : Oerd Cukalla : https://github.com/oerd (fixes)

    var sq = moment__default.defineLocale('sq', {
        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_NĂŤntor_Dhjetor'.split('_'),
        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_NĂŤn_Dhj'.split('_'),
        weekdays : 'E Diel_E HĂŤnĂŤ_E MartĂŤ_E MĂŤrkurĂŤ_E Enjte_E Premte_E ShtunĂŤ'.split('_'),
        weekdaysShort : 'Die_HĂŤn_Mar_MĂŤr_Enj_Pre_Sht'.split('_'),
        weekdaysMin : 'D_H_Ma_MĂŤ_E_P_Sh'.split('_'),
        meridiemParse: /PD|MD/,
        isPM: function (input) {
            return input.charAt(0) === 'M';
        },
        meridiem : function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Sot nĂŤ] LT',
            nextDay : '[NesĂŤr nĂŤ] LT',
            nextWeek : 'dddd [nĂŤ] LT',
            lastDay : '[Dje nĂŤ] LT',
            lastWeek : 'dddd [e kaluar nĂŤ] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'nĂŤ %s',
            past : '%s mĂŤ parĂŤ',
            s : 'disa sekonda',
            m : 'njĂŤ minutĂŤ',
            mm : '%d minuta',
            h : 'njĂŤ orĂŤ',
            hh : '%d orĂŤ',
            d : 'njĂŤ ditĂŤ',
            dd : '%d ditĂŤ',
            M : 'njĂŤ muaj',
            MM : '%d muaj',
            y : 'njĂŤ vit',
            yy : '%d vite'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Serbian-cyrillic (sr-cyrl)
    //! author : Milan JanaÄkoviÄ<milanjanackovic@gmail.com> : https://github.com/milan-j

    var sr_cyrl__translator = {
        words: { //Different grammatical cases
            m: ['ŃĐľĐ´Đ°Đ˝ ĐźĐ¸Đ˝ŃŃ', 'ŃĐľĐ´Đ˝Đľ ĐźĐ¸Đ˝ŃŃĐľ'],
            mm: ['ĐźĐ¸Đ˝ŃŃ', 'ĐźĐ¸Đ˝ŃŃĐľ', 'ĐźĐ¸Đ˝ŃŃĐ°'],
            h: ['ŃĐľĐ´Đ°Đ˝ ŃĐ°Ń', 'ŃĐľĐ´Đ˝ĐžĐł ŃĐ°ŃĐ°'],
            hh: ['ŃĐ°Ń', 'ŃĐ°ŃĐ°', 'ŃĐ°ŃĐ¸'],
            dd: ['Đ´Đ°Đ˝', 'Đ´Đ°Đ˝Đ°', 'Đ´Đ°Đ˝Đ°'],
            MM: ['ĐźĐľŃĐľŃ', 'ĐźĐľŃĐľŃĐ°', 'ĐźĐľŃĐľŃĐ¸'],
            yy: ['ĐłĐžĐ´Đ¸Đ˝Đ°', 'ĐłĐžĐ´Đ¸Đ˝Đľ', 'ĐłĐžĐ´Đ¸Đ˝Đ°']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = sr_cyrl__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + sr_cyrl__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var sr_cyrl = moment__default.defineLocale('sr-cyrl', {
        months: ['ŃĐ°Đ˝ŃĐ°Ń', 'ŃĐľĐąŃŃĐ°Ń', 'ĐźĐ°ŃŃ', 'Đ°ĐżŃĐ¸Đť', 'ĐźĐ°Ń', 'ŃŃĐ˝', 'ŃŃĐť', 'Đ°Đ˛ĐłŃŃŃ', 'ŃĐľĐżŃĐľĐźĐąĐ°Ń', 'ĐžĐşŃĐžĐąĐ°Ń', 'Đ˝ĐžĐ˛ĐľĐźĐąĐ°Ń', 'Đ´ĐľŃĐľĐźĐąĐ°Ń'],
        monthsShort: ['ŃĐ°Đ˝.', 'ŃĐľĐą.', 'ĐźĐ°Ń.', 'Đ°ĐżŃ.', 'ĐźĐ°Ń', 'ŃŃĐ˝', 'ŃŃĐť', 'Đ°Đ˛Đł.', 'ŃĐľĐż.', 'ĐžĐşŃ.', 'Đ˝ĐžĐ˛.', 'Đ´ĐľŃ.'],
        weekdays: ['Đ˝ĐľĐ´ĐľŃĐ°', 'ĐżĐžĐ˝ĐľĐ´ĐľŃĐ°Đş', 'ŃŃĐžŃĐ°Đş', 'ŃŃĐľĐ´Đ°', 'ŃĐľŃĐ˛ŃŃĐ°Đş', 'ĐżĐľŃĐ°Đş', 'ŃŃĐąĐžŃĐ°'],
        weekdaysShort: ['Đ˝ĐľĐ´.', 'ĐżĐžĐ˝.', 'ŃŃĐž.', 'ŃŃĐľ.', 'ŃĐľŃ.', 'ĐżĐľŃ.', 'ŃŃĐą.'],
        weekdaysMin: ['Đ˝Đľ', 'ĐżĐž', 'ŃŃ', 'ŃŃ', 'ŃĐľ', 'ĐżĐľ', 'ŃŃ'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[Đ´Đ°Đ˝Đ°Ń Ń] LT',
            nextDay: '[ŃŃŃŃĐ° Ń] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[Ń] [Đ˝ĐľĐ´ĐľŃŃ] [Ń] LT';
                case 3:
                    return '[Ń] [ŃŃĐľĐ´Ń] [Ń] LT';
                case 6:
                    return '[Ń] [ŃŃĐąĐžŃŃ] [Ń] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Ń] dddd [Ń] LT';
                }
            },
            lastDay  : '[ŃŃŃĐľ Ń] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[ĐżŃĐžŃĐťĐľ] [Đ˝ĐľĐ´ĐľŃĐľ] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐžĐł] [ĐżĐžĐ˝ĐľĐ´ĐľŃĐşĐ°] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐžĐł] [ŃŃĐžŃĐşĐ°] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐľ] [ŃŃĐľĐ´Đľ] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐžĐł] [ŃĐľŃĐ˛ŃŃĐşĐ°] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐžĐł] [ĐżĐľŃĐşĐ°] [Ń] LT',
                    '[ĐżŃĐžŃĐťĐľ] [ŃŃĐąĐžŃĐľ] [Ń] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ĐˇĐ° %s',
            past   : 'ĐżŃĐľ %s',
            s      : 'Đ˝ĐľĐşĐžĐťĐ¸ĐşĐž ŃĐľĐşŃĐ˝Đ´Đ¸',
            m      : sr_cyrl__translator.translate,
            mm     : sr_cyrl__translator.translate,
            h      : sr_cyrl__translator.translate,
            hh     : sr_cyrl__translator.translate,
            d      : 'Đ´Đ°Đ˝',
            dd     : sr_cyrl__translator.translate,
            M      : 'ĐźĐľŃĐľŃ',
            MM     : sr_cyrl__translator.translate,
            y      : 'ĐłĐžĐ´Đ¸Đ˝Ń',
            yy     : sr_cyrl__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Serbian-latin (sr)
    //! author : Milan JanaÄkoviÄ<milanjanackovic@gmail.com> : https://github.com/milan-j

    var sr__translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jedne minute'],
            mm: ['minut', 'minute', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mesec', 'meseca', 'meseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = sr__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + sr__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var sr = moment__default.defineLocale('sr', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'Äetvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'Äet.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'Äe', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedelju] [u] LT';
                case 3:
                    return '[u] [sredu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄe u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[proĹĄle] [nedelje] [u] LT',
                    '[proĹĄlog] [ponedeljka] [u] LT',
                    '[proĹĄlog] [utorka] [u] LT',
                    '[proĹĄle] [srede] [u] LT',
                    '[proĹĄlog] [Äetvrtka] [u] LT',
                    '[proĹĄlog] [petka] [u] LT',
                    '[proĹĄle] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'pre %s',
            s      : 'nekoliko sekundi',
            m      : sr__translator.translate,
            mm     : sr__translator.translate,
            h      : sr__translator.translate,
            hh     : sr__translator.translate,
            d      : 'dan',
            dd     : sr__translator.translate,
            M      : 'mesec',
            MM     : sr__translator.translate,
            y      : 'godinu',
            yy     : sr__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : swedish (sv)
    //! author : Jens Alm : https://github.com/ulmus

    var sv = moment__default.defineLocale('sv', {
        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'sĂśndag_mĂĽndag_tisdag_onsdag_torsdag_fredag_lĂśrdag'.split('_'),
        weekdaysShort : 'sĂśn_mĂĽn_tis_ons_tor_fre_lĂśr'.split('_'),
        weekdaysMin : 'sĂś_mĂĽ_ti_on_to_fr_lĂś'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[IgĂĽr] LT',
            nextWeek: '[PĂĽ] dddd LT',
            lastWeek: '[I] dddd[s] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'fĂśr %s sedan',
            s : 'nĂĽgra sekunder',
            m : 'en minut',
            mm : '%d minuter',
            h : 'en timme',
            hh : '%d timmar',
            d : 'en dag',
            dd : '%d dagar',
            M : 'en mĂĽnad',
            MM : '%d mĂĽnader',
            y : 'ett ĂĽr',
            yy : '%d ĂĽr'
        },
        ordinalParse: /\d{1,2}(e|a)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : swahili (sw)
    //! author : Fahad Kassim : https://github.com/fadsel

    var sw = moment__default.defineLocale('sw', {
        months : 'Januari_Februari_Machi_Aprili_Mei_Juni_Julai_Agosti_Septemba_Oktoba_Novemba_Desemba'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ago_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Jumapili_Jumatatu_Jumanne_Jumatano_Alhamisi_Ijumaa_Jumamosi'.split('_'),
        weekdaysShort : 'Jpl_Jtat_Jnne_Jtan_Alh_Ijm_Jmos'.split('_'),
        weekdaysMin : 'J2_J3_J4_J5_Al_Ij_J1'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[leo saa] LT',
            nextDay : '[kesho saa] LT',
            nextWeek : '[wiki ijayo] dddd [saat] LT',
            lastDay : '[jana] LT',
            lastWeek : '[wiki iliyopita] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s baadaye',
            past : 'tokea %s',
            s : 'hivi punde',
            m : 'dakika moja',
            mm : 'dakika %d',
            h : 'saa limoja',
            hh : 'masaa %d',
            d : 'siku moja',
            dd : 'masiku %d',
            M : 'mwezi mmoja',
            MM : 'miezi %d',
            y : 'mwaka mmoja',
            yy : 'miaka %d'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : tamil (ta)
    //! author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

    var ta__symbolMap = {
        '1': 'ŕŻ§',
        '2': 'ŕŻ¨',
        '3': 'ŕŻŠ',
        '4': 'ŕŻŞ',
        '5': 'ŕŻŤ',
        '6': 'ŕŻŹ',
        '7': 'ŕŻ­',
        '8': 'ŕŻŽ',
        '9': 'ŕŻŻ',
        '0': 'ŕŻŚ'
    }, ta__numberMap = {
        'ŕŻ§': '1',
        'ŕŻ¨': '2',
        'ŕŻŠ': '3',
        'ŕŻŞ': '4',
        'ŕŻŤ': '5',
        'ŕŻŹ': '6',
        'ŕŻ­': '7',
        'ŕŻŽ': '8',
        'ŕŻŻ': '9',
        'ŕŻŚ': '0'
    };

    var ta = moment__default.defineLocale('ta', {
        months : 'ŕŽŕŽŠŕŽľŕŽ°ŕŽż_ŕŽŞŕŽżŕŽŞŕŻŕŽ°ŕŽľŕŽ°ŕŽż_ŕŽŽŕŽžŕŽ°ŕŻŕŽŕŻ_ŕŽŕŽŞŕŻŕŽ°ŕŽ˛ŕŻ_ŕŽŽŕŻ_ŕŽŕŻŕŽŠŕŻ_ŕŽŕŻŕŽ˛ŕŻ_ŕŽŕŽŕŽ¸ŕŻŕŽŕŻ_ŕŽŕŻŕŽŞŕŻŕŽŕŻŕŽŽŕŻŕŽŞŕŽ°ŕŻ_ŕŽŕŽŕŻŕŽŕŻŕŽžŕŽŞŕŽ°ŕŻ_ŕŽ¨ŕŽľŕŽŽŕŻŕŽŞŕŽ°ŕŻ_ŕŽŕŽżŕŽŕŽŽŕŻŕŽŞŕŽ°ŕŻ'.split('_'),
        monthsShort : 'ŕŽŕŽŠŕŽľŕŽ°ŕŽż_ŕŽŞŕŽżŕŽŞŕŻŕŽ°ŕŽľŕŽ°ŕŽż_ŕŽŽŕŽžŕŽ°ŕŻŕŽŕŻ_ŕŽŕŽŞŕŻŕŽ°ŕŽ˛ŕŻ_ŕŽŽŕŻ_ŕŽŕŻŕŽŠŕŻ_ŕŽŕŻŕŽ˛ŕŻ_ŕŽŕŽŕŽ¸ŕŻŕŽŕŻ_ŕŽŕŻŕŽŞŕŻŕŽŕŻŕŽŽŕŻŕŽŞŕŽ°ŕŻ_ŕŽŕŽŕŻŕŽŕŻŕŽžŕŽŞŕŽ°ŕŻ_ŕŽ¨ŕŽľŕŽŽŕŻŕŽŞŕŽ°ŕŻ_ŕŽŕŽżŕŽŕŽŽŕŻŕŽŞŕŽ°ŕŻ'.split('_'),
        weekdays : 'ŕŽŕŽžŕŽŻŕŽżŕŽąŕŻŕŽąŕŻŕŽŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽ¤ŕŽżŕŽŕŻŕŽŕŽŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽŕŻŕŽľŕŻŕŽľŕŽžŕŽŻŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽŞŕŻŕŽ¤ŕŽŠŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽľŕŽżŕŽŻŕŽžŕŽ´ŕŽŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽľŕŻŕŽłŕŻŕŽłŕŽżŕŽŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ_ŕŽŕŽŠŕŽżŕŽŕŻŕŽŕŽżŕŽ´ŕŽŽŕŻ'.split('_'),
        weekdaysShort : 'ŕŽŕŽžŕŽŻŕŽżŕŽąŕŻ_ŕŽ¤ŕŽżŕŽŕŻŕŽŕŽłŕŻ_ŕŽŕŻŕŽľŕŻŕŽľŕŽžŕŽŻŕŻ_ŕŽŞŕŻŕŽ¤ŕŽŠŕŻ_ŕŽľŕŽżŕŽŻŕŽžŕŽ´ŕŽŠŕŻ_ŕŽľŕŻŕŽłŕŻŕŽłŕŽż_ŕŽŕŽŠŕŽż'.split('_'),
        weekdaysMin : 'ŕŽŕŽž_ŕŽ¤ŕŽż_ŕŽŕŻ_ŕŽŞŕŻ_ŕŽľŕŽż_ŕŽľŕŻ_ŕŽ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, HH:mm',
            LLLL : 'dddd, D MMMM YYYY, HH:mm'
        },
        calendar : {
            sameDay : '[ŕŽŕŽŠŕŻŕŽąŕŻ] LT',
            nextDay : '[ŕŽ¨ŕŽžŕŽłŕŻ] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕŽ¨ŕŻŕŽąŕŻŕŽąŕŻ] LT',
            lastWeek : '[ŕŽŕŽŕŽ¨ŕŻŕŽ¤ ŕŽľŕŽžŕŽ°ŕŽŽŕŻ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕŽŕŽ˛ŕŻ',
            past : '%s ŕŽŽŕŻŕŽŠŕŻ',
            s : 'ŕŽŕŽ°ŕŻ ŕŽŕŽżŕŽ˛ ŕŽľŕŽżŕŽ¨ŕŽžŕŽŕŽżŕŽŕŽłŕŻ',
            m : 'ŕŽŕŽ°ŕŻ ŕŽ¨ŕŽżŕŽŽŕŽżŕŽŕŽŽŕŻ',
            mm : '%d ŕŽ¨ŕŽżŕŽŽŕŽżŕŽŕŽŕŻŕŽŕŽłŕŻ',
            h : 'ŕŽŕŽ°ŕŻ ŕŽŽŕŽŁŕŽż ŕŽ¨ŕŻŕŽ°ŕŽŽŕŻ',
            hh : '%d ŕŽŽŕŽŁŕŽż ŕŽ¨ŕŻŕŽ°ŕŽŽŕŻ',
            d : 'ŕŽŕŽ°ŕŻ ŕŽ¨ŕŽžŕŽłŕŻ',
            dd : '%d ŕŽ¨ŕŽžŕŽŕŻŕŽŕŽłŕŻ',
            M : 'ŕŽŕŽ°ŕŻ ŕŽŽŕŽžŕŽ¤ŕŽŽŕŻ',
            MM : '%d ŕŽŽŕŽžŕŽ¤ŕŽŕŻŕŽŕŽłŕŻ',
            y : 'ŕŽŕŽ°ŕŻ ŕŽľŕŽ°ŕŻŕŽŕŽŽŕŻ',
            yy : '%d ŕŽŕŽŁŕŻŕŽŕŻŕŽŕŽłŕŻ'
        },
        ordinalParse: /\d{1,2}ŕŽľŕŽ¤ŕŻ/,
        ordinal : function (number) {
            return number + 'ŕŽľŕŽ¤ŕŻ';
        },
        preparse: function (string) {
            return string.replace(/[ŕŻ§ŕŻ¨ŕŻŠŕŻŞŕŻŤŕŻŹŕŻ­ŕŻŽŕŻŻŕŻŚ]/g, function (match) {
                return ta__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ta__symbolMap[match];
            });
        },
        // refer http://ta.wikipedia.org/s/1er1
        meridiemParse: /ŕŽŻŕŽžŕŽŽŕŽŽŕŻ|ŕŽľŕŻŕŽŕŽąŕŻ|ŕŽŕŽžŕŽ˛ŕŻ|ŕŽ¨ŕŽŁŕŻŕŽŞŕŽŕŽ˛ŕŻ|ŕŽŕŽąŕŻŕŽŞŕŽžŕŽŕŻ|ŕŽŽŕŽžŕŽ˛ŕŻ/,
        meridiem : function (hour, minute, isLower) {
            if (hour < 2) {
                return ' ŕŽŻŕŽžŕŽŽŕŽŽŕŻ';
            } else if (hour < 6) {
                return ' ŕŽľŕŻŕŽŕŽąŕŻ';  // ŕŽľŕŻŕŽŕŽąŕŻ
            } else if (hour < 10) {
                return ' ŕŽŕŽžŕŽ˛ŕŻ'; // ŕŽŕŽžŕŽ˛ŕŻ
            } else if (hour < 14) {
                return ' ŕŽ¨ŕŽŁŕŻŕŽŞŕŽŕŽ˛ŕŻ'; // ŕŽ¨ŕŽŁŕŻŕŽŞŕŽŕŽ˛ŕŻ
            } else if (hour < 18) {
                return ' ŕŽŕŽąŕŻŕŽŞŕŽžŕŽŕŻ'; // ŕŽŕŽąŕŻŕŽŞŕŽžŕŽŕŻ
            } else if (hour < 22) {
                return ' ŕŽŽŕŽžŕŽ˛ŕŻ'; // ŕŽŽŕŽžŕŽ˛ŕŻ
            } else {
                return ' ŕŽŻŕŽžŕŽŽŕŽŽŕŻ';
            }
        },
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕŽŻŕŽžŕŽŽŕŽŽŕŻ') {
                return hour < 2 ? hour : hour + 12;
            } else if (meridiem === 'ŕŽľŕŻŕŽŕŽąŕŻ' || meridiem === 'ŕŽŕŽžŕŽ˛ŕŻ') {
                return hour;
            } else if (meridiem === 'ŕŽ¨ŕŽŁŕŻŕŽŞŕŽŕŽ˛ŕŻ') {
                return hour >= 10 ? hour : hour + 12;
            } else {
                return hour + 12;
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : telugu (te)
    //! author : Krishna Chaitanya Thota : https://github.com/kcthota

    var te = moment__default.defineLocale('te', {
        months : 'ŕ°ŕ°¨ŕ°ľŕ°°ŕ°ż_ŕ°Ťŕ°żŕ°Źŕąŕ°°ŕ°ľŕ°°ŕ°ż_ŕ°Žŕ°žŕ°°ŕąŕ°ŕ°ż_ŕ°ŕ°Şŕąŕ°°ŕ°żŕ°˛ŕą_ŕ°Žŕą_ŕ°ŕąŕ°¨ŕą_ŕ°ŕąŕ°˛ŕąŕą_ŕ°ŕ°ŕ°¸ŕąŕ°ŕą_ŕ°¸ŕąŕ°Şŕąŕ°ŕąŕ°ŕ°Źŕ°°ŕą_ŕ°ŕ°ŕąŕ°ŕąŕ°Źŕ°°ŕą_ŕ°¨ŕ°ľŕ°ŕ°Źŕ°°ŕą_ŕ°Ąŕ°żŕ°¸ŕąŕ°ŕ°Źŕ°°ŕą'.split('_'),
        monthsShort : 'ŕ°ŕ°¨._ŕ°Ťŕ°żŕ°Źŕąŕ°°._ŕ°Žŕ°žŕ°°ŕąŕ°ŕ°ż_ŕ°ŕ°Şŕąŕ°°ŕ°ż._ŕ°Žŕą_ŕ°ŕąŕ°¨ŕą_ŕ°ŕąŕ°˛ŕąŕą_ŕ°ŕ°._ŕ°¸ŕąŕ°Şŕą._ŕ°ŕ°ŕąŕ°ŕą._ŕ°¨ŕ°ľ._ŕ°Ąŕ°żŕ°¸ŕą.'.split('_'),
        weekdays : 'ŕ°ŕ°Śŕ°żŕ°ľŕ°žŕ°°ŕ°_ŕ°¸ŕąŕ°Žŕ°ľŕ°žŕ°°ŕ°_ŕ°Žŕ°ŕ°ŕ°łŕ°ľŕ°žŕ°°ŕ°_ŕ°Źŕąŕ°§ŕ°ľŕ°žŕ°°ŕ°_ŕ°ŕąŕ°°ŕąŕ°ľŕ°žŕ°°ŕ°_ŕ°śŕąŕ°ŕąŕ°°ŕ°ľŕ°žŕ°°ŕ°_ŕ°śŕ°¨ŕ°żŕ°ľŕ°žŕ°°ŕ°'.split('_'),
        weekdaysShort : 'ŕ°ŕ°Śŕ°ż_ŕ°¸ŕąŕ°Ž_ŕ°Žŕ°ŕ°ŕ°ł_ŕ°Źŕąŕ°§_ŕ°ŕąŕ°°ŕą_ŕ°śŕąŕ°ŕąŕ°°_ŕ°śŕ°¨ŕ°ż'.split('_'),
        weekdaysMin : 'ŕ°_ŕ°¸ŕą_ŕ°Žŕ°_ŕ°Źŕą_ŕ°ŕą_ŕ°śŕą_ŕ°ś'.split('_'),
        longDateFormat : {
            LT : 'A h:mm',
            LTS : 'A h:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm',
            LLLL : 'dddd, D MMMM YYYY, A h:mm'
        },
        calendar : {
            sameDay : '[ŕ°¨ŕąŕ°Ąŕą] LT',
            nextDay : '[ŕ°°ŕąŕ°Şŕą] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[ŕ°¨ŕ°żŕ°¨ŕąŕ°¨] LT',
            lastWeek : '[ŕ°ŕ°¤] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s ŕ°˛ŕą',
            past : '%s ŕ°ŕąŕ°°ŕ°żŕ°¤ŕ°',
            s : 'ŕ°ŕąŕ°¨ŕąŕ°¨ŕ°ż ŕ°ŕąŕ°ˇŕ°Łŕ°žŕ°˛ŕą',
            m : 'ŕ°ŕ° ŕ°¨ŕ°żŕ°Žŕ°żŕ°ˇŕ°',
            mm : '%d ŕ°¨ŕ°żŕ°Žŕ°żŕ°ˇŕ°žŕ°˛ŕą',
            h : 'ŕ°ŕ° ŕ°ŕ°ŕ°',
            hh : '%d ŕ°ŕ°ŕ°ŕ°˛ŕą',
            d : 'ŕ°ŕ° ŕ°°ŕąŕ°ŕą',
            dd : '%d ŕ°°ŕąŕ°ŕąŕ°˛ŕą',
            M : 'ŕ°ŕ° ŕ°¨ŕąŕ°˛',
            MM : '%d ŕ°¨ŕąŕ°˛ŕ°˛ŕą',
            y : 'ŕ°ŕ° ŕ°¸ŕ°ŕ°ľŕ°¤ŕąŕ°¸ŕ°°ŕ°',
            yy : '%d ŕ°¸ŕ°ŕ°ľŕ°¤ŕąŕ°¸ŕ°°ŕ°žŕ°˛ŕą'
        },
        ordinalParse : /\d{1,2}ŕ°ľ/,
        ordinal : '%dŕ°ľ',
        meridiemParse: /ŕ°°ŕ°žŕ°¤ŕąŕ°°ŕ°ż|ŕ°ŕ°Śŕ°Żŕ°|ŕ°Žŕ°§ŕąŕ°Żŕ°žŕ°šŕąŕ°¨ŕ°|ŕ°¸ŕ°žŕ°Żŕ°ŕ°¤ŕąŕ°°ŕ°/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ŕ°°ŕ°žŕ°¤ŕąŕ°°ŕ°ż') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'ŕ°ŕ°Śŕ°Żŕ°') {
                return hour;
            } else if (meridiem === 'ŕ°Žŕ°§ŕąŕ°Żŕ°žŕ°šŕąŕ°¨ŕ°') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'ŕ°¸ŕ°žŕ°Żŕ°ŕ°¤ŕąŕ°°ŕ°') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'ŕ°°ŕ°žŕ°¤ŕąŕ°°ŕ°ż';
            } else if (hour < 10) {
                return 'ŕ°ŕ°Śŕ°Żŕ°';
            } else if (hour < 17) {
                return 'ŕ°Žŕ°§ŕąŕ°Żŕ°žŕ°šŕąŕ°¨ŕ°';
            } else if (hour < 20) {
                return 'ŕ°¸ŕ°žŕ°Żŕ°ŕ°¤ŕąŕ°°ŕ°';
            } else {
                return 'ŕ°°ŕ°žŕ°¤ŕąŕ°°ŕ°ż';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : thai (th)
    //! author : Kridsada Thanabulpong : https://github.com/sirn

    var th = moment__default.defineLocale('th', {
        months : 'ŕ¸Ąŕ¸ŕ¸Łŕ¸˛ŕ¸ŕ¸Ą_ŕ¸ŕ¸¸ŕ¸Ąŕ¸ ŕ¸˛ŕ¸ŕ¸ąŕ¸ŕ¸ŕš_ŕ¸Ąŕ¸ľŕ¸ŕ¸˛ŕ¸ŕ¸Ą_ŕšŕ¸Ąŕ¸Šŕ¸˛ŕ¸˘ŕ¸_ŕ¸ŕ¸¤ŕ¸Šŕ¸ ŕ¸˛ŕ¸ŕ¸Ą_ŕ¸Ąŕ¸´ŕ¸ŕ¸¸ŕ¸ŕ¸˛ŕ¸˘ŕ¸_ŕ¸ŕ¸Łŕ¸ŕ¸ŕ¸˛ŕ¸ŕ¸Ą_ŕ¸Şŕ¸´ŕ¸ŕ¸Ťŕ¸˛ŕ¸ŕ¸Ą_ŕ¸ŕ¸ąŕ¸ŕ¸˘ŕ¸˛ŕ¸˘ŕ¸_ŕ¸ŕ¸¸ŕ¸Ľŕ¸˛ŕ¸ŕ¸Ą_ŕ¸ŕ¸¤ŕ¸¨ŕ¸ŕ¸´ŕ¸ŕ¸˛ŕ¸˘ŕ¸_ŕ¸ŕ¸ąŕ¸ŕ¸§ŕ¸˛ŕ¸ŕ¸Ą'.split('_'),
        monthsShort : 'ŕ¸Ąŕ¸ŕ¸Łŕ¸˛_ŕ¸ŕ¸¸ŕ¸Ąŕ¸ ŕ¸˛_ŕ¸Ąŕ¸ľŕ¸ŕ¸˛_ŕšŕ¸Ąŕ¸Šŕ¸˛_ŕ¸ŕ¸¤ŕ¸Šŕ¸ ŕ¸˛_ŕ¸Ąŕ¸´ŕ¸ŕ¸¸ŕ¸ŕ¸˛_ŕ¸ŕ¸Łŕ¸ŕ¸ŕ¸˛_ŕ¸Şŕ¸´ŕ¸ŕ¸Ťŕ¸˛_ŕ¸ŕ¸ąŕ¸ŕ¸˘ŕ¸˛_ŕ¸ŕ¸¸ŕ¸Ľŕ¸˛_ŕ¸ŕ¸¤ŕ¸¨ŕ¸ŕ¸´ŕ¸ŕ¸˛_ŕ¸ŕ¸ąŕ¸ŕ¸§ŕ¸˛'.split('_'),
        weekdays : 'ŕ¸­ŕ¸˛ŕ¸ŕ¸´ŕ¸ŕ¸˘ŕš_ŕ¸ŕ¸ąŕ¸ŕ¸ŕ¸Łŕš_ŕ¸­ŕ¸ąŕ¸ŕ¸ŕ¸˛ŕ¸Ł_ŕ¸ŕ¸¸ŕ¸_ŕ¸ŕ¸¤ŕ¸Ťŕ¸ąŕ¸Şŕ¸ŕ¸ŕ¸ľ_ŕ¸¨ŕ¸¸ŕ¸ŕ¸Łŕš_ŕšŕ¸Şŕ¸˛ŕ¸Łŕš'.split('_'),
        weekdaysShort : 'ŕ¸­ŕ¸˛ŕ¸ŕ¸´ŕ¸ŕ¸˘ŕš_ŕ¸ŕ¸ąŕ¸ŕ¸ŕ¸Łŕš_ŕ¸­ŕ¸ąŕ¸ŕ¸ŕ¸˛ŕ¸Ł_ŕ¸ŕ¸¸ŕ¸_ŕ¸ŕ¸¤ŕ¸Ťŕ¸ąŕ¸Ş_ŕ¸¨ŕ¸¸ŕ¸ŕ¸Łŕš_ŕšŕ¸Şŕ¸˛ŕ¸Łŕš'.split('_'), // yes, three characters difference
        weekdaysMin : 'ŕ¸­ŕ¸˛._ŕ¸._ŕ¸­._ŕ¸._ŕ¸ŕ¸¤._ŕ¸¨._ŕ¸Ş.'.split('_'),
        longDateFormat : {
            LT : 'H ŕ¸ŕ¸˛ŕ¸Źŕ¸´ŕ¸ŕ¸˛ m ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            LTS : 'H ŕ¸ŕ¸˛ŕ¸Źŕ¸´ŕ¸ŕ¸˛ m ŕ¸ŕ¸˛ŕ¸ŕ¸ľ s ŕ¸§ŕ¸´ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            L : 'YYYY/MM/DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY ŕšŕ¸§ŕ¸Ľŕ¸˛ H ŕ¸ŕ¸˛ŕ¸Źŕ¸´ŕ¸ŕ¸˛ m ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            LLLL : 'ŕ¸§ŕ¸ąŕ¸ddddŕ¸ŕ¸ľŕš D MMMM YYYY ŕšŕ¸§ŕ¸Ľŕ¸˛ H ŕ¸ŕ¸˛ŕ¸Źŕ¸´ŕ¸ŕ¸˛ m ŕ¸ŕ¸˛ŕ¸ŕ¸ľ'
        },
        meridiemParse: /ŕ¸ŕšŕ¸­ŕ¸ŕšŕ¸ŕ¸ľŕšŕ¸˘ŕ¸|ŕ¸Ťŕ¸Ľŕ¸ąŕ¸ŕšŕ¸ŕ¸ľŕšŕ¸˘ŕ¸/,
        isPM: function (input) {
            return input === 'ŕ¸Ťŕ¸Ľŕ¸ąŕ¸ŕšŕ¸ŕ¸ľŕšŕ¸˘ŕ¸';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'ŕ¸ŕšŕ¸­ŕ¸ŕšŕ¸ŕ¸ľŕšŕ¸˘ŕ¸';
            } else {
                return 'ŕ¸Ťŕ¸Ľŕ¸ąŕ¸ŕšŕ¸ŕ¸ľŕšŕ¸˘ŕ¸';
            }
        },
        calendar : {
            sameDay : '[ŕ¸§ŕ¸ąŕ¸ŕ¸ŕ¸ľŕš ŕšŕ¸§ŕ¸Ľŕ¸˛] LT',
            nextDay : '[ŕ¸ŕ¸Łŕ¸¸ŕšŕ¸ŕ¸ŕ¸ľŕš ŕšŕ¸§ŕ¸Ľŕ¸˛] LT',
            nextWeek : 'dddd[ŕ¸Ťŕ¸ŕšŕ¸˛ ŕšŕ¸§ŕ¸Ľŕ¸˛] LT',
            lastDay : '[ŕšŕ¸Ąŕ¸ˇŕšŕ¸­ŕ¸§ŕ¸˛ŕ¸ŕ¸ŕ¸ľŕš ŕšŕ¸§ŕ¸Ľŕ¸˛] LT',
            lastWeek : '[ŕ¸§ŕ¸ąŕ¸]dddd[ŕ¸ŕ¸ľŕšŕšŕ¸Ľŕšŕ¸§ ŕšŕ¸§ŕ¸Ľŕ¸˛] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ŕ¸­ŕ¸ľŕ¸ %s',
            past : '%sŕ¸ŕ¸ľŕšŕšŕ¸Ľŕšŕ¸§',
            s : 'ŕšŕ¸Ąŕšŕ¸ŕ¸ľŕšŕ¸§ŕ¸´ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            m : '1 ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            mm : '%d ŕ¸ŕ¸˛ŕ¸ŕ¸ľ',
            h : '1 ŕ¸ŕ¸ąŕšŕ¸§ŕšŕ¸Ąŕ¸',
            hh : '%d ŕ¸ŕ¸ąŕšŕ¸§ŕšŕ¸Ąŕ¸',
            d : '1 ŕ¸§ŕ¸ąŕ¸',
            dd : '%d ŕ¸§ŕ¸ąŕ¸',
            M : '1 ŕšŕ¸ŕ¸ˇŕ¸­ŕ¸',
            MM : '%d ŕšŕ¸ŕ¸ˇŕ¸­ŕ¸',
            y : '1 ŕ¸ŕ¸ľ',
            yy : '%d ŕ¸ŕ¸ľ'
        }
    });

    //! moment.js locale configuration
    //! locale : Tagalog/Filipino (tl-ph)
    //! author : Dan Hagman

    var tl_ph = moment__default.defineLocale('tl-ph', {
        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'MM/D/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY HH:mm',
            LLLL : 'dddd, MMMM DD, YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Ngayon sa] LT',
            nextDay: '[Bukas sa] LT',
            nextWeek: 'dddd [sa] LT',
            lastDay: '[Kahapon sa] LT',
            lastWeek: 'dddd [huling linggo] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'sa loob ng %s',
            past : '%s ang nakalipas',
            s : 'ilang segundo',
            m : 'isang minuto',
            mm : '%d minuto',
            h : 'isang oras',
            hh : '%d oras',
            d : 'isang araw',
            dd : '%d araw',
            M : 'isang buwan',
            MM : '%d buwan',
            y : 'isang taon',
            yy : '%d taon'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Klingon (tlh)
    //! author : Dominika Kruk : https://github.com/amaranthrose

    var numbersNouns = 'pagh_waâ_chaâ_wej_loS_vagh_jav_Soch_chorgh_Hut'.split('_');

    function translateFuture(output) {
        var time = output;
        time = (output.indexOf('jaj') !== -1) ?
    	time.slice(0, -3) + 'leS' :
    	(output.indexOf('jar') !== -1) ?
    	time.slice(0, -3) + 'waQ' :
    	(output.indexOf('DIS') !== -1) ?
    	time.slice(0, -3) + 'nem' :
    	time + ' pIq';
        return time;
    }

    function translatePast(output) {
        var time = output;
        time = (output.indexOf('jaj') !== -1) ?
    	time.slice(0, -3) + 'Huâ' :
    	(output.indexOf('jar') !== -1) ?
    	time.slice(0, -3) + 'wen' :
    	(output.indexOf('DIS') !== -1) ?
    	time.slice(0, -3) + 'ben' :
    	time + ' ret';
        return time;
    }

    function tlh__translate(number, withoutSuffix, string, isFuture) {
        var numberNoun = numberAsNoun(number);
        switch (string) {
            case 'mm':
                return numberNoun + ' tup';
            case 'hh':
                return numberNoun + ' rep';
            case 'dd':
                return numberNoun + ' jaj';
            case 'MM':
                return numberNoun + ' jar';
            case 'yy':
                return numberNoun + ' DIS';
        }
    }

    function numberAsNoun(number) {
        var hundred = Math.floor((number % 1000) / 100),
    	ten = Math.floor((number % 100) / 10),
    	one = number % 10,
    	word = '';
        if (hundred > 0) {
            word += numbersNouns[hundred] + 'vatlh';
        }
        if (ten > 0) {
            word += ((word !== '') ? ' ' : '') + numbersNouns[ten] + 'maH';
        }
        if (one > 0) {
            word += ((word !== '') ? ' ' : '') + numbersNouns[one];
        }
        return (word === '') ? 'pagh' : word;
    }

    var tlh = moment__default.defineLocale('tlh', {
        months : 'teraâ jar waâ_teraâ jar chaâ_teraâ jar wej_teraâ jar loS_teraâ jar vagh_teraâ jar jav_teraâ jar Soch_teraâ jar chorgh_teraâ jar Hut_teraâ jar waâmaH_teraâ jar waâmaH waâ_teraâ jar waâmaH chaâ'.split('_'),
        monthsShort : 'jar waâ_jar chaâ_jar wej_jar loS_jar vagh_jar jav_jar Soch_jar chorgh_jar Hut_jar waâmaH_jar waâmaH waâ_jar waâmaH chaâ'.split('_'),
        weekdays : 'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split('_'),
        weekdaysShort : 'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split('_'),
        weekdaysMin : 'lojmItjaj_DaSjaj_povjaj_ghItlhjaj_loghjaj_buqjaj_ghInjaj'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[DaHjaj] LT',
            nextDay: '[waâleS] LT',
            nextWeek: 'LLL',
            lastDay: '[waâHuâ] LT',
            lastWeek: 'LLL',
            sameElse: 'L'
        },
        relativeTime : {
            future : translateFuture,
            past : translatePast,
            s : 'puS lup',
            m : 'waâ tup',
            mm : tlh__translate,
            h : 'waâ rep',
            hh : tlh__translate,
            d : 'waâ jaj',
            dd : tlh__translate,
            M : 'waâ jar',
            MM : tlh__translate,
            y : 'waâ DIS',
            yy : tlh__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : turkish (tr)
    //! authors : Erhan Gundogan : https://github.com/erhangundogan,
    //!           Burak YiÄit Kaya: https://github.com/BYK

    var tr__suffixes = {
        1: '\'inci',
        5: '\'inci',
        8: '\'inci',
        70: '\'inci',
        80: '\'inci',
        2: '\'nci',
        7: '\'nci',
        20: '\'nci',
        50: '\'nci',
        3: '\'ĂźncĂź',
        4: '\'ĂźncĂź',
        100: '\'ĂźncĂź',
        6: '\'ncÄą',
        9: '\'uncu',
        10: '\'uncu',
        30: '\'uncu',
        60: '\'ÄąncÄą',
        90: '\'ÄąncÄą'
    };

    var tr = moment__default.defineLocale('tr', {
        months : 'Ocak_Ĺubat_Mart_Nisan_MayÄąs_Haziran_Temmuz_AÄustos_EylĂźl_Ekim_KasÄąm_AralÄąk'.split('_'),
        monthsShort : 'Oca_Ĺub_Mar_Nis_May_Haz_Tem_AÄu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays : 'Pazar_Pazartesi_SalÄą_ĂarĹamba_PerĹembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort : 'Paz_Pts_Sal_Ăar_Per_Cum_Cts'.split('_'),
        weekdaysMin : 'Pz_Pt_Sa_Ăa_Pe_Cu_Ct'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[bugĂźn saat] LT',
            nextDay : '[yarÄąn saat] LT',
            nextWeek : '[haftaya] dddd [saat] LT',
            lastDay : '[dĂźn] LT',
            lastWeek : '[geĂ§en hafta] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s Ăśnce',
            s : 'birkaĂ§ saniye',
            m : 'bir dakika',
            mm : '%d dakika',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gĂźn',
            dd : '%d gĂźn',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir yÄąl',
            yy : '%d yÄąl'
        },
        ordinalParse: /\d{1,2}'(inci|nci|ĂźncĂź|ncÄą|uncu|ÄąncÄą)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '\'ÄąncÄą';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;
            return number + (tr__suffixes[a] || tr__suffixes[b] || tr__suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : talossan (tzl)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v with the help of IustĂŹ Canun


    // After the year there should be a slash and the amount of years since December 26, 1979 in Roman numerals.
    // This is currently too difficult (maybe even impossible) to add.
    var tzl = moment__default.defineLocale('tzl', {
        months : 'Januar_Fevraglh_MarĂ§_AvrĂŻu_Mai_GĂźn_Julia_Guscht_Setemvar_ListopĂ¤ts_Noemvar_Zecemvar'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Avr_Mai_GĂźn_Jul_Gus_Set_Lis_Noe_Zec'.split('_'),
        weekdays : 'SĂşladi_LĂşneĂ§i_Maitzi_MĂĄrcuri_XhĂşadi_ViĂŠnerĂ§i_SĂĄturi'.split('_'),
        weekdaysShort : 'SĂşl_LĂşn_Mai_MĂĄr_XhĂş_ViĂŠ_SĂĄt'.split('_'),
        weekdaysMin : 'SĂş_LĂş_Ma_MĂĄ_Xh_Vi_SĂĄ'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM [dallas] YYYY',
            LLL : 'D. MMMM [dallas] YYYY HH.mm',
            LLLL : 'dddd, [li] D. MMMM [dallas] YYYY HH.mm'
        },
        meridiemParse: /d\'o|d\'a/i,
        isPM : function (input) {
            return 'd\'o' === input.toLowerCase();
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'd\'o' : 'D\'O';
            } else {
                return isLower ? 'd\'a' : 'D\'A';
            }
        },
        calendar : {
            sameDay : '[oxhi Ă ] LT',
            nextDay : '[demĂ  Ă ] LT',
            nextWeek : 'dddd [Ă ] LT',
            lastDay : '[ieiri Ă ] LT',
            lastWeek : '[sĂźr el] dddd [lasteu Ă ] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'osprei %s',
            past : 'ja%s',
            s : tzl__processRelativeTime,
            m : tzl__processRelativeTime,
            mm : tzl__processRelativeTime,
            h : tzl__processRelativeTime,
            hh : tzl__processRelativeTime,
            d : tzl__processRelativeTime,
            dd : tzl__processRelativeTime,
            M : tzl__processRelativeTime,
            MM : tzl__processRelativeTime,
            y : tzl__processRelativeTime,
            yy : tzl__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    function tzl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's': ['viensas secunds', '\'iensas secunds'],
            'm': ['\'n mĂ­ut', '\'iens mĂ­ut'],
            'mm': [number + ' mĂ­uts', '' + number + ' mĂ­uts'],
            'h': ['\'n Ăžora', '\'iensa Ăžora'],
            'hh': [number + ' Ăžoras', '' + number + ' Ăžoras'],
            'd': ['\'n ziua', '\'iensa ziua'],
            'dd': [number + ' ziuas', '' + number + ' ziuas'],
            'M': ['\'n mes', '\'iens mes'],
            'MM': [number + ' mesen', '' + number + ' mesen'],
            'y': ['\'n ar', '\'iens ar'],
            'yy': [number + ' ars', '' + number + ' ars']
        };
        return isFuture ? format[key][0] : (withoutSuffix ? format[key][0] : format[key][1]);
    }

    //! moment.js locale configuration
    //! locale : Morocco Central Atlas TamaziÉŁt in Latin (tzm-latn)
    //! author : Abdel Said : https://github.com/abdelsaid

    var tzm_latn = moment__default.defineLocale('tzm-latn', {
        months : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_ÉŁwĹĄt_ĹĄwtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
        monthsShort : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_ÉŁwĹĄt_ĹĄwtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dadkh s yan %s',
            past : 'yan %s',
            s : 'imik',
            m : 'minuá¸',
            mm : '%d minuá¸',
            h : 'saÉa',
            hh : '%d tassaÉin',
            d : 'ass',
            dd : '%d ossan',
            M : 'ayowr',
            MM : '%d iyyirn',
            y : 'asgas',
            yy : '%d isgasn'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Morocco Central Atlas TamaziÉŁt (tzm)
    //! author : Abdel Said : https://github.com/abdelsaid

    var tzm = moment__default.defineLocale('tzm', {
        months : 'âľâľâľâ´°âľ˘âľ_â´ąâľâ´°âľ˘âľ_âľâ´°âľâľ_âľâ´ąâľâľâľ_âľâ´°âľ˘âľ˘âľ_âľ˘âľâľâľ˘âľ_âľ˘âľâľâľ˘âľâľŁ_âľâľâľâľ_âľâľâľâ´°âľâ´ąâľâľ_â´˝âľâľâ´ąâľ_âľâľâľĄâ´°âľâ´ąâľâľ_â´ˇâľâľâľâ´ąâľâľ'.split('_'),
        monthsShort : 'âľâľâľâ´°âľ˘âľ_â´ąâľâ´°âľ˘âľ_âľâ´°âľâľ_âľâ´ąâľâľâľ_âľâ´°âľ˘âľ˘âľ_âľ˘âľâľâľ˘âľ_âľ˘âľâľâľ˘âľâľŁ_âľâľâľâľ_âľâľâľâ´°âľâ´ąâľâľ_â´˝âľâľâ´ąâľ_âľâľâľĄâ´°âľâ´ąâľâľ_â´ˇâľâľâľâ´ąâľâľ'.split('_'),
        weekdays : 'â´°âľâ´°âľâ´°âľ_â´°âľ˘âľâ´°âľ_â´°âľâľâľâ´°âľ_â´°â´˝âľâ´°âľ_â´°â´˝âľĄâ´°âľ_â´°âľâľâľâľĄâ´°âľ_â´°âľâľâ´šâľ˘â´°âľ'.split('_'),
        weekdaysShort : 'â´°âľâ´°âľâ´°âľ_â´°âľ˘âľâ´°âľ_â´°âľâľâľâ´°âľ_â´°â´˝âľâ´°âľ_â´°â´˝âľĄâ´°âľ_â´°âľâľâľâľĄâ´°âľ_â´°âľâľâ´šâľ˘â´°âľ'.split('_'),
        weekdaysMin : 'â´°âľâ´°âľâ´°âľ_â´°âľ˘âľâ´°âľ_â´°âľâľâľâ´°âľ_â´°â´˝âľâ´°âľ_â´°â´˝âľĄâ´°âľ_â´°âľâľâľâľĄâ´°âľ_â´°âľâľâ´šâľ˘â´°âľ'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[â´°âľâ´ˇâľ â´´] LT',
            nextDay: '[â´°âľâ´˝â´° â´´] LT',
            nextWeek: 'dddd [â´´] LT',
            lastDay: '[â´°âľâ´°âľâľ â´´] LT',
            lastWeek: 'dddd [â´´] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'â´ˇâ´°â´ˇâľ âľ âľ˘â´°âľ %s',
            past : 'âľ˘â´°âľ %s',
            s : 'âľâľâľâ´˝',
            m : 'âľâľâľâľâ´ş',
            mm : '%d âľâľâľâľâ´ş',
            h : 'âľâ´°âľâ´°',
            hh : '%d âľâ´°âľâľâ´°âľâľâľ',
            d : 'â´°âľâľ',
            dd : '%d oâľâľâ´°âľ',
            M : 'â´°âľ˘oâľâľ',
            MM : '%d âľâľ˘âľ˘âľâľâľ',
            y : 'â´°âľâ´łâ´°âľ',
            yy : '%d âľâľâ´łâ´°âľâľ'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : ukrainian (uk)
    //! author : zemlanin : https://github.com/zemlanin
    //! Author : Menelion ElensĂşle : https://github.com/Oire

    function uk__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function uk__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'ŃĐ˛Đ¸ĐťĐ¸Đ˝Đ°_ŃĐ˛Đ¸ĐťĐ¸Đ˝Đ¸_ŃĐ˛Đ¸ĐťĐ¸Đ˝' : 'ŃĐ˛Đ¸ĐťĐ¸Đ˝Ń_ŃĐ˛Đ¸ĐťĐ¸Đ˝Đ¸_ŃĐ˛Đ¸ĐťĐ¸Đ˝',
            'hh': withoutSuffix ? 'ĐłĐžĐ´Đ¸Đ˝Đ°_ĐłĐžĐ´Đ¸Đ˝Đ¸_ĐłĐžĐ´Đ¸Đ˝' : 'ĐłĐžĐ´Đ¸Đ˝Ń_ĐłĐžĐ´Đ¸Đ˝Đ¸_ĐłĐžĐ´Đ¸Đ˝',
            'dd': 'Đ´ĐľĐ˝Ń_Đ´Đ˝Ń_Đ´Đ˝ŃĐ˛',
            'MM': 'ĐźŃŃŃŃŃ_ĐźŃŃŃŃŃ_ĐźŃŃŃŃŃĐ˛',
            'yy': 'ŃŃĐş_ŃĐžĐşĐ¸_ŃĐžĐşŃĐ˛'
        };
        if (key === 'm') {
            return withoutSuffix ? 'ŃĐ˛Đ¸ĐťĐ¸Đ˝Đ°' : 'ŃĐ˛Đ¸ĐťĐ¸Đ˝Ń';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'ĐłĐžĐ´Đ¸Đ˝Đ°' : 'ĐłĐžĐ´Đ¸Đ˝Ń';
        }
        else {
            return number + ' ' + uk__plural(format[key], +number);
        }
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'Đ˝ĐľĐ´ŃĐťŃ_ĐżĐžĐ˝ĐľĐ´ŃĐťĐžĐş_Đ˛ŃĐ˛ŃĐžŃĐžĐş_ŃĐľŃĐľĐ´Đ°_ŃĐľŃĐ˛ĐľŃ_ĐżâŃŃĐ˝Đ¸ŃŃ_ŃŃĐąĐžŃĐ°'.split('_'),
            'accusative': 'Đ˝ĐľĐ´ŃĐťŃ_ĐżĐžĐ˝ĐľĐ´ŃĐťĐžĐş_Đ˛ŃĐ˛ŃĐžŃĐžĐş_ŃĐľŃĐľĐ´Ń_ŃĐľŃĐ˛ĐľŃ_ĐżâŃŃĐ˝Đ¸ŃŃ_ŃŃĐąĐžŃŃ'.split('_'),
            'genitive': 'Đ˝ĐľĐ´ŃĐťŃ_ĐżĐžĐ˝ĐľĐ´ŃĐťĐşĐ°_Đ˛ŃĐ˛ŃĐžŃĐşĐ°_ŃĐľŃĐľĐ´Đ¸_ŃĐľŃĐ˛ĐľŃĐłĐ°_ĐżâŃŃĐ˝Đ¸ŃŃ_ŃŃĐąĐžŃĐ¸'.split('_')
        },
        nounCase = (/(\[[ĐĐ˛ĐŁŃ]\]) ?dddd/).test(format) ?
            'accusative' :
            ((/\[?(?:ĐźĐ¸Đ˝ŃĐťĐžŃ|Đ˝Đ°ŃŃŃĐżĐ˝ĐžŃ)? ?\] ?dddd/).test(format) ?
                'genitive' :
                'nominative');
        return weekdays[nounCase][m.day()];
    }
    function processHoursFunction(str) {
        return function () {
            return str + 'Đž' + (this.hours() === 11 ? 'Đą' : '') + '] LT';
        };
    }

    var uk = moment__default.defineLocale('uk', {
        months : {
            'format': 'ŃŃŃĐ˝Ń_ĐťŃŃĐžĐłĐž_ĐąĐľŃĐľĐˇĐ˝Ń_ĐşĐ˛ŃŃĐ˝Ń_ŃŃĐ°Đ˛Đ˝Ń_ŃĐľŃĐ˛Đ˝Ń_ĐťĐ¸ĐżĐ˝Ń_ŃĐľŃĐżĐ˝Ń_Đ˛ĐľŃĐľŃĐ˝Ń_ĐśĐžĐ˛ŃĐ˝Ń_ĐťĐ¸ŃŃĐžĐżĐ°Đ´Đ°_ĐłŃŃĐ´Đ˝Ń'.split('_'),
            'standalone': 'ŃŃŃĐľĐ˝Ń_ĐťŃŃĐ¸Đš_ĐąĐľŃĐľĐˇĐľĐ˝Ń_ĐşĐ˛ŃŃĐľĐ˝Ń_ŃŃĐ°Đ˛ĐľĐ˝Ń_ŃĐľŃĐ˛ĐľĐ˝Ń_ĐťĐ¸ĐżĐľĐ˝Ń_ŃĐľŃĐżĐľĐ˝Ń_Đ˛ĐľŃĐľŃĐľĐ˝Ń_ĐśĐžĐ˛ŃĐľĐ˝Ń_ĐťĐ¸ŃŃĐžĐżĐ°Đ´_ĐłŃŃĐ´ĐľĐ˝Ń'.split('_')
        },
        monthsShort : 'ŃŃŃ_ĐťŃŃ_ĐąĐľŃ_ĐşĐ˛ŃŃ_ŃŃĐ°Đ˛_ŃĐľŃĐ˛_ĐťĐ¸Đż_ŃĐľŃĐż_Đ˛ĐľŃ_ĐśĐžĐ˛Ń_ĐťĐ¸ŃŃ_ĐłŃŃĐ´'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : 'Đ˝Đ´_ĐżĐ˝_Đ˛Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        weekdaysMin : 'Đ˝Đ´_ĐżĐ˝_Đ˛Ń_ŃŃ_ŃŃ_ĐżŃ_ŃĐą'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Ń.',
            LLL : 'D MMMM YYYY Ń., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Ń., HH:mm'
        },
        calendar : {
            sameDay: processHoursFunction('[ĐĄŃĐžĐłĐžĐ´Đ˝Ń '),
            nextDay: processHoursFunction('[ĐĐ°Đ˛ŃŃĐ° '),
            lastDay: processHoursFunction('[ĐŃĐžŃĐ° '),
            nextWeek: processHoursFunction('[ĐŁ] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[ĐĐ¸Đ˝ŃĐťĐžŃ] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[ĐĐ¸Đ˝ŃĐťĐžĐłĐž] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ĐˇĐ° %s',
            past : '%s ŃĐžĐźŃ',
            s : 'Đ´ĐľĐşŃĐťŃĐşĐ° ŃĐľĐşŃĐ˝Đ´',
            m : uk__relativeTimeWithPlural,
            mm : uk__relativeTimeWithPlural,
            h : 'ĐłĐžĐ´Đ¸Đ˝Ń',
            hh : uk__relativeTimeWithPlural,
            d : 'Đ´ĐľĐ˝Ń',
            dd : uk__relativeTimeWithPlural,
            M : 'ĐźŃŃŃŃŃ',
            MM : uk__relativeTimeWithPlural,
            y : 'ŃŃĐş',
            yy : uk__relativeTimeWithPlural
        },
        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason
        meridiemParse: /Đ˝ĐžŃŃ|ŃĐ°Đ˝ĐşŃ|Đ´Đ˝Ń|Đ˛ĐľŃĐžŃĐ°/,
        isPM: function (input) {
            return /^(Đ´Đ˝Ń|Đ˛ĐľŃĐžŃĐ°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Đ˝ĐžŃŃ';
            } else if (hour < 12) {
                return 'ŃĐ°Đ˝ĐşŃ';
            } else if (hour < 17) {
                return 'Đ´Đ˝Ń';
            } else {
                return 'Đ˛ĐľŃĐžŃĐ°';
            }
        },
        ordinalParse: /\d{1,2}-(Đš|ĐłĐž)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-Đš';
            case 'D':
                return number + '-ĐłĐž';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : uzbek (uz)
    //! author : Sardor Muminov : https://github.com/muminoff

    var uz = moment__default.defineLocale('uz', {
        months : 'ŃĐ˝Đ˛Đ°Ń_ŃĐľĐ˛ŃĐ°Đť_ĐźĐ°ŃŃ_Đ°ĐżŃĐľĐť_ĐźĐ°Đš_Đ¸ŃĐ˝_Đ¸ŃĐť_Đ°Đ˛ĐłŃŃŃ_ŃĐľĐ˝ŃŃĐąŃ_ĐžĐşŃŃĐąŃ_Đ˝ĐžŃĐąŃ_Đ´ĐľĐşĐ°ĐąŃ'.split('_'),
        monthsShort : 'ŃĐ˝Đ˛_ŃĐľĐ˛_ĐźĐ°Ń_Đ°ĐżŃ_ĐźĐ°Đš_Đ¸ŃĐ˝_Đ¸ŃĐť_Đ°Đ˛Đł_ŃĐľĐ˝_ĐžĐşŃ_Đ˝ĐžŃ_Đ´ĐľĐş'.split('_'),
        weekdays : 'ĐŻĐşŃĐ°Đ˝ĐąĐ°_ĐŃŃĐ°Đ˝ĐąĐ°_ĐĄĐľŃĐ°Đ˝ĐąĐ°_Đ§ĐžŃŃĐ°Đ˝ĐąĐ°_ĐĐ°ĐšŃĐ°Đ˝ĐąĐ°_ĐŃĐźĐ°_Đ¨Đ°Đ˝ĐąĐ°'.split('_'),
        weekdaysShort : 'ĐŻĐşŃ_ĐŃŃ_ĐĄĐľŃ_Đ§ĐžŃ_ĐĐ°Đš_ĐŃĐź_Đ¨Đ°Đ˝'.split('_'),
        weekdaysMin : 'ĐŻĐş_ĐŃ_ĐĄĐľ_Đ§Đž_ĐĐ°_ĐŃ_Đ¨Đ°'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'D MMMM YYYY, dddd HH:mm'
        },
        calendar : {
            sameDay : '[ĐŃĐłŃĐ˝ ŃĐžĐ°Ń] LT [Đ´Đ°]',
            nextDay : '[Đ­ŃŃĐ°ĐłĐ°] LT [Đ´Đ°]',
            nextWeek : 'dddd [ĐşŃĐ˝Đ¸ ŃĐžĐ°Ń] LT [Đ´Đ°]',
            lastDay : '[ĐĐľŃĐ° ŃĐžĐ°Ń] LT [Đ´Đ°]',
            lastWeek : '[ĐŁŃĐłĐ°Đ˝] dddd [ĐşŃĐ˝Đ¸ ŃĐžĐ°Ń] LT [Đ´Đ°]',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ĐŻĐşĐ¸Đ˝ %s Đ¸ŃĐ¸Đ´Đ°',
            past : 'ĐĐ¸Ń Đ˝ĐľŃĐ° %s ĐžĐťĐ´Đ¸Đ˝',
            s : 'ŃŃŃŃĐ°Ń',
            m : 'ĐąĐ¸Ń Đ´Đ°ĐşĐ¸ĐşĐ°',
            mm : '%d Đ´Đ°ĐşĐ¸ĐşĐ°',
            h : 'ĐąĐ¸Ń ŃĐžĐ°Ń',
            hh : '%d ŃĐžĐ°Ń',
            d : 'ĐąĐ¸Ń ĐşŃĐ˝',
            dd : '%d ĐşŃĐ˝',
            M : 'ĐąĐ¸Ń ĐžĐš',
            MM : '%d ĐžĐš',
            y : 'ĐąĐ¸Ń ĐšĐ¸Đť',
            yy : '%d ĐšĐ¸Đť'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : vietnamese (vi)
    //! author : Bang Nguyen : https://github.com/bangnk

    var vi = moment__default.defineLocale('vi', {
        months : 'thĂĄng 1_thĂĄng 2_thĂĄng 3_thĂĄng 4_thĂĄng 5_thĂĄng 6_thĂĄng 7_thĂĄng 8_thĂĄng 9_thĂĄng 10_thĂĄng 11_thĂĄng 12'.split('_'),
        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays : 'cháť§ nháş­t_tháťŠ hai_tháťŠ ba_tháťŠ tĆ°_tháťŠ nÄm_tháťŠ sĂĄu_tháťŠ báşŁy'.split('_'),
        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        meridiemParse: /sa|ch/i,
        isPM : function (input) {
            return /^ch$/i.test(input);
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower ? 'sa' : 'SA';
            } else {
                return isLower ? 'ch' : 'CH';
            }
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM [nÄm] YYYY',
            LLL : 'D MMMM [nÄm] YYYY HH:mm',
            LLLL : 'dddd, D MMMM [nÄm] YYYY HH:mm',
            l : 'DD/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY HH:mm',
            llll : 'ddd, D MMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[HĂ´m nay lĂşc] LT',
            nextDay: '[NgĂ y mai lĂşc] LT',
            nextWeek: 'dddd [tuáş§n táťi lĂşc] LT',
            lastDay: '[HĂ´m qua lĂşc] LT',
            lastWeek: 'dddd [tuáş§n ráťi lĂşc] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s táťi',
            past : '%s trĆ°áťc',
            s : 'vĂ i giĂ˘y',
            m : 'máťt phĂşt',
            mm : '%d phĂşt',
            h : 'máťt giáť',
            hh : '%d giáť',
            d : 'máťt ngĂ y',
            dd : '%d ngĂ y',
            M : 'máťt thĂĄng',
            MM : '%d thĂĄng',
            y : 'máťt nÄm',
            yy : '%d nÄm'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : chinese (zh-cn)
    //! author : suupic : https://github.com/suupic
    //! author : Zeno Zeng : https://github.com/zenozeng

    var zh_cn = moment__default.defineLocale('zh-cn', {
        months : 'ä¸ć_äşć_ä¸ć_ĺć_äşć_ĺ­ć_ä¸ć_ĺŤć_äšć_ĺć_ĺä¸ć_ĺäşć'.split('_'),
        monthsShort : '1ć_2ć_3ć_4ć_5ć_6ć_7ć_8ć_9ć_10ć_11ć_12ć'.split('_'),
        weekdays : 'ćććĽ_ććä¸_ććäş_ććä¸_ććĺ_ććäş_ććĺ­'.split('_'),
        weekdaysShort : 'ĺ¨ćĽ_ĺ¨ä¸_ĺ¨äş_ĺ¨ä¸_ĺ¨ĺ_ĺ¨äş_ĺ¨ĺ­'.split('_'),
        weekdaysMin : 'ćĽ_ä¸_äş_ä¸_ĺ_äş_ĺ­'.split('_'),
        longDateFormat : {
            LT : 'Ahçšmmĺ',
            LTS : 'Ahçšmĺsç§',
            L : 'YYYY-MM-DD',
            LL : 'YYYYĺš´MMMDćĽ',
            LLL : 'YYYYĺš´MMMDćĽAhçšmmĺ',
            LLLL : 'YYYYĺš´MMMDćĽddddAhçšmmĺ',
            l : 'YYYY-MM-DD',
            ll : 'YYYYĺš´MMMDćĽ',
            lll : 'YYYYĺš´MMMDćĽAhçšmmĺ',
            llll : 'YYYYĺš´MMMDćĽddddAhçšmmĺ'
        },
        meridiemParse: /ĺć¨|ćŠä¸|ä¸ĺ|ä¸­ĺ|ä¸ĺ|ćä¸/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ĺć¨' || meridiem === 'ćŠä¸' ||
                    meridiem === 'ä¸ĺ') {
                return hour;
            } else if (meridiem === 'ä¸ĺ' || meridiem === 'ćä¸') {
                return hour + 12;
            } else {
                // 'ä¸­ĺ'
                return hour >= 11 ? hour : hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return 'ĺć¨';
            } else if (hm < 900) {
                return 'ćŠä¸';
            } else if (hm < 1130) {
                return 'ä¸ĺ';
            } else if (hm < 1230) {
                return 'ä¸­ĺ';
            } else if (hm < 1800) {
                return 'ä¸ĺ';
            } else {
                return 'ćä¸';
            }
        },
        calendar : {
            sameDay : function () {
                return this.minutes() === 0 ? '[äťĺ¤Š]Ah[çšć´]' : '[äťĺ¤Š]LT';
            },
            nextDay : function () {
                return this.minutes() === 0 ? '[ćĺ¤Š]Ah[çšć´]' : '[ćĺ¤Š]LT';
            },
            lastDay : function () {
                return this.minutes() === 0 ? '[ć¨ĺ¤Š]Ah[çšć´]' : '[ć¨ĺ¤Š]LT';
            },
            nextWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment__default().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[ä¸]' : '[ćŹ]';
                return this.minutes() === 0 ? prefix + 'dddAhçšć´' : prefix + 'dddAhçšmm';
            },
            lastWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment__default().startOf('week');
                prefix = this.unix() < startOfWeek.unix()  ? '[ä¸]' : '[ćŹ]';
                return this.minutes() === 0 ? prefix + 'dddAhçšć´' : prefix + 'dddAhçšmm';
            },
            sameElse : 'LL'
        },
        ordinalParse: /\d{1,2}(ćĽ|ć|ĺ¨)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + 'ćĽ';
            case 'M':
                return number + 'ć';
            case 'w':
            case 'W':
                return number + 'ĺ¨';
            default:
                return number;
            }
        },
        relativeTime : {
            future : '%sĺ',
            past : '%sĺ',
            s : 'ĺ ç§',
            m : '1 ĺé',
            mm : '%d ĺé',
            h : '1 ĺ°ćś',
            hh : '%d ĺ°ćś',
            d : '1 ĺ¤Š',
            dd : '%d ĺ¤Š',
            M : '1 ä¸Şć',
            MM : '%d ä¸Şć',
            y : '1 ĺš´',
            yy : '%d ĺš´'
        },
        week : {
            // GB/T 7408-1994ăć°ćŽĺĺäş¤ć˘ć źĺźÂˇäżĄćŻäş¤ć˘ÂˇćĽćĺćśé´čĄ¨ç¤şćłăä¸ISO 8601:1988ç­ć
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : traditional chinese (zh-tw)
    //! author : Ben : https://github.com/ben-lin

    var zh_tw = moment__default.defineLocale('zh-tw', {
        months : 'ä¸ć_äşć_ä¸ć_ĺć_äşć_ĺ­ć_ä¸ć_ĺŤć_äšć_ĺć_ĺä¸ć_ĺäşć'.split('_'),
        monthsShort : '1ć_2ć_3ć_4ć_5ć_6ć_7ć_8ć_9ć_10ć_11ć_12ć'.split('_'),
        weekdays : 'ćććĽ_ććä¸_ććäş_ććä¸_ććĺ_ććäş_ććĺ­'.split('_'),
        weekdaysShort : 'éąćĽ_éąä¸_éąäş_éąä¸_éąĺ_éąäş_éąĺ­'.split('_'),
        weekdaysMin : 'ćĽ_ä¸_äş_ä¸_ĺ_äş_ĺ­'.split('_'),
        longDateFormat : {
            LT : 'Ahéťmmĺ',
            LTS : 'Ahéťmĺsç§',
            L : 'YYYYĺš´MMMDćĽ',
            LL : 'YYYYĺš´MMMDćĽ',
            LLL : 'YYYYĺš´MMMDćĽAhéťmmĺ',
            LLLL : 'YYYYĺš´MMMDćĽddddAhéťmmĺ',
            l : 'YYYYĺš´MMMDćĽ',
            ll : 'YYYYĺš´MMMDćĽ',
            lll : 'YYYYĺš´MMMDćĽAhéťmmĺ',
            llll : 'YYYYĺš´MMMDćĽddddAhéťmmĺ'
        },
        meridiemParse: /ćŠä¸|ä¸ĺ|ä¸­ĺ|ä¸ĺ|ćä¸/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'ćŠä¸' || meridiem === 'ä¸ĺ') {
                return hour;
            } else if (meridiem === 'ä¸­ĺ') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'ä¸ĺ' || meridiem === 'ćä¸') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return 'ćŠä¸';
            } else if (hm < 1130) {
                return 'ä¸ĺ';
            } else if (hm < 1230) {
                return 'ä¸­ĺ';
            } else if (hm < 1800) {
                return 'ä¸ĺ';
            } else {
                return 'ćä¸';
            }
        },
        calendar : {
            sameDay : '[äťĺ¤Š]LT',
            nextDay : '[ćĺ¤Š]LT',
            nextWeek : '[ä¸]ddddLT',
            lastDay : '[ć¨ĺ¤Š]LT',
            lastWeek : '[ä¸]ddddLT',
            sameElse : 'L'
        },
        ordinalParse: /\d{1,2}(ćĽ|ć|éą)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd' :
            case 'D' :
            case 'DDD' :
                return number + 'ćĽ';
            case 'M' :
                return number + 'ć';
            case 'w' :
            case 'W' :
                return number + 'éą';
            default :
                return number;
            }
        },
        relativeTime : {
            future : '%sĺ§',
            past : '%sĺ',
            s : 'ĺšžç§',
            m : 'ä¸ĺé',
            mm : '%dĺé',
            h : 'ä¸ĺ°ć',
            hh : '%dĺ°ć',
            d : 'ä¸ĺ¤Š',
            dd : '%dĺ¤Š',
            M : 'ä¸ĺć',
            MM : '%dĺć',
            y : 'ä¸ĺš´',
            yy : '%dĺš´'
        }
    });

    var moment_with_locales = moment__default;
    moment_with_locales.locale('en');

    return moment_with_locales;

}));