import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import Selector, { SelectorItem } from './react-selector';

configure({ adapter: new Adapter() });

interface Item extends SelectorItem<Item> {
  test: string;
}

describe('Selector', () => {
  it('Renders selector', () => {
    const selector = shallow(
      <Selector<Item>
        items={[{ test: 'test' }]}
        display={'test'}
        keys={['test']}
      />
    );
    expect(selector).toMatchSnapshot();
  });
});
