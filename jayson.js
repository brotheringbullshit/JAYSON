const fs = require('fs');

class JaysonInterpreter {
  constructor(file) {
    this.file = file;
    this.variables = {};
    this.functions = {};
  }

  loadFile() {
    try {
      const data = fs.readFileSync(this.file, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading the .jayson file:", error);
      return null;
    }
  }

  evaluateOperation(operation) {
    switch (operation.operation) {
      case 'add':
        return this.getValue(operation.left) + this.getValue(operation.right);
      case 'subtract':
        return this.getValue(operation.left) - this.getValue(operation.right);
      case 'multiply':
        return this.getValue(operation.left) * this.getValue(operation.right);
      case 'divide':
        return this.getValue(operation.left) / this.getValue(operation.right);
      case 'equals':
        return this.getValue(operation.left) === this.getValue(operation.right);
      case 'greater_than':
        return this.getValue(operation.left) > this.getValue(operation.right);
      case 'less_than':
        return this.getValue(operation.left) < this.getValue(operation.right);
      case 'and':
        return this.getValue(operation.left) && this.getValue(operation.right);
      case 'or':
        return this.getValue(operation.left) || this.getValue(operation.right);
      case 'not':
        return !this.getValue(operation.value);
      case 'print':
        console.log(this.getValue(operation.value));
        break;
      case 'if':
        if (this.getValue(operation.condition)) {
          operation.then.forEach((op) => this.evaluateOperation(op));
        }
        break;
      case 'while':
        while (this.getValue(operation.condition)) {
          operation.body.forEach((op) => this.evaluateOperation(op));
        }
        break;
      case 'call':
        this.executeFunction(operation.function, operation.arguments);
        break;
      default:
        throw new Error(`Unknown operation: ${operation.operation}`);
    }
  }

  getValue(reference) {
    return typeof reference === 'string' ? this.variables[reference] : reference;
  }

  defineVariables(vars) {
    this.variables = { ...this.variables, ...vars };
  }

  defineFunctions(funcs) {
    this.functions = funcs;
  }

  executeFunction(funcName, args) {
    const func = this.functions[funcName];
    if (!func) throw new Error(`Undefined function: ${funcName}`);
    
    const localVars = func.parameters.reduce((acc, param, index) => {
      acc[param] = this.getValue(args[index]);
      return acc;
    }, {});

    const originalVariables = { ...this.variables };
    this.variables = { ...this.variables, ...localVars };

    func.body.forEach((operation) => this.evaluateOperation(operation));

    this.variables = originalVariables;
  }

  run() {
    const data = this.loadFile();
    if (!data || !data.program) return;

    this.defineVariables(data.program.variables || {});
    this.defineFunctions(data.program.functions || {});

    (data.program.main || []).forEach((operation) => this.evaluateOperation(operation));
  }
}

const fileName = process.argv[2];
if (!fileName.endsWith('.jayson')) {
  console.error("Please provide a .jayson file to execute.");
  process.exit(1);
}

const interpreter = new JaysonInterpreter(fileName);
interpreter.run();
