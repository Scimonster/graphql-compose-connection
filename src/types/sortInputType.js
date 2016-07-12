/* @flow */
/* eslint-disable no-use-before-define */

import { TypeComposer } from 'graphql-compose';
import { GraphQLEnumType } from 'graphql';
import type {
  composeWithConnectionOpts,
  connectionSortOpts,
} from '../definition.js';
import { isFunction } from '../misc/is';

export function prepareSortType(
  typeComposer: TypeComposer,
  opts: composeWithConnectionOpts
): GraphQLEnumType {
  if (!opts.sort) {
    throw new Error('Option `sort` should not be empty in composeWithConnection');
  }

  const typeName = `SortConnection${typeComposer.getTypeName()}Input`;

  const sortKeys = Object.keys(opts.sort);
  if (sortKeys.length === 0) {
    throw new Error('You should provide at least one `sort` option '
                  + `for composeWithConnection(${typeComposer.getTypeName()}, opts) in opts.sort`);
  }

  const sortEnumValues = {};
  sortKeys.forEach(sortKey => {
    checkSortOpts(sortKey, opts.sort[sortKey], typeComposer);

    sortEnumValues[sortKey] = {
      name: sortKey,
      value: opts.sort[sortKey],
    };
  });

  const sortType = new GraphQLEnumType({
    name: typeName,
    values: sortEnumValues,
  });

  return sortType;
}


export function checkSortOpts(key: string, opts: connectionSortOpts, typeComposer: TypeComposer) {
  if (!opts.resolver) {
    throw new Error('You should provide `resolver` option '
                  + `for composeWithConnection in opts.sort.${key}`);
  }

  const resolver = typeComposer.getResolver(opts.resolver);
  if (!resolver) {
    throw new Error(`TypeComposer(${typeComposer.getTypeName()}) provided to composeWithConnection `
                  + `does not have resolver with name '${opts.resolver}' `
                  + `for opts.sort.${key}`);
  }

  if (!opts.uniqueFields || !Array.isArray(opts.uniqueFields)) {
    throw new Error('You should array of field(s) in `uniqueFields` '
                  + `for composeWithConnection in opts.sort.${key}`
                  + 'Ideally this field(s) should be in unique index. '
                  + 'Connection will work incorrectly, if some records have same values.');
  }

  if (!opts.sortValue) {
    throw new Error('You should provide `sortValue` '
                  + `for composeWithConnection in opts.sort.${key}. `
                  + 'Connections does not work without sorting.');
  }

  if (!opts.cursorToFilter || !isFunction(opts.cursorToFilter)) {
    throw new Error('You should provide `cursorToFilter` function '
                  + `for composeWithConnection in opts.sort.${key}. `
                  + 'Connections should have ability to filter record '
                  + 'by data dirived from cursor.');
  }
}