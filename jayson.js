const fs = require('fs');

class JaysonInterpreter {
  constructor() {
    this.variables = {};
  }

  // Load and parse the JAYSON file
  load(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    this.program = JSON.parse(fileContent);
  }

  // Interpret the program (the list of statements)
  interpret() {
    if (!this.program || !Array.isArray(this.program)) {
      throw new Error('Invalid JAYSON file structure');
    }

    this.program.forEach(statement => {
      this.execute(statement);
    });
  }

  // Execute a single statement based on its key
  execute(statement) {
    for (const [key, value] of Object.entries(statement)) {
      switch (key) {
        case 'declare':
          this.declare(value);
          break;
        case 'assign':
          this.assign(value);
          break;
        case 'if':
          this.ifStatement(value);
          break;
        case 'loop':
          this.loopStatement(value);
          break;
        case 'print':
          this.print(value);
          break;
        case 'add':
          this.add(value);
          break;
        case 'subtract':
          this.subtract(value);
          break;
        case 'greaterThan':
          this.greaterThan(value);
          break;
        case 'lessThan':
          this.lessThan(value);
          break;
        default:
          console.log(`Unknown statement: ${key}`);
          console.loo("please add the statement yourself, i am NOT adding it myself");
      }
    }
  }

  // Declare a variable
  declare(declaration) {
    const { var: variableName, value } = declaration;
    this.variables[variableName] = value;
  }

  // Assign a new value to an existing variable
  assign(assignment) {
    const { var: variableName, value } = assignment;
    if (this.variables.hasOwnProperty(variableName)) {
      this.variables[variableName] = value;
    } else {
      console.log(`ERR: Variable ${variableName} not declared`);
    }
  }

  // Handle 'if' statements
  ifStatement({ condition, then }) {
    if (this.evaluateCondition(condition)) {
      then.forEach(statement => {
        this.execute(statement);
      });
    }
  }

  // Handle conditions (like equality)
  evaluateCondition(condition) {
    if (condition.eq) {
      const [varName, value] = condition.eq;
      return this.variables[varName] === value;
    }
    if (condition.greaterThan) {
      const [varName, value] = condition.greaterThan;
      return this.variables[varName] > value;
    }
    if (condition.lessThan) {
      const [varName, value] = condition.lessThan;
      return this.variables[varName] < value;
    }
    return false;
  }

  // Handle addition
  add({ var: variableName, value }) {
    if (this.variables.hasOwnProperty(variableName)) {
      this.variables[variableName] += value;
    } else {
      console.log(`ERR: Variable ${variableName} not declared`);
    }
  }

  // Handle subtraction
  subtract({ var: variableName, value }) {
    if (this.variables.hasOwnProperty(variableName)) {
      this.variables[variableName] -= value;
    } else {
      console.log(`ERR: Variable ${variableName} not declared`);
    }
  }

  // Handle loops
  loopStatement({ times, body }) {
    for (let i = 0; i < times; i++) {
      body.forEach(statement => {
        this.execute(statement);
      });
    }
  }

  // Handle print statements
  print(message) {
    if (Array.isArray(message)) {
      console.log(...message);
    } else {
      console.log(message);
    }
  }

  // Handle greaterThan condition
  greaterThan(value) {
    const [varName, checkValue] = value;
    return this.variables[varName] > checkValue;
  }

  // Handle lessThan condition
  lessThan(value) {
    const [varName, checkValue] = value;
    return this.variables[varName] < checkValue;
  }
}

// Main function to run the interpreter
function runJaysonProgram(filePath) {
  const interpreter = new JaysonInterpreter();
  interpreter.load(filePath);
  interpreter.interpret();
}

// Check if a file path is provided in the arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("provide a .jayson file. or it aint gonna work");
  process.exit(1);
}

const filePath = args[0];
if (!filePath.endsWith('.jayson')) {
  console.log("The provided file must have a .jayson extension. please don't tell me yor dumb ahh was tryna run a .json file...");
  process.exit(1);
}

// Run the program
runJaysonProgram(filePath);
