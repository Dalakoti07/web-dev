class Character {
    constructor(name, health, strength) {
      this.name = name;
      this.health = health;
      this.strength = strength;
      this.xp = 0; // XP is always zero for new characters
    }
    // Return the character description
    describe() {
      return `${this.name} has ${this.health} health points, ${this
        .strength} as strength and ${this.xp} XP points`;
    }
  }

  const aurora = new Character("Aurora", 150, 25);
  const glacius = new Character("Glacius", 130, 30);
  
  // Aurora is harmed by an arrow
  aurora.health -= 20;
  
  // Aurora gains a strength necklace
  aurora.strength += 10;
  
  // Aurora learns a new skill
  aurora.xp += 15;
  
  console.log(aurora.describe());
  console.log(glacius.describe());

//   If you come from another programming background, chances are you already encountered classes and feel familiar with them. 
// But as you’ll soon discover, JavaScript classes are not quite like their C++, Java or C# counterparts.


// In class-based object-oriented languages like C++, Java and C#, classes are static blueprints (templates). When an object is created, the methods and properties of the class are copied into a new entity, called an instance. After instantiation, the newly created object has no relation whatsoever with its class.
// JavaScript’s object-oriented model is based on prototypes, not classes, to share properties and delegate behavior between objects. In JavaScript, a class is itself an object, not a static blueprint. “Instantiating” a class creates a new object linked to a prototype object. Regarding classes behavior, the JavaScript language is quite different from C++, Java or C#, but close to other object-oriented languages like Python, Ruby and Smalltalk.
// The JavaScript class syntax is merely a more convenient way to create relationships between objects through prototypes. Classes were introduced to emulate the class-based OOP model on top of JavaScript’s own prototype-based model. It’s an example of what programmers call syntactic sugar. The usefulness of the class syntax is a pretty heated debate in the JavaScript community.
