/**
 * @module phonology
 *
 * Utilities for tweaking a string's pronunciation.
 *
 * Dependencies: none
 */

const ends_in_punct = (string: string): RegExpMatchArray => {
  return (
    typeof string === 'string' &&
    string.match(
      new RegExp(
        ends_in_punct.punct_char_class +
          '[)"\'»༻༽’”›〉》」』】〕〗〙〛〞〟﴿＇）］\\s]*$'
      )
    )
  );
};

ends_in_punct.punct_char_class = '[.!?。！？।…ຯ᠁ฯ．]';

interface PhonologicalRules {
  patterns: { [name: string]: string };
  meta: { [key: string]: any };
}

var phonological_rules: PhonologicalRules;

export default {
  endsInPunct: ends_in_punct,

  applyPhonologicalRules: function(string: string) {
    if (phonological_rules) {
      const pattern_names: string[] = [];
      const patterns: string[] = [];

      for (let pattern_name in phonological_rules.patterns) {
        let pattern = phonological_rules.patterns[pattern_name];

        for (var meta_index in phonological_rules.meta) {
          const meta_match = new RegExp(meta_index.slice(1, -1), 'g');
          const meta_replace = phonological_rules.meta[meta_index];
          pattern_name = pattern_name.replace(meta_match, meta_replace);
          pattern = pattern.replace(meta_match, meta_replace);
        }

        pattern_names.push(pattern_name), patterns.push(pattern);
      }

      for (
        let pattern_index = 0;
        pattern_index < pattern_names.length;
        pattern_index++
      ) {
        const pattern_match = new RegExp(
          pattern_names[pattern_index].slice(1, -1),
          'g'
        );
        if (patterns[pattern_index] === 'javascript')
          string.replace(pattern_match, function(value) {
            return value.slice(1).toLowerCase();
          });
        else string = string.replace(pattern_match, patterns[pattern_index]);
      }
    }

    return string.replace(/\x01/g, '');
  },

  setPhonologicalRules: function(rules: PhonologicalRules) {
    phonological_rules = rules;
  }
};
