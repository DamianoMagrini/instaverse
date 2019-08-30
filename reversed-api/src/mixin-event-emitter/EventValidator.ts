import copyProperties from './copyProperties';

const EventValidator = {
  addValidation: function addValidation(emitter, types) {
    const eventTypes = Object.keys(types);
    const emitterWithValidation = Object.create(emitter);

    copyProperties(emitterWithValidation, {
      emit: function emit(type, a, b, c, d, e, _) {
        assertAllowsEventType(type, eventTypes);
        return emitter.emit.call(this, type, a, b, c, d, e, _);
      }
    });

    return emitterWithValidation;
  }
};

function assertAllowsEventType(type, allowedTypes) {
  if (allowedTypes.indexOf(type) === -1) {
    throw new TypeError(errorMessageFor(type, allowedTypes));
  }
}

function errorMessageFor(type, allowedTypes) {
  let message = 'Unknown event type "' + type + '". ';
  if (process.env.NODE_ENV !== 'production') {
    message += recommendationFor(type, allowedTypes);
  }
  message += 'Known event types: ' + allowedTypes.join(', ') + '.';
  return message;
}

let recommendationFor;

if (process.env.NODE_ENV !== 'production') {
  recommendationFor = function(type, allowedTypes) {
    const closestTypeRecommendation = closestTypeFor(type, allowedTypes);
    if (isCloseEnough(closestTypeRecommendation, type)) {
      return 'Did you mean "' + closestTypeRecommendation.type + '"? ';
    } else {
      return '';
    }
  };

  const closestTypeFor = function(type, allowedTypes) {
    const typeRecommendations = allowedTypes.map(
      typeRecommendationFor.bind(this, type)
    );

    return typeRecommendations.sort(recommendationSort)[0];
  };

  const typeRecommendationFor = (type, recomendedType) => ({
    type: recomendedType,
    distance: damerauLevenshteinDistance(type, recomendedType)
  });

  const recommendationSort = function(recommendationA, recommendationB) {
    if (recommendationA.distance < recommendationB.distance) {
      return -1;
    } else if (recommendationA.distance > recommendationB.distance) {
      return 1;
    } else {
      return 0;
    }
  };

  const isCloseEnough = function(closestType, actualType) {
    return closestType.distance / actualType.length < 0.334;
  };

  const damerauLevenshteinDistance = function(
    string_a: string,
    string_b: string
  ) {
    const distances = [];

    for (let i = 0; i <= string_a.length; i++) {
      distances[i] = [i];
    }

    for (let j = 1; j <= string_b.length; j++) {
      distances[0][j] = j;
    }

    for (let x = 1; x <= string_a.length; x++) {
      for (let y = 1; y <= string_b.length; y++) {
        const cost = string_a.charAt(x - 1) === string_b.charAt(y - 1) ? 0 : 1;

        distances[x][y] = Math.min(
          distances[x - 1][y] + 1,
          distances[x][y - 1] + 1,
          distances[x - 1][y - 1] + cost
        );

        if (
          x > 1 &&
          y > 1 &&
          string_a.charAt(x - 1) === string_b.charAt(y - 2) &&
          string_a.charAt(x - 2) === string_b.charAt(y - 1)
        ) {
          distances[x][y] = Math.min(
            distances[x][y],
            distances[x - 2][y - 2] + cost
          );
        }
      }
    }

    return distances[string_a.length][string_b.length];
  };
}

export default EventValidator;
