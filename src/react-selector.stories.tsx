import React from 'react';
import Selector, { SelectorItem, sortAsc } from './react-selector';
import mock from '../mock.json';

export default {
  title: 'Selector',
};

interface Item extends SelectorItem<Item> {
  first_name: string;
  last_name: string;
  [key: string]: string | Item;
}

export const MultiSelect = (): JSX.Element => (
  <Selector<Item>
    items={mock}
    display={'full_name'}
    orderBy={'last_name'}
    sort={sortAsc}
    keys={['full_name', 'first_name', 'last_name']}
    merge={{
      name: 'full_name',
      fields: ['first_name', 'last_name'],
      join: ' ',
    }}
  />
);
