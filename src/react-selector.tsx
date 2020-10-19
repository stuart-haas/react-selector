import React, { RefObject } from 'react';
import Fuse from 'fuse.js';
import './react-selector.scss';

export interface SelectorItem<T> {
  [key: string]: string | T;
}

interface Merge {
  name: string;
  fields: string[];
  join: string;
}

interface Compare {
  (a: string | number, b: string | number): number | boolean;
}

interface Props<Item> {
  items: Item[];
  selected?: Item[];
  keys: string[];
  display: string;
  merge?: Merge;
  sort?: Compare;
  orderBy?: string;
  placeholder?: string;
  noResults?: string;
  searchThreshold?: number;
}

interface State<Item> {
  items: Item[];
  selected: Item[];
  search: string;
  listActive: boolean;
  hasFocus: boolean;
  cursor: number;
}

export default class Selector<Item> extends React.Component<
  Props<Item>,
  State<Item>
> {
  wrapperRef: RefObject<HTMLDivElement> = React.createRef();
  inputRef: RefObject<HTMLInputElement> = React.createRef();

  fuse: Fuse<Item> = new Fuse([], {});
  items: Item[];

  constructor(props: Props<Item>) {
    super(props);
    this.state = {
      search: '',
      items: this.transformItems(this.props.items),
      selected: this.props.selected || [],
      listActive: false,
      hasFocus: false,
      cursor: 0,
    };

    document.removeEventListener(
      'mousedown',
      this.handleClickOutside.bind(this)
    );
  }

  componentDidMount(): void {
    this.fuse = new Fuse(this.props.items, {
      keys: this.props.keys,
      threshold: this.props.searchThreshold ? this.props.searchThreshold : 0.2,
    });
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  handleClickOutside(e: React.MouseEvent<HTMLDocument>): void {
    if (
      this.wrapperRef &&
      !this.wrapperRef.current.contains(e.target as HTMLDocument)
    ) {
      this.setState({
        hasFocus: false,
        listActive: false,
      });
    }
  }

  handleSearch(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target as HTMLInputElement;

    const { items, selected } = this.state;
    const filter = items.filter((a) => {
      return a['item'][this.props.display].toLowerCase() == value.toLowerCase();
    });
    const check = selected.filter((a) => {
      return a['item'][this.props.display].toLowerCase() == value.toLowerCase();
    });
    const search = !filter.length ? value : '';

    this.setState({
      search,
      items: search !== '' ? (this.search(search) as Item[]) : [],
      selected:
        filter.length && !check.length
          ? selected.concat(filter[0])
          : [...selected],
    });
  }

  handleTab(e: React.KeyboardEvent<HTMLInputElement>): void {
    const { items, selected } = this.state;
    const tab = e.keyCode == 9;

    if (tab && items.length == 1) {
      e.preventDefault();

      const check = selected.filter((a) => {
        return (
          a['item'][this.props.display].toLowerCase() ==
          items[0]['item'][this.props.display].toLowerCase()
        );
      });
      if (check.length) return;

      this.setState(
        {
          search: '',
          items: this.search() as Item[],
          selected: selected.concat(items[0]),
        },
        () => this.focus()
      );
    }
  }

  handleEnter(e: React.KeyboardEvent<HTMLInputElement>): void {
    const { items, selected, cursor } = this.state;
    const enter = e.keyCode == 13;

    if (enter && items.length) {
      const check =
        selected.length &&
        selected.filter((a) => {
          return (
            a['item'][this.props.display].toLowerCase() ==
            items[cursor]['item'][this.props.display].toLowerCase()
          );
        });
      if (check.length) return;

      this.setState(
        {
          search: '',
          selected: selected.concat(items[cursor]),
        },
        () => {
          this.focus();
        }
      );
    }
  }

  handleDelete(e: React.KeyboardEvent<HTMLInputElement>): void {
    const { value } = e.target as HTMLInputElement;
    const del = e.keyCode == 8;

    if (del && !value && this.state.selected.length) {
      const selected = [...this.state.selected];
      selected.pop();
      this.setState(
        {
          selected,
        },
        () => this.focus()
      );
    }
  }

  handleNavigateList(e: React.KeyboardEvent<HTMLInputElement>): void {
    const { cursor, items } = this.state;
    const up = e.keyCode == 38;
    const down = e.keyCode == 40;

    if (up && cursor > 0) {
      this.setState((prevState) => ({
        cursor: prevState.cursor - 1,
      }));
    } else if (down && cursor < items.length - 1) {
      this.setState((prevState) => ({
        cursor: prevState.cursor + 1,
      }));
    }
  }

  handleSelect(
    e: React.MouseEvent<HTMLElement>,
    item: Item,
    index: number
  ): void {
    e.stopPropagation();
    this.setState(
      {
        cursor: index,
        selected: !this.state.selected.includes(item)
          ? this.state.selected.concat(item)
          : this.state.selected.filter((a) => {
              return item !== a;
            }),
      },
      () => this.focus()
    );
  }

  handleRemove(e: React.MouseEvent<HTMLElement>, item: Item): void {
    this.setState(
      {
        selected: this.state.selected.filter((a) => {
          return (
            item[this.props.display].toLowerCase() !==
            a['item'][this.props.display].toLowerCase()
          );
        }),
      },
      () => this.focus()
    );
  }

  handleToggleActiveState(): void {
    this.focus();
  }

  search(value = ''): any[] {
    return value ? this.fuse.search(value) : [...this.items];
  }

  focus(): void {
    this.setState(
      {
        hasFocus: true,
        listActive: true,
      },
      () => this.inputRef.current?.focus()
    );
  }

  transformItems(items: Item[]): any[] {
    const mergeItems = this.props.merge
      ? this.merge(
          items,
          this.props.merge.name,
          this.props.merge.fields,
          this.props.merge.join
        )
      : items;
    const sortItems = this.props.sort
      ? this.sortBy(
          mergeItems,
          this.props.display,
          this.props.sort ? this.props.sort : sortAsc
        )
      : mergeItems;
    const wrappedItems = this.wrap(sortItems, 'item');
    return wrappedItems;
  }

  render(): JSX.Element {
    return (
      <div ref={this.wrapperRef} className='select'>
        <div
          className='select-search'
          onClick={() => {
            this.handleToggleActiveState();
          }}
        >
          <div className='select__selected'>
            {this.state.selected.map((item: Item, index: number) => (
              <div key={index} className='select__selected-tag'>
                <div className='select__selected-tag__label'>
                  {item['item'] && item['item'][this.props.display]}
                </div>
                <div
                  className='select__selected-tag__remove'
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    this.handleRemove(e, item['item'])
                  }
                ></div>
              </div>
            ))}
            <input
              type='text'
              ref={this.inputRef}
              placeholder={
                this.props.placeholder ? this.props.placeholder : 'Search...'
              }
              value={this.state.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                this.handleSearch(e);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.handleTab(e);
                this.handleEnter(e);
                this.handleDelete(e);
                this.handleNavigateList(e);
              }}
              onFocus={() => {
                this.setState({ hasFocus: true });
              }}
              onBlur={() => {
                this.setState({ hasFocus: false });
              }}
            />
          </div>
        </div>
        <ul
          className={
            (this.state.hasFocus || this.state.listActive ? 'visible ' : '') +
            'select-search__results'
          }
        >
          {this.state.items.map((item: Item, index: number) => (
            <li
              key={index}
              className={
                (this.state.selected.filter((a) => {
                  return (
                    item['item'] &&
                    item['item'][this.props.display].toLowerCase() ==
                      a['item'][this.props.display].toLowerCase()
                  );
                }).length
                  ? 'selected '
                  : '') +
                (this.state.cursor == index ? 'active ' : '') +
                'select-search__results-result'
              }
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                this.handleSelect(e, item, index)
              }
            >
              <label
                htmlFor={`item-${index}`}
                className='select-search__results-result__label'
              >
                {item['item'] && item['item'][this.props.display]}
              </label>
            </li>
          ))}
          {!this.state.items.length && (
            <li className='select-search__results-no-results'>
              {this.props.noResults
                ? this.props.noResults
                : 'No results for that search'}
            </li>
          )}
        </ul>
      </div>
    );
  }

  transform(array: Item[], keys: string[]): string[] {
    return array.map((item: Item) => {
      const obj = keys.map((key: string) => {
        return { [key]: item[key] };
      });
      return Object.assign({}, ...obj);
    });
  }

  merge(array: Item[], key: string, keys: string[], join: string): Item[] {
    return array.map((item) => {
      const merge = keys.map((key) => {
        return item[key];
      });
      item[key] = merge.join(join);
      return item;
    });
  }

  wrap(array: Item[], key: string): { [x: string]: Item }[] {
    return array.map((item: Item) => {
      return { [key]: item };
    });
  }

  flatten(array: Item[], key: string): Item[] {
    return array.map((item: Item) => {
      return item[key];
    });
  }

  groupBy(array: Item[], key: string): Record<string, unknown> {
    return array.reduce((result: Item, currentValue: Item) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      return result;
    }, {});
  }

  filterBy(
    array: Item[],
    key: string,
    value: string | number,
    compare: Compare = equals
  ): Item[] {
    return array.filter((item: Item) => {
      return compare(item[key], value);
    });
  }

  sortBy(array: Item[], key: string, compare: Compare = sortAsc): Item[] {
    return array.sort((a: Item, b: Item) => compare(a[key], b[key]) as number);
  }
}

export function sortAsc(a: string | number, b: string | number): number {
  return a > b ? 1 : -1;
}

export function sortDesc(a: string | number, b: string | number): number {
  return a < b ? 1 : -1;
}

export function equals(a: string | number, b: string | number): boolean {
  return a == b;
}

export function notEquals(a: string | number, b: string | number): boolean {
  return a !== b;
}
