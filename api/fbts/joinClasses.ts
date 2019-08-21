/**
 * Combines multiple className strings into one.
 */

function joinClasses(className: unknown): string {
  let newClassName = ((className as any) as string) || '';
  const argLength = arguments.length;

  if (argLength > 1) {
    for (let index = 1; index < argLength; index++) {
      const nextClass = arguments[index];

      if (nextClass) {
        newClassName = (newClassName ? newClassName + ' ' : '') + nextClass;
      }
    }
  }

  return newClassName;
}

export default joinClasses;
