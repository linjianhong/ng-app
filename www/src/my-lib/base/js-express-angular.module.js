!(function (window, angular) {
  var REG = {
    "number": /^-?((\.\d+)|(\d+(\.\d+)?))(e\d+)?/i,
    "string": /^\'(([^\\\']|(\\.))*)\'/,
    "string2": /^\"(([^\\\"]|(\\.))*)\"/,
    "var": /^[a-zA-Z_\u4e00-\u9fa5\$][a-zA-Z_\u4e00-\u9fa50-9]*/,
  }

  /** 全局函数
   *
   * @define
   * ```js
   * $var:{
   *   add:{
   *     $arguments:['a', 'b'],
   *     $var:{
   *       c: 3,
   *     },
   *     $return: '=a+b+c',
   *     $return: '=arguments[0] + arguments[1] + c',
   *   }
   * }
   * ```
   *
   * @code
   * CParser::calcu("=add(1,2)",[])
   *
   * @return  6
   */
  var GLOBAL_CALL = "_GLOBAL_CALL_";


  angular.module("js-express", []).run(["$http", "$q", function ($http, $q) {

    var CParser = {

      parse: (express) => {
        if (!express) return new CExpress("string", "");
        try {
          if (angular.isArray(express)) {
            return new CExpress("array", express.map(item => CParser.parse(item)));
          }
          if (angular.isObject(express)) {
            return new CExpress("object", Object.keys(express).map(keynane => {
              var meta_k = CParser.parse(keynane);
              var meta_v = CParser.parse(express[keynane]);
              return [meta_k, meta_v];
            }));
          }
          if (angular.isNumber(express)) return new CExpress("number", express);;
          if (!angular.isString(express)) throw "不是字符串";
          var express = express.trim();
          if (!express) return new CExpress("string", '');
          if (express[0] != '=') return new CExpress("string", express);
          var result = CParser.parse_express(express.substr(1));
          if (result.more) throw "有多余的内容";
          return result.meta;
        } catch (e) {
          console.error("解析失败", e, express);
          return new CExpress("error", e);
        }
      },

      /**
       * 获取一个表达式，尽量长
       * @return object  编译结果
       * @return int length 使用的长度
       * @return CExpress meta 已编译的数据
       */
      parse_express: (express) => {
        express = express.trim();
        if (!express) throw ("缺少表达式");
        var result = CParser.parse_value(express);
        return CParser.parse_express_more(result.more, result.meta, []);
      },
      parse_express_more: (express, meta, moreExpress) => {
        var moreExpressLength, op, new_item, last_item, prev_item, result, result1, result2;
        express = express.trim();
        /** 三元操作, 如果有一元操作在前，让其先编译 */
        if (express[0] == '?') {
          meta = CParser.merge_express(meta, moreExpress);
          result1 = CParser.parse_express(express.substr(1));
          if (result1.more[0] != ':') throw ("缺少:");
          result2 = CParser.parse_express(result1.more.substr(1));
          meta = new CExpress("a_b_c", [meta, result1.meta, result2.meta]);
          // 三元操作, 不会有 进一步表达式 的情况
          return { "more": result2.more, "meta": meta };
        }

        moreExpressLength = moreExpress.length;
        op = CParser.findCalcuOperator(express);
        if (!op) {
          meta = CParser.merge_express(meta, moreExpress);
          return { "more": express, "meta": meta };
        }

        result = CParser.parse_value(express.substr(op["w"]));
        new_item = { "op": op, "meta": result.meta };

        if (!moreExpressLength) {
          return CParser.parse_express_more(result.more, meta, [new_item]);
        }

        /** 将优先级大于新操作的，都弹出来, 然后合并到前一个 */
        last_item = moreExpress[moreExpressLength - 1];
        for (i = moreExpressLength - 2; i >= 0; i--) {
          // 向前合并
          if (last_item.op.level > op.level) {
            prev_item = moreExpress[i];
            prev_item.meta = new CExpress(last_item.op["fn"], [prev_item.meta, last_item.meta]);
            last_item = prev_item;
            // 弹出最一个
            moreExpress.pop();
          } else {
            break;
          }
        }

        /** 如果合并后，只有一个了，且这个操作的优先级，仍然大于新操作 */
        moreExpressLength = moreExpress.length;
        if (moreExpressLength == 1 && last_item.op.level >= op.level) {
          // 先将这个操作计算
          meta = new CExpress(last_item.op["fn"], [meta, last_item.meta]);
          // 清空已有操作
          moreExpress = [];
        }

        /** 现在，如果还有操作，就是优先级较小的了 */
        moreExpress.push(new_item);
        return CParser.parse_express_more(result.more, meta, moreExpress);
      },
      /** 合并多次计算，参数不可为空 */
      merge_express: (meta, moreExpress) => {
        var moreExpressLength = moreExpress.length;
        if (!moreExpressLength) return meta;
        var last_item = moreExpress[moreExpressLength - 1];
        for (i = moreExpressLength - 2; i >= 0; i--) {
          var prev_item = moreExpress[i];
          last_item = {
            "op": prev_item.op,
            "meta": new CExpress(last_item.op["fn"], [prev_item.meta, last_item.meta])
          };
        }
        meta = new CExpress(last_item.op["fn"], [meta, last_item.meta]);
        return meta;
      },


      /**
       * 获取一个无操作符表达式
       * @return object  编译结果
       * @return int length 使用的长度
       * @return CExpress meta 已编译的数据
       */
      parse_value(express) {
        var meta, op_once, reg, match, result, result1, result2;
        express = express.trim();
        if (!express) {
          throw ("缺少表达式");
        }

        /** 一元操作符 */
        op_once = CParser.findOnceOperator(express);
        if (op_once) {
          result = CParser.parse_value(express.substr(op_once["w"]), true);
          meta = new CExpress(op_once["fn"], result.meta);
          // 一元操作, 进一步值 情况已处理, 不会再有了
          return { "more": result.more.trim(), "meta": meta };
        }

        if (express[0] == '(') {
          result = CParser.parse_express(express.substr(1));
          if (result.more[0] != ')') throw ("缺少)");
          express = result.more.substr(1);
          return CParser.parse_value_more(express, result.meta);
        }

        /** 数组 */
        if (express[0] == '[') {
          express = express.substr(1);
          for (var metas = []; ;) {
            if (express[0] == ']') {
              meta = new CExpress("array", metas);
              return CParser.parse_value_more(express.substr(1), meta);
            }
            if (metas.length) {
              if (express[0] != ',') {
                console.error("缺少,或]");
                throw ("缺少,或]");
              }
              express = express.substr(1);
            }

            result = CParser.parse_express(express);
            metas.push(result.meta);
            express = result.more;



            // result = CParser.parse_express(express);
            // metas.push(result.meta);
            // express = result.more.substr(1);
            // if (result.more[0] == ']') {
            //   meta = new CExpress("array", metas);
            //   return CParser.parse_value_more(express, meta);
            // }
            // if (result.more[0] != ',') throw ("缺少,或]");
          }
        }

        /** 对象 */
        if (express[0] == '{') {
          express = express.substr(1);
          for (var metas = []; ;) {
            if (express[0] == '}') {
              meta = new CExpress("object", metas);
              return CParser.parse_value_more(express.substr(1), meta);
            }
            if (metas.length) {
              if (express[0] != ',') {
                console.error("缺少,或}");
                throw ("缺少,或}");
              }
              express = express.substr(1);
            }

            result1 = CParser.parse_express(express);
            if (result1.more[0] != ':') throw ("缺少:");
            result2 = CParser.parse_express(result1.more.substr(1));
            if (result1.meta.type == "var") result1.meta.type = "string";
            metas.push([result1.meta, result2.meta]);
            express = result2.more;
          }
        }

        /** 数字, 直接返回 */
        if (match = express.match(REG.number)) {
          meta = new CExpress("number", +match[0]);
          return { "more": express.substr(match[0].length).trim(), "meta": meta };
        }

        /** 字符串, 可能有进一步的值 */
        if (match = express.match(REG.string)) {
          meta = new CExpress("string", match[1].replace(/\\'/g, "'"));
          express = express.substr(match[0].length);
          return CParser.parse_value_more(express, meta);
        }
        if (match = express.match(REG.string2)) {
          meta = new CExpress("string", match[1].replace(/\\"/g, "\""));
          express = express.substr(match[0].length);
          return CParser.parse_value_more(express, meta);
        }

        /** 变量 */
        if (match = express.match(REG.var)) {
          meta = new CExpress("var", match[0]);
          express = express.substr(match[0].length);
          return CParser.parse_value_more(express, meta);
        }

        /** 其它的, 返回错误 */
        throw ("不是表达式");
      },
      parse_value_more(express, meta) {
        express = express.trim();

        /** 成员操作, 直接 */
        if (express[0] == '.') {
          express = express.substr(1);
          /** 变量 */
          match = express.match(REG.var);
          if (!match) throw ("不是成员名");
          metaMenber = new CExpress("string", match[0]);
          meta = new CExpress("member", [meta, metaMenber]);
          express = express.substr(match[0].length);
          return CParser.parse_value_more(express, meta);
        }

        /** 成员操作, 方括号 */
        if (express[0] == '[') {
          result = CParser.parse_express(express.substr(1));
          if (result.more[0] != ']') throw ("缺少]");
          meta = new CExpress("member", [meta, result.meta]);
          express = result.more.substr(1);
          return CParser.parse_value_more(express, meta);
        }

        /** 函数操作 */
        if (express[0] == '(') {

          /** 全局函数 */
          if (meta.type != "member") {
            console.log("全局函数 - 定义");
            var GLOBAL_FN = new CExpress('string', GLOBAL_CALL);
            meta = new CExpress('member', [meta, GLOBAL_FN]);
          }

          if (meta.type != "member") throw ("函数，但缺少对象");
          meta.type = "method";
          var args = [];
          meta.args = new CExpress("array", args);
          for (var expressMore = express.substr(1); ;) {
            if (expressMore[0] == ")") {
              return CParser.parse_value_more(expressMore.substr(1), meta);
            }
            if (args.length > 0) {
              if (expressMore[0] != ",") throw ("函数参数格式错误");
              expressMore = expressMore.substr(1);
            }
            result = CParser.parse_express(expressMore);
            args.push(result.meta);
            expressMore = result.more
          }
        }

        return { "more": express, "meta": meta };
      },

      findCalcuOperator: (str) => {
        for (var item of CParser.operators) {
          if ("calcu" == item["type"] && item["value"] == str.substr(0, item["w"])) return item;
        }
        return false;
      },
      findOnceOperator: (str) => {
        for (var item of CParser.operators) {
          if ("once" == item["type"] && item["value"] == str.substr(0, item["w"])) return item;
        }
        return false;
      },

      operators: [
        { "value": "!", "w": 1, "type": "once", "fn": "not" },
        { "value": "-", "w": 1, "type": "once", "fn": "fu" },

        { "value": "*", "w": 1, "type": "calcu", "level": 90, "fn": "time" },
        { "value": "/", "w": 1, "type": "calcu", "level": 90, "fn": "div" },
        { "value": "%", "w": 1, "type": "calcu", "level": 90, "fn": "mod" },
        { "value": "+", "w": 1, "type": "calcu", "level": 80, "fn": "add" },
        { "value": "-", "w": 1, "type": "calcu", "level": 80, "fn": "dec" },

        { "value": ">=", "w": 2, "type": "calcu", "level": 50, "fn": "notlessthan" },
        { "value": "<=", "w": 2, "type": "calcu", "level": 50, "fn": "notbigthan" },
        { "value": "==", "w": 2, "type": "calcu", "level": 50, "fn": "equals" },
        { "value": "!=", "w": 2, "type": "calcu", "level": 50, "fn": "notequals" },
        { "value": ">", "w": 1, "type": "calcu", "level": 50, "fn": "bigthan" },
        { "value": "<", "w": 1, "type": "calcu", "level": 50, "fn": "lessthan" },

        { "value": "&&", "w": 2, "type": "calcu", "level": 29, "fn": "andand" },
        { "value": "||", "w": 2, "type": "calcu", "level": 28, "fn": "oror" },
        { "value": "^^", "w": 2, "type": "calcu", "level": 27, "fn": "xorxor" },

        { "value": ".", "w": 1, "type": "000", },
        { "value": "[", "w": 1, "type": "000", },
        { "value": "]", "w": 1, "type": "000", },
        { "value": "(", "w": 1, "type": "000", },
        { "value": ")", "w": 1, "type": "000", },
        { "value": ",", "w": 1, "type": "000", },
        { "value": ";", "w": 1, "type": "000", },
      ]
    }


    function $q1(a, callback) {
      if (a && a.then) {
        return $q.when(a).then(a => {
          return callback ? callback(a) : a;
        })
      } else {
        return callback ? callback(a) : a;
      }
    }
    function $q2(a, b, callback) {
      return $q1(a, a => {
        return $q1(b, b => {
          return callback(a, b);
        })
      });
    }
    function $q3(a, b, c, callback) {
      return $q2(a, b, (a, b) => {
        return $q1(c, c => {
          return callback(a, b, c);
        });
      });
    }
    function $q_array(arr, callback) {
      return $q1($q_array_value(arr), arr => callback ? callback(arr) : arr);
    }
    function $q_array_value(arr) {
      if (!arr.length) return [];
      var last = arr.pop();
      return $q2(last, $q_array_value(arr), (lastValue, arrValue) => {
        //console.log(last, arr, lastValue, arrValue)
        arrValue.push(lastValue);
        return arrValue;
      });
    }

    function find_var_object(name, params) {
      if (!angular.isObject(params)) return false;
      if (params.hasOwnProperty(name)) return params;
      if (params.$var && params.$var.hasOwnProperty(name)) {
        return params.value;
      }
      if (params.value && params.value.hasOwnProperty(name)) {
        return params.value;
      }
      if (angular.isArray(params)) {
        for (var i = 0, length = params.length; i < length; i++) {
          var r = find_var_object(name, params[i]);
          if (r) return r;
        }
      }
      return find_var_object(name, params.$$);
    }

    class CExpress {
      constructor(type, value) {
        this.type = type;
        this.value = value;
      }

      calcu(params) {
        try {
          return this[`parse_${this.type}`](params);
        } catch (e) {
          console.error(e, this);
          return "";
        }
      }
      /** 文本 */
      parse_string(params) { return this.value; }
      /** 数字 */
      parse_number(params) { return this.value; }
      /** 变量 */
      parse_var(params) {
        /** 全局函数 */
        var golbalCall = CGolbalCall.create(this.value, params);
        if (golbalCall) return golbalCall;


        if (this.value == "DJ") {
          return CDJ;
        }
        var ob = find_var_object(this.value, params);
        if (ob) return $q1(ob, ob => ob[this.value]);
        return "";
      }
      /** 成员 */
      parse_member(params) {
        var a = this.value[0].calcu(params);
        if (!a) return "";
        var b = this.value[1].calcu(params);
        return $q2(a, b, (a, b) => a && a.hasOwnProperty(b) ? a[b] : "");
        return a.hasOwnProperty(b) ? a[b] : "";
      }
      /** 函数 */
      parse_method(params) {
        var a = this.value[0].calcu(params);
        if (!a) return "";
        var b = this.value[1].calcu(params);
        var args = this.args && this.args.calcu(params);
        return $q3(a, b, args, (a, b, args) => {

          /** 全局函数 */
          if (a instanceof CGolbalCall) {
            // \DJApi\API::debug(["全局函数", 'args' => $args, 'this->args' => $this->args]);
            // return "";
            return a.run(args, this.args);
          }
          if (b == GLOBAL_CALL) {
            // $a 是函数体，不会被计算
            var scope_function = [{ 'arguments': args }, params];
            return Express.GLOBAL_CALL(a, scope_function);
          }


          if (angular.isArray(a)) {
            /** 数组, 默认支持： length, concat, indexOf */


            // 添加数组方法

            /** 求和 */
            if (b == "sum") return a.reduce((totle, item) => totle + (+item || 0), 0);
            /** 去重 */
            if (b == "unique") return a.filter((item, index, self) => self.indexOf(item) === index);
            /** 连接, 不去重 */
            // (b == "concat")return a.concat.apply(a, args);
            /** 合集, 并去重 */
            if (b == "union") {
              return a.concat.apply(a, args).filter((item, index, self) => self.indexOf(item) === index);
            }
            /** 差集 */
            if (b == "diff") return a.filter(item => (args[0] || []).indexOf(item) < 0);
            /** 合集(数组), 并去重 */
            if (b == "union_array") {
              if (angular.isArray(args[0])) {
                args[0].map(arg => a = a.concat.apply(a, arg || []));
              }
              else if (angular.isObject(args[0])) {
                Object.keys(args[0]).map(k => a = a.concat(args[0][k] || []));
              }
              return a.filter((item, index, self) => self.indexOf(item) === index);
            }
          }
          /**
           * 根据表达式，进行 map, find, filter操作
           * ="[{'a':{"b":1}},{'a':{"b":2}},{'a':{"b":3}}].map('item',item.a.b)"
           * // => [1,2,3]
           */
          if (["map", "find", "filter"].indexOf(b) >= 0) {
            var row_name = this.args.value[0].calcu(params);
            var row_params = {};
            return a[b](row => {
              row_params[row_name] = row;
              return this.args.value[1].calcu([row_params, params]);
            });
          }

          /**
           * 根据键名，进行map操作
           * JS有效，后台无。
           * ="[{'a':{"b":1}},{'a':{"b":2}},{'a':{"b":3}}].map_keys(['a', 'b'])"
           * // => [1,2,3]
           */
          if (b == "map_keys") {
            function subValue(item) {
              args[0].map(k => item = item && (item[k] || item[k] === 0) ? item[k] : "");
              return item;
            }
            if (angular.isObject(a)) {
              return Object.keys(a).map(k => a[k]).map(subValue);
            }
            else if (angular.isArray(args[0])) {
              return a.map(subValue);
            }
            return [];
          }
          if (angular.isFunction(a[b])) {
            return a[b].apply(a, args);
          }

          /**
           * 支持的字符串函数:
           * length, substr
           */

          /**
           * 支持的数组函数:
           * length, concat, indexOf
           */

          return "";
        });
      }
      /** 数组 */
      parse_array(params) { return $q_array(this.value.map(express => express.calcu(params))); }
      /** 对象 */
      parse_object(params) {
        var obj = {};
        var preCalc = this.value.map(express => $q2(express[0].calcu(params), express[1].calcu(params), (a, b) => ({ k: a, v: b })));
        return $q_array(preCalc, arr => {
          arr.map(item => obj[item.k] = item.v);
          return obj;
        });
        this.value.map(express => obj[express[0].calcu(params)] = express[1].calcu(params));
        return obj;
      }

      /** 非 */
      parse_not(params) { return $q1(this.value.calcu(params), a => !a); }
      /** 负 */
      parse_fu(params) { return $q1(this.value.calcu(params), a => -a); }


      /** 加 */
      parse_add(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a + b); }
      /** 减 */
      parse_dec(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a - b); }
      /** 乘 */
      parse_time(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a * b); }
      /** 除 */
      parse_div(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a / b); }
      /** 模 */
      parse_mod(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a % b); }

      /** 大于 */
      parse_bigthan(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a > b); }
      /** 小于 */
      parse_lessthan(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a < b); }
      /** 不小于 */
      parse_notlessthan(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a >= b); }
      /** 不大于 */
      parse_notbigthan(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a <= b); }
      /** 等等 */
      parse_equals(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a == b); }
      /** 不等 */
      parse_notequals(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a != b); }

      /** 与 */
      parse_andand(params) { return $q1(this.value[0].calcu(params), (a) => a && $q1(this.value[1].calcu(params))); }
      /** 或 */
      parse_oror(params) { return $q1(this.value[0].calcu(params), (a) => a || $q1(this.value[1].calcu(params))); }
      /** 异或 */
      parse_xorxor(params) { return $q2(this.value[0].calcu(params), this.value[1].calcu(params), (a, b) => a ? !b : !!b); }

      /** 三元运算 */
      parse_a_b_c(params) {
        return $q1(this.value[0].calcu(params), a => {
          if (a) return $q1(this.value[1].calcu(params));
          return $q1(this.value[2].calcu(params));
        })
        var a = this.value[0].calcu(params);
        if (a) return this.value[1].calcu(params);
        return this.value[2].calcu(params);
      }
    }


    /** 函数支持 */
    var CDJ = (function () {
      function baseMerge(a, b, more, deep) {
        if (!angular.isArray(more) || !more.length) {
          if (!angular.isObject(a)) return b;
          if (!angular.isObject(b)) return a;
          if (angular.isArray(a)) {
            if (!angular.isArray(b)) return a;
            return a.concat(b);
          }
          return deep ? angular.merge({}, a, b) : angular.extend({}, a, b);
        }
        a = baseMerge(a, b);
        b = more.shift();
        return baseMerge(a, b, more);
      }

      return {
        merge: (a, b) => {
          return baseMerge(a, b, [].slice.call(arguments, 2), true);
        },
        extend: (a, b) => {
          return baseMerge(a, b, [].slice.call(arguments, 2), false);
        },
        array_sum: (obj, keys) => {
          if (!angular.isArray(keys)) keys = keys && [keys] || [];
          R = 0;
          for (var i in obj) {
            var value = obj[i];
            keys.map(k => value = value && value[k] || 0)
            R += (+value || 0);
          }
          return R;
        },
        find: (obj, keys, valueFind) => {
          if (!angular.isArray(keys)) keys = [];
          R = 0;
          for (var i in obj) {
            var value = obj[i];
            keys.map(k => value = value && value[k])
            if (value == valueFind) return obj[i];
          }
          return false;
        },

        /**
         * DJ.产品清单()
         * {,"type":"产品""name":"缅花","v1":"999321","sl":"10"}
         */
        "产品清单": function () {
          //console.log("产品清单")
          return new CProductList();
        },

        /**
         * DJ.产品清单()
         * {,"type":"产品""name":"缅花","v1":"999321","sl":"10"}
         */
        "DATE": function (str) {
          return new CDATE(str);
        },

        dick: function (dickName, value, textField, valueField = "id") {
          if (!value && value !== 0) return "";
          return $http.post("字典", { name: dickName }).then(json => {
            //console("字典", json);
            return findIntoDick(json.datas.list);
          }).catch(e => {
            return $http.post(dickName).then(json => {
              //console.log("字典2", json);
              return findIntoDick(json.datas.list);
            }).catch(e => {
              console.error(`字典${dickName} 失败`, e)
            });
          });

          function findIntoDick(list) {
            var item = list.find(item => item[valueField] == value);
            //console.log("查字典",item,value, textField, valueField)
            return (item || {})[textField];
          }
        },
        stock_user(uid) {
          if (!uid) return $http.post("我的-基本信息").then(json => json.datas.stock_userinfo);
          return $http.post("user/stock_user", { uid });
        },
        /**
         * DJ.post()
         * 数据请求
         */
        post: function (api, data) {
          return $http.post(api, data);
        },
      }

    })();

    /**
     * 天数功能
     */
    const ONE_DAY = 3600 * 24 * 1000;

    function _days_of_(str) {
      var days = ~~(Date.parseDate(str) / ONE_DAY);
      if (days < 2) days = ~~(time() / ONE_DAY);
      return days;
    }
    class CDATE {
      constructor(str = '') {
        /** 从1970-01-01到现在的天数 */
        this.days = _days_of_(str);
      }

      parse(str = '') {
        this.days = _days_of_(str);
        return this;
      }

      offset(days) {
        this.days += ~~(days);
        return this;
      }

      /** 这个月的第一天 */
      firstDay() {
        return new CDATE(this.text().substr(0, 8) + "01");
      }
      /** 这个月的最后一天 */
      lastDay() {
        return this.nextFirstDay().offset(-1);
      }
      /** 上个月的第一天 */
      prevFirstDay() {
        return new this.firstDay().offset(-1).firstDay();
      }
      /** 下个月的第一天 */
      nextFirstDay() {
        return this.firstDay().offset(31).firstDay();
      }

      add(str) {
        this.days += _days_of_(str);
        return this;
      }

      dec(str) {
        this.days -= _days_of_(str);
        return this;
      }

      count() {
        return this.days;
      }

      text(format) {
        return new Date(this.days * ONE_DAY).format(format);
      }
    }

    /** 全局函数
     * 
     * @var String method 全局函数名
     */
    var CGolbalCall = (function () {
      /** 引用
       * @param CExpress $express 
       */
      function quote_parent(express, scope, local_scope) {
        if (express.type == 'member') {
          var parent = quote_parent(express.value[0], scope);
          if (!parent) return false;
          if (express.value[0].type == 'var') {
            var k = express.value[0].value;
            if (!angular.isObject(parent[k])) parent[k] = [];
            return parent[k];
          }
          if (express.value[0].type == 'member') {
            var k = express.value[0].value[1].calcu(scope);
            if (!angular.isObject(parent[k])) parent[k] = [];
            return parent[k];
          }
        }
        if (express.type == 'var') {
          var var_name = express.value;
          if (scope.hasOwnProperty(var_name)) {
            return scope;
          }
          if (scope.value && scope.value.hasOwnProperty(var_name)) {
            return scope.value;
          }
          if (scope.$var && scope.$var.hasOwnProperty(var_name)) {
            return scope.$var;
          }
          if (angular.isArray(scope)) {
            var length = scope.length;
            for (var i = 0; i < length; i++) {
              var parent = quote_parent(express, scope[i], false);
              if (parent) return parent;
            }
          }
          if (angular.isArray(scope.$$)) {
            var length = scope.$$.length;
            for (var i = 0; i < length; i++) {
              var parent = quote_parent(express, scope.$$[i], false);
              if (parent) return parent;
            }
          }
        }
        return local_scope;
      }


      var METHODS = {
        /** 赋值 */
        "set": function (args, express_args) {
          console.log('赋值, 无变量名。', args, express_args);
          //return "";
          var local_scope = [];
          if (args.length == 2) {
            var parent = quote_parent(express_args.value[0], this.scope, local_scope);
            if (!parent) {
              console.error('赋值, 无变量名。', this);
              return "";
            }
            var k = express_args.value[0].value[1].calcu(this.scope);
            console.log('要赋值', parent, args[1]);
            parent[k] = args[1];
            return args[1];
          }
          // \DJApi\API::debug(['ERROE' => '赋值, 参数不符。']);
          return "";
        },

      }

      class CGolbalCall {
        constructor(method, scope) {
          this.method = method;
          this.scope = scope;
        }

        /** 直接构造 */
        static create(method, scope) {
          if (!METHODS[method]) return false;
          return new CGolbalCall(method, scope);
        }

        run(args, express_args) {
          if (!METHODS[this.method]) {
            console.error('未找到内置全局函数 ', this);
            return "";
          }
          return METHODS[this.method].call(this, args, express_args);
        }

      }
      return CGolbalCall
    })();



    function sameType(a, b) {
      return a.type == b.type && a.name == b.name && a.v1 == b.v1;
    }
    function includeType(a, b) {
      /** 当作都是产品 */
      return a.name == b.name && angular.isArray(a.list) && a.list.find(dj => dj.v1 == b.v1);
    }
    function miniRow(cp_row) {
      var E = { type: cp_row.type || "产品", sl: +cp_row.sl || 0 };
      ["name", "v1", "cp_remark"].map(k => cp_row.hasOwnProperty(k) && (E[k] = cp_row[k]));
      return E;
    }

    class CProductList {
      constructor() {
        this.$id = CProductList.$$id = (+CProductList.$$id || 0) + 1;
        this.list = [];
        this.DD = [];
        this.log("constructor");
      }

      log(name, ...arg) {
        return;
        var n = this.list.reduce((totle, item) => totle + (+item['sl'] || 0), 0) || 0;
        console.log(`产品列表-[${this.$id}], (${n}) ${name}`, ...arg);
      }

      add_row(row, times = 1) {
        this.list.push(angular.extend({}, row, { sl: row.sl * times }));
        return this;
      }

      add(arr, times = 1) {
        if (!angular.isArray(arr)) return this;
        arr.map(row => this.add_row(row, times));
        this.log(`add(${times})`, arr, this.list);
        return this;
      }

      dec(arr) {
        return this.add(arr, -1);
      }

      addArray(arrs, times = 1) {
        this.log(`addArray 开始(${times})`, arrs, this.list);
        if (angular.isArray(arrs)) {
          arrs.map(arr => this.add(arr, times));
        }
        else if (angular.isObject(arrs)) {
          Object.keys(arrs).map(k => this.add(arrs[k], times));
        }
        this.log(`addArray(${times})`, arrs, this.list);
        return this;
      }

      addArray_codes(arrs, times = 1) {
        var codes = [];
        if (angular.isArray(arrs)) {
          arrs.map(arr => codes = codes.concat(arr));
        }
        else if (angular.isObject(arrs)) {
          Object.keys(arrs).map(k => arrs[k]).map(arr => codes = codes.concat(arr));
        }
        return this.add_codes(codes, times);
      }

      add_codes(codes, times = 1) {
        if (!angular.isArray(codes)) return this;
        return $http.post("缓存请求", { api: "qrcode/infos", data: { codes }, delay: 3e4 }).then(json => {
          var arr = (json.datas.list || []).map(item => ({
            type: item.type,
            v1: item.v1,
            name: item.name,
            sl: 1,
          }));
          this.log(`add_codes(${times})`, codes, this.list);
          return this.add(arr, times);
        });
      }

      dec_codes(codes) {
        return this.add_codes(codes, -1);
      }


      totle() {
        return this.list.map(item => {
          var sl = +item['sl'] || 0;
          if (!item.list || !sl) return sl;
          return item.list.reduce((totle, item) => totle + (+item['sl'] || 0), 0) * sl;
        }).reduce((totle, n) => totle + n, 0);
      }
      isEmpty() {
        return !this.value().find(item => +item['sl']);
      }
      hasError() {
        return !this.value().find(item => +item['sl'] < 0);
      }
      value_show(fields = false) {
        var R = [];
        console.log("value_show 开始", this.list);
        var dec2R = (row) => {
          if (!row.sl) return;
          var oldItem = R.find(a => sameType(a, row));
          if (oldItem) {
            var new_sl = oldItem.sl + row.sl;
            if (new_sl > 0 || oldItem.sl < 0) return oldItem.sl = new_sl;
            /** 这个正数不够用了，将永远被删除。如果还有组合支持，可能重生 */
            R = R.filter(a => a != oldItem);
            return dec2R(angular.extend({}, row, { sl: new_sl }));
          }
          /** 从分组中减 */
          var oldGroup = R.find(a => includeType(a, row));
          if (oldGroup) {
            /** 打开分组，每次打开数量1，以尽量保持组合 */
            oldGroup.sl--;
            oldGroup.list.map(dj => R.push({
              type: dj.type || "产品",
              name: dj.name || oldGroup.name,
              v1: dj.v1,
              sl: +dj.sl || 0,
            }));
            R = R.filter(a => a.sl);
            return dec2R(row);
          }
          /** 只好是负数了，而且不会再是正数了 */
          R.push(row);
        }
        /** 添加正数量的行 */
        this.list.map(tj_item => {
          if (tj_item.sl > 0) {
            R.push(tj_item);
          }
        });
        /** 累计负数的行 */
        var R_dec = [];
        this.list.map(tj_item => {
          if (tj_item.sl >= 0) return;
          if (angular.isArray(tj_item.list)) {
            tj_item.list.map(dj => R_dec.push({
              type: dj.type || "产品",
              name: dj.name || tj_item.name,
              v1: dj.v1,
              sl: dj.sl * tj_item.sl || 0,
            }));
          } else {
            R_dec.push(tj_item);
          }
        });
        console.log("value_show 正负行", angular.merge([], R), R_dec);
        /** 减去负数的行 */
        R_dec.map(tj_item => dec2R(tj_item));
        if (angular.isArray(fields)) {
          return R.map(tj_item => {
            var newItem = {};
            fields.map(k => newItem[k] = tj_item[k]);
            return newItem;
          })
        }
        console.log("value_show 完成", R);
        /** 有要求字段时 */
        if (angular.isArray(fields)) {
          return R.map(tj_item => {
            var newItem = {};
            fields.map(k => newItem[k] = tj_item[k]);
            return newItem;
          })
        }
        return R;
      }
      /**
       * 分解
       * 不再包含分组信息
       * 全部合并
       */
      value(fields = false) {
        var R = [];
        function add2R(cp_row) {
          var oldItem = R.find(a => sameType(a, cp_row));
          if (!oldItem) return R.push(miniRow(cp_row));
          oldItem.sl += cp_row.sl;
          R = R.filter(a => a.sl);
        }
        this.list.map(tj_item => {
          var tj_sl = +tj_item.sl || 0;
          if (!tj_sl) return;
          if (!tj_item.list) return add2R(tj_item);
          tj_item.list.map(dj => {
            var dj_sl = +dj.sl || 0;
            if (!dj_sl) return;
            add2R({
              type: dj.type || "产品",
              name: dj.name || tj_item.name,
              v1: dj.v1,
              sl: dj.sl * tj_sl,
            });
          });
        });
        if (angular.isArray(fields)) {
          return R.map(item => {
            var newItem = {};
            fields.map(k => newItem[k] = item[k]);
            return newItem;
          })
        }
        return R;
      }
      toText() {
        return $http.post("缓存请求", { api: "dick/cp", data: {}, delay: 1.2e6 }).then(json => {
          var dick = (json.datas.list || [])
          return this.list.filter(a => a.sl).map(row => {
            var cp = dick.find(cp => cp.id == row.v1) || {}
            return `${row.name}-${cp.name} × ${row.sl}`;
          });
        });
      }
    }

    var Express = angular.Express = (function () {

      class angular_Express {
        constructor(scope = {}) {
          this.scope = scope;
        }

        calcu(express) {
          if (angular.isObject(express) && express.hasOwnProperty("$var")) {
            var express_var = express["$var"];
            return $q1(this.pushScope(express_var), calcuer => calcuer.calcu(express["$return"]));
          }
          return CParser.parse(express && express["$return"] || express).calcu(this.scope);
        }

        pushScope(express_var) {
          if (angular.isObject(express_var)) {
            var $var = {};
            var newExpress = new angular_Express([$var, this.scope]);
            // 先定义的 var 在后定义时，可以使用
            Object.keys(express_var).map(k => {
              $var[k] = $q1(newExpress.calcu(express_var[k]), v => $var[k] = v);
            });
            return newExpress;
          }

          return new angular_Express([this.calcu(express_var), this.scope]);
        }
      }

      function calcu_var(vars, params) {
        if (!angular.isObject(vars)) return false;
        var R = [];
        var more_param = [R, params];
        Object.keys(vars).map(var_k => {
          var var_v = vars[var_k];
          var k_express = CParser.parse(var_k);
          var k = k_express.calcu(more_param);

          /** 全局函数 - 定义 */
          if (var_v['$arguments']) {
            R[k] = var_v;
            return;
          }

          var v_express = CParser.parse(var_v);
          var v = v_express.calcu(more_param);
          R[k] = v;
        });
        return R;
      }

      /** 全局函数 */
      function GLOBAL_CALL(fn, scope) {
        var express = fn;
        if (angular.isArray(fn['$arguments'])) {
          var scope_arguments = [];
          fn['$arguments'].map((k, n) => scope_arguments[k] = scope[0]['arguments'][n]);
          scope = [scope_arguments, scope];
          express = fn['$return'];
        }
        if (isset(fn['$var'])) {
          var scope_var = calcu_var(fn['$var'], scope);
          scope = [scope_var, scope];
          express = fn['$return'];
        }
        express = CParser.parse(express); // 这个可以提前编译，以提高效率
        return express.calcu(scope);
      }

      function calcu(express, scope) {
        if (!express) return express;
        var express_return = express;
        if (angular.isArray(express['$arguments'])) {
          console.log('是函数=', express);
          var scope_arguments = [];
          express['$arguments'].map((k, n) => scope_arguments[k] = scope[0]['arguments'][n]);
          scope = [scope_arguments, scope];
          express_return = express['$return'];
        }
        if (express.hasOwnProperty('$var')) {
          console.log('是 $var=', express, ',$var', express['$var']);
          scope_var = calcu_var(express['$var'], scope);
          if (scope_var) scope = [scope_var, scope];
          express_return = express['$return'];
        }
        express = CParser.parse(express_return);
        return express.calcu(scope);
      }

      function parse(express) {
        return CParser.parse(express);
      };

      function Express(scope) {
        return new angular_Express(scope);
      }

      angular.extend(Express, {
        parse,
        calcu,
        calcu_var,
        GLOBAL_CALL,
        CDATE: str => new CDATE(str),
      });

      return Express;
    })();


  }]);

})(window, angular);