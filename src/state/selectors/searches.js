import { createSelector } from 'reselect';
import flatten from 'lodash/flatten';
import Annotation from '../../lib/Annotation';
import { getWindow } from './windows';

export const getSearchResultsForWindow = createSelector(
  [
    (state, { windowId }) => windowId,
    state => state.searches,
  ],
  (windowId, searches) => {
    if (!windowId || !searches) return [];

    return searches && searches[windowId];
  },
);

export const getSearchResultsForCompanionWindow = createSelector(
  [
    getSearchResultsForWindow,
    (state, { companionWindowId }) => companionWindowId,
  ],
  (results, companionWindowId) => {
    if (!results || !companionWindowId) return {};
    return results && results[companionWindowId];
  },
);

export const getSearchHitsForCompanionWindow = createSelector(
  [
    getSearchResultsForCompanionWindow,
  ],
  (result) => {
    if (!result || !result.json || result.isFetching || !result.json.hits) return [];
    return result.json.hits;
  },
);

export const getSearchAnnotationsForWindow = createSelector(
  [
    getSearchResultsForWindow,
  ],
  (results) => {
    if (!results) return [];
    return flatten(Object.values(results).map((result) => {
      if (!result || !result.json || result.isFetching || !result.json.resources) return [];
      const anno = new Annotation(result.json);
      return {
        id: anno.id,
        resources: anno.resources,
      };
    }));
  },
);

export const getSelectedContentSearchAnnotationIds = createSelector(
  [
    getWindow,
  ],
  window => (window && window.selectedContentSearchAnnotation) || [],
);


export const getSelectedContentSearchAnnotations = createSelector(
  [
    getSearchAnnotationsForWindow,
    getSelectedContentSearchAnnotationIds,
  ],
  (searchAnnotations, selectedAnnotationIds) => searchAnnotations.map(annotation => ({
    id: (annotation['@id'] || annotation.id),
    resources: annotation.resources.filter(
      r => selectedAnnotationIds && selectedAnnotationIds.includes(r.id),
    ),
  })).filter(val => val.resources.length > 0),
);