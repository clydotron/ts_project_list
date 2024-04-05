// // autobind decorator:
// function autobind(
//   _: any, //replace with _
//   _2: string,
//   descriptor: PropertyDescriptor
// ) {
//   const originalMethod = descriptor.value;
//   const adjDecriptor: PropertyDescriptor = {
//     configurable: true,
//     get() {
//       const boundFn = originalMethod.bind(this);
//       return boundFn;
//     }
//   };
//   return adjDecriptor;
//  }
// autobind decorator
// @TODO doesnt work for me
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

