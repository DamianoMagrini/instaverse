/**
 * @module comparison
 *
 * Compares two values. Supports operators (see the MATCH_OPERATOR_AND_VALUE
 * regex), ranges and multiple conditions (using ||).
 *
 * Dependencies
 *  - invariant (former 10289240, now @fbts/invariant)
 */

import invariant from '@fbts/invariant';

const MATCH_DOT = /\./;
const MATCH_DOUBLE_VERTICAL_BAR = /\|\|/;
const MATCH_DASH_SEPARATOR = /\s+\-\s+/;
const MATCH_OPERATOR_AND_VALUE = /^(<=|<|=|>=|~>|~|>|)?\s*(.+)/;
const MATCH_NUMBER_AND_CHARS = /^(\d*)(.*)/;

const parse_condition = (condition: string) => {
  const components = condition.split(MATCH_DOT);
  const operator_and_value = components[0].match(MATCH_OPERATOR_AND_VALUE);

  invariant(operator_and_value);

  return {
    modifier: operator_and_value[1],
    rangeComponents: [operator_and_value[2], ...components.slice(1)]
  };
};

const contains_multiple = (condition: string, target: string): boolean => {
  const conditions = condition.split(MATCH_DOUBLE_VERTICAL_BAR);

  if (conditions.length > 1)
    return conditions.some((single_condition) =>
      comparison.contains(single_condition, target)
    );

  return contains_single(conditions[0].trim(), target);
};

const get_modifier = (condition: string) =>
  !parse_condition(condition).modifier;

const contains_single = (condition: string, target: string) => {
  const range_parts = condition.split(MATCH_DASH_SEPARATOR);
  invariant(range_parts.length > 0 && range_parts.length <= 2);

  if (range_parts.length === 1) return compare_math(range_parts[0], target);

  const range_min = range_parts[0];
  const range_max = range_parts[1];
  invariant(!get_modifier(range_min) || !get_modifier(range_max));

  return (
    compare_math('>=' + range_min, target) &&
    compare_math('<=' + range_max, target)
  );
};

const compare_math = (condition: string, target: string) => {
  condition = condition.trim();
  if (condition === '') return true;

  const parsed_condition = parse_condition(condition);
  const search_targets = target.split(MATCH_DOT);
  const range_components = parsed_condition.rangeComponents;

  switch (parsed_condition.modifier) {
    case '<':
      return less(search_targets, range_components);
    case '<=':
      return less_or_equal(search_targets, range_components);
    case '>':
      return more(search_targets, range_components);
    case '>=':
      return more_or_equal(search_targets, range_components);
    case '~':
    case '~>':
      return almost_equal(search_targets, range_components);
    default:
      return equal(search_targets, range_components);
  }
};

const less = (targets: string[], range_components: string[]) =>
  compare_internal(targets, range_components) === -1;
const less_or_equal = (targets: string[], range_components: string[]) => {
  const result = compare_internal(targets, range_components);
  return result === -1 || result === 0;
};

const more = (targets: string[], range_components: string[]) =>
  compare_internal(targets, range_components) === 1;
const more_or_equal = (targets: string[], range_components: string[]) => {
  const result = compare_internal(targets, range_components);
  return result === 1 || result === 0;
};

const almost_equal = (targets: string[], range_components: string[]) => {
  const components = range_components.slice();
  if (components.length > 1) components.pop();

  const last_index = components.length - 1;
  const last_component_value = parseInt(components[last_index]);
  if (is_normal_number(last_component_value))
    components[last_index] = String(last_component_value + 1);

  return more_or_equal(targets, range_components) && less(targets, components);
};

const equal = (targets: string[], range_components: string[]) => {
  return compare_internal(targets, range_components) === 0;
};

const is_normal_number = (number: number) => !isNaN(number) && isFinite(number);

const pad_array = (array: any[], max_length: number) => {
  for (let index = array.length; index < max_length; index++)
    array[index] = '0';
};

const balance_targets_and_components = (
  targets: string[],
  range_components: string[]
) => {
  // Create a copy of the arguments, so as to not mutate the originals.
  targets = targets.slice();
  range_components = range_components.slice();

  pad_array(targets, range_components.length);

  for (
    let component_index = 0;
    component_index < range_components.length;
    component_index++
  ) {
    const [range_component] = range_components[component_index].match(
      /^[x*]$/i
    ) || [null];
    if (range_component)
      range_components[component_index] = targets[component_index] = '0';

    if (
      range_component === '*' &&
      component_index === range_components.length - 1
    )
      for (
        let target_index = component_index;
        target_index < targets.length;
        target_index++
      )
        targets[target_index] = '0';
  }

  pad_array(range_components, targets.length);
  return [targets, range_components];
};

const compare = (value_a: any, value_b: any) => {
  const parsed_a = parseInt(value_a.match(MATCH_NUMBER_AND_CHARS)[1], 10);
  const parsed_b = parseInt(value_b.match(MATCH_NUMBER_AND_CHARS)[1], 10);

  return is_normal_number(parsed_a) &&
    is_normal_number(parsed_b) &&
    parsed_a !== parsed_b
    ? compare_same_type(parsed_a, parsed_b)
    : compare_same_type(value_a, value_b);
};

const compare_same_type = <T>(a: T, b: T) => (a > b ? 1 : a < b ? -1 : 0);

function compare_internal(targets: string[], range_components: string[]) {
  const [
    balanced_targets,
    balanced_range_components
  ] = balance_targets_and_components(targets, range_components);

  for (let index = 0; index < balanced_range_components.length; index++) {
    const result = compare(
      balanced_targets[index],
      balanced_range_components[index]
    );
    if (result) return result;
  }

  return 0;
}

const comparison = {
  contains: (condition: string, target: string) =>
    contains_multiple(condition.trim(), target.trim())
};

export default comparison;
