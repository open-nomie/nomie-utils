var time = {
    padTime: function (t) {
        return (t + '').length === 1 ? (t + '').padStart(2, '0') : t;
    },
    // Seconds to Time Chunk "03:30:30"
    secondsToTime: function (secondsStr) {
        var _seconds = typeof secondsStr === 'string' ? parseInt(secondsStr) : secondsStr;
        var seconds = '';
        var minutes = Math.floor(_seconds / 60).toString();
        var hours = '';
        if (parseInt(minutes) > 59) {
            hours = this.padTime(Math.floor(parseInt(minutes) / 60).toString());
            minutes = this.padTime((parseInt(minutes) - parseInt(hours) * 60).toString());
        }
        seconds = this.padTime(Math.floor(_seconds % 60).toString());
        minutes = this.padTime(minutes);
        if (hours !== '') {
            return this.padTime(hours) + ":" + minutes + ":" + seconds;
        }
        else {
            return "00:" + minutes + ":" + seconds;
        }
    },
    msToSecond: function (ms) {
        return ms / 1000;
    },
    timestringToSeconds: function (timestring) {
        var tsa = timestring.split(':');
        return this.unitsToSeconds(tsa[0], tsa[1], tsa[2]);
    },
    unitsToSeconds: function (hour, minutes, seconds) {
        var s = 0;
        s = (parseInt(hour) || 0) * 60 * 60;
        s = s + (parseInt(minutes) || 0) * 60;
        s = s + (parseInt(seconds) || 0);
        return s;
    }
};

var Mexp = function (parsed) {
  this.value = parsed;
};

Mexp.math = {
  isDegree: true, // mode of calculator
  acos: function (x) {
    return (Mexp.math.isDegree ? 180 / Math.PI * Math.acos(x) : Math.acos(x))
  },
  add: function (a, b) {
    return a + b
  },
  asin: function (x) {
    return (Mexp.math.isDegree ? 180 / Math.PI * Math.asin(x) : Math.asin(x))
  },
  atan: function (x) {
    return (Mexp.math.isDegree ? 180 / Math.PI * Math.atan(x) : Math.atan(x))
  },
  acosh: function (x) {
    return Math.log(x + Math.sqrt(x * x - 1))
  },
  asinh: function (x) {
    return Math.log(x + Math.sqrt(x * x + 1))
  },
  atanh: function (x) {
    return Math.log((1 + x) / (1 - x))
  },
  C: function (n, r) {
    var pro = 1;
    var other = n - r;
    var choice = r;
    if (choice < other) {
      choice = other;
      other = r;
    }
    for (var i = choice + 1; i <= n; i++) {
      pro *= i;
    }
    return pro / Mexp.math.fact(other)
  },
  changeSign: function (x) {
    return -x
  },
  cos: function (x) {
    if (Mexp.math.isDegree) x = Mexp.math.toRadian(x);
    return Math.cos(x)
  },
  cosh: function (x) {
    return (Math.pow(Math.E, x) + Math.pow(Math.E, -1 * x)) / 2
  },
  div: function (a, b) {
    return a / b
  },
  fact: function (n) {
    if (n % 1 !== 0) return 'NaN'
    var pro = 1;
    for (var i = 2; i <= n; i++) {
      pro *= i;
    }
    return pro
  },
  inverse: function (x) {
    return 1 / x
  },
  log: function (i) {
    return Math.log(i) / Math.log(10)
  },
  mod: function (a, b) {
    return a % b
  },
  mul: function (a, b) {
    return a * b
  },
  P: function (n, r) {
    var pro = 1;
    for (var i = Math.floor(n) - Math.floor(r) + 1; i <= Math.floor(n); i++) {
      pro *= i;
    }
    return pro
  },
  Pi: function (low, high, ex) {
    var pro = 1;
    for (var i = low; i <= high; i++) {
      pro *= Number(ex.postfixEval({
        n: i
      }));
    }
    return pro
  },
  pow10x: function (e) {
    var x = 1;
    while (e--) {
      x *= 10;
    }
    return x
  },
  sigma: function (low, high, ex) {
    var sum = 0;
    for (var i = low; i <= high; i++) {
      sum += Number(ex.postfixEval({
        n: i
      }));
    }
    return sum
  },
  sin: function (x) {
    if (Mexp.math.isDegree) x = Mexp.math.toRadian(x);
    return Math.sin(x)
  },
  sinh: function (x) {
    return (Math.pow(Math.E, x) - Math.pow(Math.E, -1 * x)) / 2
  },
  sub: function (a, b) {
    return a - b
  },
  tan: function (x) {
    if (Mexp.math.isDegree) x = Mexp.math.toRadian(x);
    return Math.tan(x)
  },
  tanh: function (x) {
    return Mexp.sinha(x) / Mexp.cosha(x)
  },
  toRadian: function (x) {
    return x * Math.PI / 180
  }
};
Mexp.Exception = function (message) {
  this.message = message;
};
var math_function = Mexp;

function inc (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] += val;
  }
  return arr
}
var token = ['sin', 'cos', 'tan', 'pi', '(', ')', 'P', 'C',
  'asin', 'acos', 'atan', '7', '8', '9', 'int',
  'cosh', 'acosh', 'ln', '^', 'root', '4', '5', '6', '/', '!',
  'tanh', 'atanh', 'Mod', '1', '2', '3', '*',
  'sinh', 'asinh', 'e', 'log', '0', '.', '+', '-', ',', 'Sigma', 'n', 'Pi', 'pow'];
var show = ['sin', 'cos', 'tan', '&pi;', '(', ')', 'P', 'C',
  'asin', 'acos', 'atan', '7', '8', '9', 'Int',
  'cosh', 'acosh', ' ln', '^', 'root', '4', '5', '6', '&divide;', '!',
  'tanh', 'atanh', ' Mod ', '1', '2', '3', '&times;',
  'sinh', 'asinh', 'e', ' log', '0', '.', '+', '-', ',', '&Sigma;', 'n', '&Pi;', 'pow'];
var eva = [math_function.math.sin, math_function.math.cos, math_function.math.tan, 'PI', '(', ')', math_function.math.P, math_function.math.C,
  math_function.math.asin, math_function.math.acos, math_function.math.atan, '7', '8', '9', Math.floor,
  math_function.math.cosh, math_function.math.acosh, Math.log, Math.pow, Math.sqrt, '4', '5', '6', math_function.math.div, math_function.math.fact,
  math_function.math.tanh, math_function.math.atanh, math_function.math.mod, '1', '2', '3', math_function.math.mul,
  math_function.math.sinh, math_function.math.asinh, 'E', math_function.math.log, '0', '.', math_function.math.add, math_function.math.sub, ',', math_function.math.sigma, 'n', math_function.math.Pi, Math.pow];
var preced = {
  0: 11,
  1: 0,
  2: 3,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 11,
  8: 11,
  9: 1,
  10: 10,
  11: 0,
  12: 11,
  13: 0
}; // stores precedence by types
var type = [0, 0, 0, 3, 4, 5, 10, 10,
  0, 0, 0, 1, 1, 1, 0,
  0, 0, 0, 10, 0, 1, 1, 1, 2, 7,
  0, 0, 2, 1, 1, 1, 2,
  0, 0, 3, 0, 1, 6, 9, 9, 11, 12, 13, 12, 8];
/*
0 : function with syntax function_name(Maths_exp)
1 : numbers
2 : binary operators like * / Mod left associate and same precedence
3 : Math constant values like e,pi,Cruncher ans
4 : opening bracket
5 : closing bracket
6 : decimal
7 : function with syntax (Math_exp)function_name
8: function with syntax function_name(Math_exp1,Math_exp2)
9 : binary operator like +,-
10: binary operator like P C or ^
11: ,
12: function with , seperated three parameters
13: variable of Sigma function
*/
var type0 = {
  0: true,
  1: true,
  3: true,
  4: true,
  6: true,
  8: true,
  9: true,
  12: true,
  13: true
}; // type2:true,type4:true,type9:true,type11:true,type21:true,type22
var type1 = {
  0: true,
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
  10: true,
  11: true,
  12: true,
  13: true
}; // type3:true,type5:true,type7:true,type23
var type1Asterick = {
  0: true,
  3: true,
  4: true,
  8: true,
  12: true,
  13: true
};
var empty = {};
var type3Asterick = {
  0: true,
  1: true,
  3: true,
  4: true,
  6: true,
  8: true,
  12: true,
  13: true
}; // type_5:true,type_7:true,type_23
var type6 = {
  1: true
};
var newAr = [
  [],
  ['1', '2', '3', '7', '8', '9', '4', '5', '6', '+', '-', '*', '/', '(', ')', '^', '!', 'P', 'C', 'e', '0', '.', ',', 'n'],
  ['pi', 'ln', 'Pi'],
  ['sin', 'cos', 'tan', 'Del', 'int', 'Mod', 'log', 'pow'],
  ['asin', 'acos', 'atan', 'cosh', 'root', 'tanh', 'sinh'],
  ['acosh', 'atanh', 'asinh', 'Sigma']
];

function match (str1, str2, i, x) {
  for (var f = 0; f < x; f++) {
    if (str1[i + f] !== str2[f]) {
      return false
    }
  }
  return true
}
math_function.addToken = function (tokens) {
  for (var i = 0; i < tokens.length; i++) {
    var x = tokens[i].token.length;
    var temp = -1;

    // newAr is a specially designed data structure index of 1d array = length of tokens

    if (x < newAr.length) { // match to check if token is really huge and not existing
    // if not checked it will break in next line as undefined index
      for (var y = 0; y < newAr[x].length; y++) {
        if (tokens[i].token === newAr[x][y]) {
          temp = token.indexOf(newAr[x][y]);
          break
        }
      }
    }
    if (temp === -1) {
      token.push(tokens[i].token);
      type.push(tokens[i].type);
      if (newAr.length <= tokens[i].token.length) {
        newAr[tokens[i].token.length] = [];
      }
      newAr[tokens[i].token.length].push(tokens[i].token);
      eva.push(tokens[i].value);
      show.push(tokens[i].show);
    } else {
      token[temp] = tokens[i].token;
      type[temp] = tokens[i].type;
      eva[temp] = tokens[i].value;
      show[temp] = tokens[i].show;
    }
  }
};
math_function.lex = function (inp, tokens) {
  var changeSignObj = {
    value: math_function.math.changeSign,
    type: 0,
    pre: 21,
    show: '-'
  };
  var closingParObj = {
    value: ')',
    show: ')',
    type: 5,
    pre: 0
  };
  var openingParObj = {
    value: '(',
    type: 4,
    pre: 0,
    show: '('
  };
  var str = [openingParObj];
  var ptc = []; // Parenthesis to close at the beginning is after one token
  var inpStr = inp;
  var key;
  var allowed = type0;
  var bracToClose = 0;
  var asterick = empty;
  var prevKey = '';
  var i, x, y;
  if (typeof tokens !== 'undefined') {
    math_function.addToken(tokens);
  }
  var obj = {};
  for (i = 0; i < inpStr.length; i++) {
    if (inpStr[i] === ' ') {
      continue
    }
    key = '';
    for (x = (inpStr.length - i > (newAr.length - 2) ? newAr.length - 1 : inpStr.length - i); x > 0; x--) {
      if (newAr[x] === undefined) continue;
      for (y = 0; y < newAr[x].length; y++) {
        if (match(inpStr, newAr[x][y], i, x)) {
          key = newAr[x][y];
          y = newAr[x].length;
          x = 0;
        }
      }
    }
    i += key.length - 1;
    if (key === '') {
      throw (new math_function.Exception('Can\'t understand after ' + inpStr.slice(i)))
    }
    var index = token.indexOf(key);
    var cToken = key;
    var cType = type[index];
    var cEv = eva[index];
    var cPre = preced[cType];
    var cShow = show[index];
    var pre = str[str.length - 1];
    var j;
    for (j = ptc.length; j--;) { // loop over ptc
      if (ptc[j] === 0) {
        if ([0, 2, 3, 4, 5, 9, 11, 12, 13].indexOf(cType) !== -1) {
          if (allowed[cType] !== true) {
            throw (new math_function.Exception(key + ' is not allowed after ' + prevKey))
          }
          str.push(closingParObj);
          allowed = type1;
          asterick = type3Asterick;
          inc(ptc, -1).pop();
        }
      } else break
    }
    if (allowed[cType] !== true) {
      throw (new math_function.Exception(key + ' is not allowed after ' + prevKey))
    }
    if (asterick[cType] === true) {
      cType = 2;
      cEv = math_function.math.mul;
      cShow = '&times;';
      cPre = 3;
      i = i - key.length;
    }
    obj = {
      value: cEv,
      type: cType,
      pre: cPre,
      show: cShow
    };
    if (cType === 0) {
      allowed = type0;
      asterick = empty;
      inc(ptc, 2).push(2);
      str.push(obj);
      str.push(openingParObj);
    } else if (cType === 1) {
      if (pre.type === 1) {
        pre.value += cEv;
        inc(ptc, 1);
      } else {
        str.push(obj);
      }
      allowed = type1;
      asterick = type1Asterick;
    } else if (cType === 2) {
      allowed = type0;
      asterick = empty;
      inc(ptc, 2);
      str.push(obj);
    } else if (cType === 3) { // constant
      str.push(obj);
      allowed = type1;
      asterick = type3Asterick;
    } else if (cType === 4) {
      inc(ptc, 1);
      bracToClose++;
      allowed = type0;
      asterick = empty;
      str.push(obj);
    } else if (cType === 5) {
      if (!bracToClose) {
        throw (new math_function.Exception('Closing parenthesis are more than opening one, wait What!!!'))
      }
      bracToClose--;
      allowed = type1;
      asterick = type3Asterick;
      str.push(obj);
    } else if (cType === 6) {
      if (pre.hasDec) {
        throw (new math_function.Exception('Two decimals are not allowed in one number'))
      }
      if (pre.type !== 1) {
        pre = {
          value: 0,
          type: 1,
          pre: 0
        }; // pre needs to be changed as it will the last value now to be safe in later code
        str.push(pre);
        inc(ptc, -1);
      }
      allowed = type6;
      inc(ptc, 1);
      asterick = empty;
      pre.value += cEv;
      pre.hasDec = true;
    } else if (cType === 7) {
      allowed = type1;
      asterick = type3Asterick;
      inc(ptc, 1);
      str.push(obj);
    }
    if (cType === 8) {
      allowed = type0;
      asterick = empty;
      inc(ptc, 4).push(4);
      str.push(obj);
      str.push(openingParObj);
    } else if (cType === 9) {
      if (pre.type === 9) {
        if (pre.value === math_function.math.add) {
          pre.value = cEv;
          pre.show = cShow;
          inc(ptc, 1);
        } else if (pre.value === math_function.math.sub && cShow === '-') {
          pre.value = math_function.math.add;
          pre.show = '+';
          inc(ptc, 1);
        }
      } else if (pre.type !== 5 && pre.type !== 7 && pre.type !== 1 && pre.type !== 3 && pre.type !== 13) { // changesign only when negative is found
        if (cToken === '-') { // do nothing for + token
          // don't add with the above if statement as that will run the else statement of parent if on Ctoken +
          allowed = type0;
          asterick = empty;
          inc(ptc, 2).push(2);
          str.push(changeSignObj);
          str.push(openingParObj);
        }
      } else {
        str.push(obj);
        inc(ptc, 2);
      }
      allowed = type0;
      asterick = empty;
    } else if (cType === 10) {
      allowed = type0;
      asterick = empty;
      inc(ptc, 2);
      str.push(obj);
    } else if (cType === 11) {
      allowed = type0;
      asterick = empty;
      str.push(obj);
    } else if (cType === 12) {
      allowed = type0;
      asterick = empty;
      inc(ptc, 6).push(6);
      str.push(obj);
      str.push(openingParObj);
    } else if (cType === 13) {
      allowed = type1;
      asterick = type3Asterick;
      str.push(obj);
    }
    inc(ptc, -1);
    prevKey = key;
  }
  for (j = ptc.length; j--;) { // loop over ptc
    if (ptc[j] === 0) {
      str.push(closingParObj);
      inc(ptc, -1).pop();
    } else break  // if it is not zero so before ptc also cant be zero
  }
  if (allowed[5] !== true) {
    throw (new math_function.Exception('complete the expression'))
  }
  while (bracToClose--) {
    str.push(closingParObj);
  }

  str.push(closingParObj);
  //        console.log(str);
  return new math_function(str)
};
var lexer = math_function;

lexer.prototype.toPostfix = function () {
		var post=[],elem,popped,prep,pre,ele;
    	var stack=[{value:"(",type:4,pre:0}];
		var arr=this.value;
		for (var i=1; i < arr.length; i++) {
			if(arr[i].type===1||arr[i].type===3||arr[i].type===13){	//if token is number,constant,or n(which is also a special constant in our case)
				if(arr[i].type===1)
					arr[i].value=Number(arr[i].value);
				post.push(arr[i]);
			}
			else if(arr[i].type===4){
				stack.push(arr[i]);
			}
			else if(arr[i].type===5){
				while((popped=stack.pop()).type!==4){
					post.push(popped);
				}
			}
			else if(arr[i].type===11){
				while((popped=stack.pop()).type!==4){
					post.push(popped);
				}
				stack.push(popped);
			}
			else {
				elem=arr[i];
				pre=elem.pre;
				ele=stack[stack.length-1];
				prep=ele.pre;
				var flag=ele.value=='Math.pow'&&elem.value=='Math.pow';
				if(pre>prep)stack.push(elem);
				else {
					while(prep>=pre&&!flag||flag&&pre<prep){
						popped=stack.pop();
						ele=stack[stack.length-1];
						post.push(popped);
						prep=ele.pre;
						flag=elem.value=='Math.pow'&&ele.value=='Math.pow';
					}
					stack.push(elem);
				}
			}
		}
		return new lexer(post);
	};
    var postfix=lexer;

postfix.prototype.postfixEval = function (UserDefined) {
	UserDefined=UserDefined||{};
	UserDefined.PI=Math.PI;
	UserDefined.E=Math.E;
	var stack=[],pop1,pop2,pop3;
	var arr=this.value;
	var bool=(typeof UserDefined.n!=="undefined");
	for(var i=0;i<arr.length;i++){
		if(arr[i].type===1){
			stack.push({value:arr[i].value,type:1});
		}
		else if(arr[i].type===3){
			stack.push({value:UserDefined[arr[i].value],type:1});
		}
		else if(arr[i].type===0){
			if(typeof stack[stack.length-1].type==="undefined"){
				stack[stack.length-1].value.push(arr[i]);
			}
			else stack[stack.length-1].value=arr[i].value(stack[stack.length-1].value);
		}
		else if(arr[i].type===7){
			if(typeof stack[stack.length-1].type==="undefined"){
				stack[stack.length-1].value.push(arr[i]);
			}
			else stack[stack.length-1].value=arr[i].value(stack[stack.length-1].value);
		}
		else if(arr[i].type===8){
			pop1=stack.pop();
			pop2=stack.pop();
			stack.push({type:1,value:arr[i].value(pop2.value,pop1.value)});
		}
		else if(arr[i].type===10){
			pop1=stack.pop();
			pop2=stack.pop();
			if(typeof pop2.type==="undefined"){
				pop2.value=pop2.concat(pop1);
				pop2.value.push(arr[i]);
				stack.push(pop2);
			}
			else if (typeof pop1.type==="undefined") {
				pop1.unshift(pop2);
				pop1.push(arr[i]);
				stack.push(pop1);
			}
			else {
				stack.push({type:1,value:arr[i].value(pop2.value,pop1.value)});
            }
		}
		else if(arr[i].type===2||arr[i].type===9){
			pop1=stack.pop();
			pop2=stack.pop();
			if(typeof pop2.type==="undefined"){
                console.log(pop2);
				pop2=pop2.concat(pop1);
				pop2.push(arr[i]);
				stack.push(pop2);
			}
			else if (typeof pop1.type==="undefined") {
				pop1.unshift(pop2);
				pop1.push(arr[i]);
				stack.push(pop1);
			}
			else {
				stack.push({type:1,value:arr[i].value(pop2.value,pop1.value)});
			}
		}
		else if(arr[i].type===12){
			pop1=stack.pop();
			if (typeof pop1.type!=="undefined") {
				pop1=[pop1];
			}
			pop2=stack.pop();
			pop3=stack.pop();
			stack.push({type:1,value:arr[i].value(pop3.value,pop2.value,new postfix(pop1))});
		}
		else if(arr[i].type===13){
			if(bool){
				stack.push({value:UserDefined[arr[i].value],type:3});
			}
			else stack.push([arr[i]]);
		}
	}
	if (stack.length>1) {
		throw(new postfix.exception("Uncaught Syntax error"));
	}
	return stack[0].value>1000000000000000?"Infinity":parseFloat(stack[0].value.toFixed(15));
};
postfix.eval=function(str,tokens,obj){
	if (typeof tokens==="undefined") {
		return this.lex(str).toPostfix().postfixEval();
	}
	else if (typeof obj==="undefined") {
		if (typeof tokens.length!=="undefined") 
			return this.lex(str,tokens).toPostfix().postfixEval();
		else
			return this.lex(str).toPostfix().postfixEval(tokens);
	}
	else
		return this.lex(str,tokens).toPostfix().postfixEval(obj);
};
var postfix_evaluator=postfix;

postfix_evaluator.prototype.formulaEval = function () {
	var pop1,pop2,pop3;
	var disp=[];
	var arr=this.value;
	for(var i=0;i<arr.length;i++){
		if(arr[i].type===1||arr[i].type===3){
			disp.push({value:arr[i].type===3?arr[i].show:arr[i].value,type:1});
		}
		else if(arr[i].type===13){
			disp.push({value:arr[i].show,type:1});
		}
		else if(arr[i].type===0){
			disp[disp.length-1]={value:arr[i].show+(arr[i].show!="-"?"(":"")+disp[disp.length-1].value+(arr[i].show!="-"?")":""),type:0};
		}
		else if(arr[i].type===7){
			disp[disp.length-1]={value:(disp[disp.length-1].type!=1?"(":"")+disp[disp.length-1].value+(disp[disp.length-1].type!=1?")":"")+arr[i].show,type:7};
		}
		else if(arr[i].type===10){
			pop1=disp.pop();
			pop2=disp.pop();
			if(arr[i].show==='P'||arr[i].show==='C')disp.push({value:"<sup>"+pop2.value+"</sup>"+arr[i].show+"<sub>"+pop1.value+"</sub>",type:10});
			else disp.push({value:(pop2.type!=1?"(":"")+pop2.value+(pop2.type!=1?")":"")+"<sup>"+pop1.value+"</sup>",type:1});
		}
		else if(arr[i].type===2||arr[i].type===9){
			pop1=disp.pop();
			pop2=disp.pop();
			disp.push({value:(pop2.type!=1?"(":"")+pop2.value+(pop2.type!=1?")":"")+arr[i].show+(pop1.type!=1?"(":"")+pop1.value+(pop1.type!=1?")":""),type:arr[i].type});
		}
		else if(arr[i].type===12){
			pop1=disp.pop();
			pop2=disp.pop();
			pop3=disp.pop();
			disp.push({value:arr[i].show+"("+pop3.value+","+pop2.value+","+pop1.value+")",type:12});
		}
	}
	return disp[0].value;
};
var formula_evaluator=postfix_evaluator;

var prefixes = { context: '+', person: '@', tracker: '#' };
/**
 *
 * Get Parsed Value from word
 * Returns a value string from #tracker(value)
 *
 * @param {String} word
 */
function getParsedValue(word) {
    var wordSplit = word.split('(');
    var value = wordSplit.length === 2 ? wordSplit[1].replace(')', '') : '1';
    value = value.length ? value : '1';
    return parseStringValue(value);
}
/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr) {
    var uomMatch = valueStr.match(/[a-z/%$]+/gi);
    var uom = uomMatch ? uomMatch[0] : undefined;
    if (valueStr.match(/\+|-|\/|\*|Mod|\(|\)/)) {
        valueStr = valueStr.replace(/[a-z]+/gi, '');
        try {
            return {
                value: parseFloat(formula_evaluator.eval(valueStr)),
                uom: uom
            };
        }
        catch (e) {
            return {
                value: 0,
                uom: uom
            };
        }
    }
    else if (valueStr.split('.').length === 2) {
        return {
            value: parseFloat(valueStr),
            uom: uom
        };
    }
    else if (valueStr.search(':') > -1) {
        return {
            value: time.timestringToSeconds(valueStr),
            uom: 'timer'
        };
    }
    else {
        return {
            value: parseInt(valueStr),
            uom: uom
        };
    }
}
/**
 *
 * Scrub
 * Removes common word ending characters
 *
 * @param {String} word
 */
function scrub(word) {
    // let uom:string;
    var cleanedWord = word.replace(/(’s|'s|'|,|\.|!|’|\?|:)/gi, '');
    return {
        word: cleanedWord,
        remainder: word.replace(cleanedWord, '')
    };
}
/**
 *
 * toToken
 * Creates a payload that can be turned into a
 *
 * @param {String} type tracker,context,person,generic
 * @param {String} word
 * @param {String} value
 * @param {String} remainder
 */
function toToken(type, word, value, remainder, raw, uom) {
    if (value === void 0) { value = ''; }
    if (remainder === void 0) { remainder = ''; }
    var prefix = prefixes[type] || '';
    var id = (word.search(/\(/) > -1
        ? word.replace(prefix, '').split('(')[0]
        : word.replace(prefix, '')).toLowerCase();
    raw = raw || word || '';
    return {
        id: id,
        raw: raw,
        prefix: prefix,
        type: type,
        value: value,
        remainder: remainder,
        uom: uom
    };
}
/**
 *
 * Parse
 * parses a string and returns an array of
 * elements
 *
 * @param {String} str
 */
function parse(str) {
    if (str === void 0) { str = ''; }
    // Split it into an array of lines
    var lines = str.split(/\r?\n/);
    var final = [];
    // Loop over each line
    lines.forEach(function (line) {
        // Extract
        var tokens = parseStr(line);
        tokens.forEach(function (token) {
            final.push(token);
        });
        // Add the line Break
        if (lines.length > 1) {
            final.push(toToken('line-break', ''));
        }
    });
    // Return parsed note
    return final;
}
/**
 *
 * Parse a Line to an array.
 * @param {String} str
 *
 */
function parseStr(str) {
    var wordArray = str.trim().split(' ');
    return (
    // Split on the space
    wordArray
        .map(function (word) {
        // Loop over each word
        var scrubbed = scrub(word); // Scrub it clean
        var parsedValueString = getParsedValue(word);
        var firstChar = word.trim().substr(0, 1);
        // switch on first character
        if (firstChar === '#' && word.length > 1) {
            if (word.match(/\d\d:\d\d/)) {
                // if it's a timer
                return toToken('tracker', word, parsedValueString.value, scrubbed.remainder.replace(word, ''), null, parsedValueString.uom);
            }
            else {
                return toToken('tracker', scrubbed.word, parsedValueString.value, scrubbed.remainder.replace(word, ''), null, parsedValueString.uom);
            }
        }
        else if (firstChar === '@' && word.length > 1) {
            return toToken('person', scrubbed.word.toLowerCase(), parsedValueString.value, scrubbed.remainder, null, parsedValueString.uom);
        }
        else if (firstChar === '+' && word.length > 1) {
            return toToken('context', scrubbed.word, parsedValueString.value, scrubbed.remainder, null, parsedValueString.uom);
        }
        else if (firstChar === '/' && word.length > 1) {
            return toToken('place', scrubbed.word, parsedValueString.value, scrubbed.remainder, null, parsedValueString.uom);
        }
        else if (word.search(/(\w){3}:\/\/(\w)/) > -1) {
            return toToken('link', word.trim().replace(/(https|http):\/\//gi, ''), null, null, word.trim());
        }
        else if (word) {
            return {
                id: "" + word,
                type: 'generic',
                raw: "" + word,
                prefix: null,
                remainder: null
            };
        }
        return null;
    })
        .filter(function (word) { return word; }));
} // end parse string

var remap = {
    tracker: 'trackers',
    person: 'people',
    link: 'links'
};
/**
 * Stats
 * Generate stats for a set of tokens
 * @param tokens Array
 */
function stats(tokens) {
    var map = {
        trackers: {},
        people: {},
        context: {},
        links: {}
    };
    // Loop over tokens
    tokens.forEach(function (token) {
        var type = Object.prototype.hasOwnProperty.call(remap, token.type)
            ? remap[token.type]
            : token.type;
        // set type if doesnt exist
        map[type] = map[type] || {};
        // Setup id in type, if not exist step to first token
        map[type][token.id] = map[type][token.id] || Object.assign(token, {});
        // Setup a holder vor the values
        map[type][token.id].values = map[type][token.id].values || [];
        // Push the value, or default to 1
        map[type][token.id].values.push(token.value || 1);
    });
    // Create a Map for Results
    var results = {
        trackers: [],
        context: [],
        people: [],
        links: []
    };
    // Loop over the map to do final filtering
    Object.keys(map).forEach(function (type) {
        var items = map[type];
        // Loop over items for this type
        results[type] = Object.keys(items).map(function (id) {
            var token = items[id];
            token.sum = sum(token.values);
            token.avg = average(token.values);
            return token;
        });
    });
    var response = results;
    response.words = tokens.length;
    return response;
}
/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
function deep(str) {
    var tokens = parse(str);
    var response = stats(tokens);
    response.tokens = tokens;
    // Return selectors
    response.get = function (type, id) {
        type = Object.prototype.hasOwnProperty.call(remap, type)
            ? remap[type]
            : type;
        return Object.prototype.hasOwnProperty.call(response, type)
            ? response[type].find(function (t) { return t.id === id; })
            : null;
    };
    return response;
}
/**
 * Sum all numbers in an array
 * @param nums Array
 */
function sum(nums) {
    return nums.reduce(function (a, b) {
        return a + b;
    }, 0);
}
/**
 * Average all numbers in an array
 * @param nums Array
 */
function average(nums) {
    var total = nums.reduce(function (acc, c) { return acc + c; }, 0);
    return total / nums.length;
}

var UOMS = {
    num: {
        singular: 'Count',
        plural: 'Count',
        symbol: 'count',
        type: 'general'
    },
    reps: {
        singular: 'Rep',
        plural: 'Reps',
        symbol: 'reps',
        type: 'general'
    },
    percent: {
        singular: 'Percent',
        plural: 'Percent',
        symbol: '%',
        type: 'general',
        symbolAffix: 'post'
    },
    dollars: {
        singular: 'Dollar',
        plural: 'Dollars',
        symbol: '$',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '$' + v.toFixed(2);
        }
    },
    peso: {
        singular: 'Peso',
        plural: 'Peso',
        symbol: '$',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '$' + v.toFixed(2);
        }
    },
    franc: {
        singular: 'Franc',
        plural: 'Francs',
        symbol: 'Fr.',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return 'Fr. ' + v.toFixed(2);
        }
    },
    cpound: {
        singular: 'Pound',
        plural: 'Pounds',
        symbol: '£',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '£' + v.toFixed(2);
        }
    },
    rupee: {
        singular: 'Rupee',
        plural: 'Rupees',
        symbol: 'Rs.',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return 'Rs. ' + v.toFixed(2);
        }
    },
    yen: {
        singular: 'Yen',
        plural: 'Yen',
        symbol: '¥',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '¥' + v.toFixed(2);
        }
    },
    yuan: {
        singular: 'Yuan',
        plural: 'Yuan',
        symbol: '¥',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '¥' + v.toFixed(2);
        }
    },
    bitcoin: {
        singular: 'Bitcoin',
        plural: 'Bitcoins',
        type: 'currency',
        symbolAffix: 'pre',
        symbol: 'B'
    },
    euro: {
        singular: 'Euro',
        plural: 'Euros',
        symbol: '€',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '€' + v.toFixed(2);
        }
    },
    timer: {
        singular: 'Time',
        plural: 'Time',
        symbol: 'time',
        type: 'Timer',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            var secNum = parseInt(v, 10); // don't forget the second param
            var hours = Math.floor(secNum / 3600);
            var minutes = Math.floor((secNum - hours * 3600) / 60);
            var seconds = secNum - hours * 3600 - minutes * 60;
            return !hours
                ? minutes + 'm ' + seconds + 's'
                : hours + 'h ' + minutes + 'm';
        }
    },
    sec: {
        singular: 'Second',
        plural: 'Seconds',
        symbol: 'secs',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: true,
        display: function (v) {
            if (v < 3600) {
                return v + 's';
            }
            else {
                return Math.round((v / 60) * 100) / 100 + 'm';
            }
        }
    },
    min: {
        singular: 'Minute',
        plural: 'Minutes',
        symbol: 'm',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            if (v < 60) {
                return v + 'm';
            }
            else if (v > 60 && v < 1441) {
                return Math.round((v / 60) * 100) / 100 + 'h';
            }
            else if (v > 1440 && v < 10000) {
                return (v / 1440).toFixed(0) + 'd';
            }
            else {
                return (v / 1440).toFixed(0) + 'd';
            }
        }
    },
    hour: {
        singular: 'Hour',
        plural: 'Hours',
        symbol: 'hrs',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            if (v < 168) {
                return Math.round(v * 100) / 100 + 'h';
            }
            else {
                return (v / 24).toFixed(0) + 'd';
            }
        }
    },
    day: {
        singular: 'Day',
        plural: 'Days',
        symbol: 'days',
        type: 'time'
    },
    mm: {
        singular: 'Millimeter',
        plural: 'Millimeters',
        symbol: 'mm',
        type: 'distance'
    },
    cm: {
        singular: 'Centimeter',
        plural: 'Centimeters',
        symbol: 'cm',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    meter: {
        singular: 'Meter',
        plural: 'Meter',
        symbol: 'm',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    km: {
        singular: 'Kilometer',
        plural: 'Kilometers',
        symbol: 'km',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    inch: {
        singular: 'Inch',
        plural: 'Inches',
        symbol: 'in',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    degrees: {
        singular: 'Degree',
        plural: 'Degrees',
        symbol: '°',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    celsius: {
        singular: 'Celsius',
        plural: 'Celsius',
        symbol: '°C',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    fahrenheit: {
        singular: 'Fahrenheit',
        plural: 'Fahrenheit',
        symbol: '°F',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    foot: {
        singular: 'Foot',
        plural: 'Feet',
        symbol: 'ft',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    yard: {
        singular: 'Yard',
        plural: 'Yards',
        symbol: 'yrds',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    mile: {
        singular: 'Mile',
        plural: 'Miles',
        symbol: 'mi',
        type: 'distance',
        symbolAffix: 'post'
    },
    mg: {
        singular: 'Milligram',
        plural: 'Milligrams',
        symbol: 'mg',
        type: 'weight',
        symbolAffix: 'post'
    },
    gram: {
        singular: 'Gram',
        plural: 'Grams',
        symbol: 'g',
        type: 'weight',
        symbolAffix: 'post'
    },
    kg: {
        singular: 'Kilogram',
        plural: 'Kilograms',
        symbol: 'kg',
        type: 'weight',
        symbolAffix: 'post'
    },
    stone: {
        singular: 'Stone',
        plural: 'Stones',
        symbol: 'st',
        type: 'weight'
    },
    oz: {
        singular: 'Ounce',
        plural: 'Ounces',
        symbol: 'oz',
        type: 'weight',
        symbolAffix: 'post',
        symbolSpace: true
    },
    pound: {
        singular: 'Pound',
        plural: 'Pounds',
        symbol: 'lbs',
        type: 'weight',
        symbolAffix: 'post',
        symbolSpace: true
    },
    cup: {
        singular: 'Cup',
        plural: 'Cups',
        symbol: 'cups',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    fluidounce: {
        singular: 'Fluid Ounce',
        plural: 'Fluid Ounces',
        symbol: 'oz',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    pint: {
        singular: 'Pint',
        plural: 'Pints',
        symbol: 'pint',
        type: 'volume'
    },
    quart: {
        singular: 'Quart',
        plural: 'Quarts',
        symbol: 'qt',
        type: 'volume',
        symbolAffix: 'post'
    },
    gallon: {
        singular: 'Gallon',
        plural: 'Gallons',
        symbol: 'gal',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    liter: {
        singular: 'Liter',
        plural: 'Liters',
        symbol: 'L',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: false
    },
    milliliter: {
        singular: 'Milliliter',
        plural: 'Milliliters',
        symbol: 'ml',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: false
    }
};

function main() {
    /**
     * Array of UOMS
     */
    function toArray() {
        return Object.keys(UOMS).map(function (key) {
            var obj = UOMS[key];
            obj.key = key;
            return obj;
        });
    }
    /**
     * Map of UOMS grouped by type
     * { general: [], volume: []...}
     */
    function toGroupedArray() {
        var items = {};
        Object.keys(UOMS).forEach(function (key) {
            var obj = UOMS[key];
            obj.key = key;
            items[obj.type] = items[obj.type] || [];
            items[obj.type].push(obj);
        });
        return items;
    }
    /**
     * Format a value to a UOM's display
     * @param value Number
     * @param key String
     * @param includeUnit boolean
     */
    function format(value, key, includeUnit) {
        if (includeUnit === void 0) { includeUnit = true; }
        if (Object.prototype.hasOwnProperty.call(UOMS, key) && !isNaN(value)) {
            var symbol = UOMS[key].symbol;
            var affix = UOMS[key].symbolAffix;
            var space = UOMS[key].symbolSpace || false ? ' ' : '';
            // Get display formatter for key if one exists.
            var displayFormatter = UOMS[key].display || null;
            // Does the UOM have it's own display formatter?
            if (displayFormatter) {
                return displayFormatter(value); // displayFormatter(v);
            }
            else {
                if (!isNaN(parseFloat(value)) && isFinite(value) && value !== 0) {
                    value = addCommas(value);
                }
                if (affix && symbol && includeUnit) {
                    if (affix === 'pre') {
                        return symbol + space + value;
                    }
                    else {
                        return value + space + symbol;
                    }
                }
                else {
                    return value;
                }
            } // end if the uom has it's own display
        }
        else {
            return value;
        }
    }
    /**
     * Plural
     * @param key string
     */
    function plural(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].plural
            : key;
    }
    /**
     * Singular
     * @param key string
     */
    function singular(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].singular
            : key;
    }
    /**
     * Abreviation
     * @param key string
     */
    function abv(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].symbol
            : null;
    }
    /**
     * Add Comma to a number
     * @param base number
     */
    function addCommas(base) {
        if (base === void 0) { base = 0; }
        var num = "" + base;
        var x = num.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    return {
        toArray: toArray,
        toGroupedArray: toGroupedArray,
        plural: plural,
        singular: singular,
        abv: abv,
        format: format,
        addCommas: addCommas
    };
}
var uom = main();

export { parse as tokenize, deep as tokenizeDeep, uom };
//# sourceMappingURL=index.es.js.map
