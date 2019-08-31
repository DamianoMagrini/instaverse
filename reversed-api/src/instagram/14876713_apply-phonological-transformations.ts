/**
 * @module apply-phonological-transformations
 *
 * Apply phonological transformations to a text, and return the result.
 *
 * Dependencies:
 *  - invariant-ex (9502825)
 *  - phonology (14942208)
 */

import invariant_ex from './9502825_invariant-ex';
import phonology from './14942208_phonology';

const MATCH_SENTENCE = new RegExp(
  '\\{([^}]+)\\}(' + phonology.endsInPunct.punct_char_class + '*)',
  'g'
);

const apply_phonological_transformations = (
  text: string,
  transformations?: { [key: string]: string | object }
) => {
  if (!transformations) return text;

  invariant_ex(typeof transformations === 'object');

  const texts: object[] = [];
  const puncts: string[] = [];

  const conversation_blocks = text
    .replace(MATCH_SENTENCE, function($0: string, $1: string, $2: string) {
      const transformation = transformations[$1];
      if (transformation && typeof transformation === 'object') {
        texts.push(transformation);
        puncts.push($1);
        return '' + $2;
      } else if (transformation === null) {
        return '';
      } else
        return (
          transformation +
          (phonology.endsInPunct(transformation as string) ? '' : $2)
        );
    })
    .split('')
    .map(phonology.applyPhonologicalRules);

  if (conversation_blocks.length === 1) return conversation_blocks[0];

  const transformed_text: (string | object)[] = [conversation_blocks[0]];
  for (let index = 0; index < texts.length; index++) {
    transformed_text.push(texts[index], conversation_blocks[index + 1]);
  }

  return transformed_text;
};

export default apply_phonological_transformations;
