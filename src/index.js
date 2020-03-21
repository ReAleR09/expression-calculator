function eval() {
    // Do not use eval!!!
    return;
}

const STATE_INTEGER = 'int';
const STATE_NEUTRAL = null;

const ORD_DIV = 47;
const ORD_MULT = 42;
const ORD_PLUS = 43;
const ORD_MINUS = 45;
const ORD_DIGIT_START = 48;
const ORD_DIGIT_END = 57;
const ORD_LEFT_BRACKET = 40;
const ORD_RIGHT_BRACKET = 41;
const ORD_SIMPLE_TOKENS = [
    ORD_DIV, ORD_MULT, ORD_PLUS, ORD_MINUS, 
    ORD_LEFT_BRACKET, ORD_RIGHT_BRACKET
]



function parseTokens(expr) {
    const input = expr.split(''); // split string into chars
    const stack = [];
    let buf = '';
    let _state = STATE_NEUTRAL;
    for(let i = 0; i < input.length; i++) {
        const char = input[i];
        if(char === ' ') continue; // skip space chars, don't need 'em

        const ord = char.charCodeAt(0);
        
        switch(_state) {
            case STATE_NEUTRAL: 
                    switch(true) {
                        case (ORD_SIMPLE_TOKENS.includes(ord)):
                            stack.push(char); // simply add one-character token to stack
                            break;
                        case (ord >= ORD_DIGIT_START && ord <= ORD_DIGIT_END):
                            _state = STATE_INTEGER; // digit starts, changing state...
                            i--; // and revisiting current char at next iteration
                            break;
                        default:
                            throw Error('Character is not supported: ' + char);

                    }
                break; 
            case STATE_INTEGER:
                    switch(true) {
                        case (ord >= ORD_DIGIT_START && ord <= ORD_DIGIT_END):
                            buf += char; // adding another digit to buffer
                            break;
                        default:
                            stack.push(Number.parseInt(buf)); // integer ended, adding to stack
                            buf = '';   // clearing buffer
                            _state = STATE_NEUTRAL; //changing state
                            i--; // revisiting current non-digit char at next iteration
                            break;

                    }
                break;
        }
    }

    // if buffer is not empty after parsing the whole string, adding it to the stack
    if(buf.length > 0) {
        if(STATE_INTEGER) {
            buf = Number.parseInt(buf);
        }
        stack.push(buf);
        buf = null;
    }
    return stack;
}

function generatePolishNotationQueue(tokens) {
    let outputQueue = [];
    let stack = [];

    for(let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if(typeof token === 'number') {
            outputQueue.push(token);
            continue;
        }
        if(['+', '-', '*', '/'].includes(token)) {
            const op1order = ['+', '-'].includes(token) ? 1 : 2;
            while(stack.length > 0) {
                const topOfStack = stack[stack.length - 1];
                if(['+', '-', '*', '/'].includes(topOfStack)) {
                    const op2order = ['+', '-'].includes(topOfStack) ? 1 : 2;
                    if(op2order >= op1order) {
                        outputQueue.push(stack.pop());
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            stack.push(token);
            continue;
        }
        if(token === '(') {
            stack.push(token);
            continue;
        }
        if(token === ')') {
            let isClosed = false;
            while(stack.length > 0) {
                const topOfStack = stack[stack.length - 1];
                if(topOfStack !== '(') {
                    outputQueue.push(stack.pop());
                    continue;
                } else {
                    stack.pop();
                    isClosed = true;
                    break;
                }
            }
            if(!isClosed) {
                throw Error("ExpressionError: Brackets must be paired");
            }
            continue;
            
        }
        throw Error('Unrecognized token: ' + token);
    }
    while(stack.length > 0) {
        const topOfStack = stack[stack.length - 1];
        if(topOfStack === '(' || topOfStack === ')') {
            throw Error("ExpressionError: Brackets must be paired");
        }
        outputQueue.push(stack.pop());
    }

    return outputQueue;
}

function evaluateBinaryOperation(arg1, arg2, operator) {
    switch(operator) {
        case '+':
            return (arg1 + arg2);
        case '-':
            return (arg1 - arg2);
        case '*':
            return (arg1 * arg2);
        case '/':
            {
                if(arg2 === 0) {
                    throw Error('TypeError: Division by zero.')
                }
                return (arg1 / arg2);
            }
        default:
            throw Error('Unrecognized operator: ' + operator);
    }
}

function evaluatePolishNotationQueue(queue) {
    let stack = [];
    for(const i in queue) {
        const token = queue[i];
        if(typeof token === 'number') {
            stack.push(token);
        } else if(['+', '-', '*', '/'].includes(token)){
            if(stack.length < 2) {
                throw Error('Not enough params for binary operator');
            }
            const op2 = stack.pop();
            const op1 = stack.pop();
            stack.push(evaluateBinaryOperation(op1, op2, token));
        } else {
            throw Error('Ealuation stage: unrecognized token: ' + token);
        }
    }

    if(stack.length > 1) {
        throw Error('Invalid input.');
    }

    return stack.pop();
}

function expressionCalculator(expr) {
    const tokensArr = parseTokens(expr);
    const queue = generatePolishNotationQueue(tokensArr);
    return evaluatePolishNotationQueue(queue);
}

module.exports = {
    expressionCalculator
}